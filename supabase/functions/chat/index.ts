import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.2";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Default Gemini models – only supported stable versions
const DEFAULT_MODEL = "gemini-1.5-flash";
const DEFAULT_FALLBACK_MODEL = "gemini-1.5-flash-8b";

// System instruction defining the Scholar AI personality
const SYSTEM_INSTRUCTION = `You are Scholar AI, a Japanese learning mentor. Answer concisely, accurately, and warmly. Focus on Japanese‑learning queries; for unrelated chit‑chat respond in a friendly, helpful tone. If you do not know an answer, say you don't know rather than guessing. Keep responses short, use bullet points when appropriate, and never mention internal system details.`;

type GeminiContent = {
  role: "user" | "model";
  parts: Array<{ text: string }>;
};

type GeminiResponse = {
  error?: { message?: string };
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

/** Utility helpers **/
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
}
function isRateLimitError(msg: string): boolean {
  const n = msg.toLowerCase();
  return n.includes("429") || n.includes("rate limit") || n.includes("quota");
}
function isHighDemandError(msg: string): boolean {
  const n = msg.toLowerCase();
  return n.includes("503") || n.includes("service unavailable") || n.includes("high demand");
}
function isModelUnavailableError(msg: string): boolean {
  const n = msg.toLowerCase();
  return n.includes("not found") || n.includes("unsupported model") || n.includes("is not supported for generatecontent");
}

/** Simple in‑memory LRU cache with TTL **/
class SimpleCache {
  constructor(public ttlMs = 3_600_000, public maxSize = 200) {
    this.cache = new Map();
  }
  cache: Map<string, { val: string; expiry: number }>;
  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.val;
  }
  set(key: string, val: string) {
    if (this.cache.size >= this.maxSize) {
      const first = this.cache.keys().next().value;
      this.cache.delete(first);
    }
    this.cache.set(key, { val, expiry: Date.now() + this.ttlMs });
  }
  clear() {
    this.cache.clear();
  }
}
const responseCache = new SimpleCache();

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Static routing for well‑known FAQs **/
function getStaticResponse(message: string): string | null {
  const msg = message.trim().toLowerCase();
  // JLPT schedule
  if (/\bjlpt\b.*\b(date|when|schedule|closest|next)\b/.test(msg) || /closest jlpt/.test(msg)) {
    return `The JLPT is held twice a year: first Sunday of July and first Sunday of December. The next upcoming exam is on the first Sunday of July 2026.`;
  }
  // Book recommendations
  if (/\b(book|textbook|resource)\b.*\b(recommend|suggest|best|refer|buy|learn)\b/.test(msg) || /which book/.test(msg)) {
    return `Recommended textbooks for beginners: **Genki I & II** and **Minna no Nihongo**. For kanji, consider **Remembering the Kanji**. For JLPT prep, try **Shin Kanzen Master** series.`;
  }
  // SRS FAQ
  if (/\b(srs|flashcard|spaced repetition)\b/.test(msg)) {
    return `SRS (Spaced Repetition System) schedules cards so you review them just before you forget. Grades: 1 (Again) -> 1 day, 3 (Good) -> increase interval, 4 (Easy) -> large interval jump.`;
  }
  return null;
}

/** Gemini request helper **/
async function callGemini(apiKey: string, model: string, contents: GeminiContent[]) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    generationConfig: { maxOutputTokens: 500, temperature: 0.45 },
    contents,
  };
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await resp.json().catch(() => ({})) as GeminiResponse;
  if (!resp.ok) {
    const msg = json?.error?.message || `Gemini HTTP ${resp.status}`;
    throw new Error(`${resp.status} ${msg}`);
  }
  const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini returned an empty response.");
  return text;
}

/** Main request handler **/
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Authentication is required." }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse({ error: "Supabase Edge Function environment is incomplete." }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return jsonResponse({ error: "Invalid or expired session." }, 401);
  }

  // Load config from environment – only the allowed models are used
  const modelName = Deno.env.get("GEMINI_MODEL") ?? DEFAULT_MODEL;
  const fallbackModelName = Deno.env.get("GEMINI_FALLBACK_MODEL") ?? DEFAULT_FALLBACK_MODEL;
  const apiKey = Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("GOOGLE_API_KEY");
  if (!apiKey) {
    return jsonResponse({ error: "Gemini API key missing in Edge Function secrets." }, 500);
  }
  let payload: { message: string; history?: Array<{ role: string; content: string }> };
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON payload." }, 400);
  }
  const { message, history = [] } = payload;
  if (!message || typeof message !== "string" || !message.trim()) {
    return jsonResponse({ error: "Message content is required." }, 400);
  }
  const trimmedMsg = message.trim();
  if (trimmedMsg.length > 2_000) {
    return jsonResponse({ error: "Message is too long." }, 413);
  }

  // 1️⃣ Check static routing first
  const staticResp = getStaticResponse(trimmedMsg);
  if (staticResp) {
    return jsonResponse({ reply: staticResp });
  }

  // 2️⃣ Build short‑term conversation window (last 6 messages)
  const recentTurns = (Array.isArray(history) ? history : [])
    .filter((h) => (h.role === "user" || h.role === "assistant") && typeof h.content === "string")
    .slice(-6)
    .map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content.slice(0, 2_000) }]
    }));

  // Ensure history starts with a user turn if there is history
  while (recentTurns.length > 0 && recentTurns[0].role !== 'user') {
    recentTurns.shift();
  }

  // Merge consecutive same-role messages
  const mergedRecent: typeof recentTurns = [];
  for (const turn of recentTurns) {
    if (mergedRecent.length > 0 && mergedRecent[mergedRecent.length - 1].role === turn.role) {
      mergedRecent[mergedRecent.length - 1].parts[0].text += "\n" + turn.parts[0].text;
    } else {
      mergedRecent.push(turn);
    }
  }

  // 3️⃣ Cache lookup only for stateless requests. Conversation history changes
  // the correct answer, so caching contextual replies by message alone is unsafe.
  const cacheKey = trimmedMsg.toLowerCase();
  const canUseCache = mergedRecent.length === 0;
  if (canUseCache) {
    const cached = responseCache.get(cacheKey);
    if (cached) {
      return jsonResponse({ reply: cached });
    }
  }

  const contents = [
    ...mergedRecent,
    { role: "user", parts: [{ text: trimmedMsg }] }
  ];

  // 4️⃣ Attempt primary model, then fallback, then degraded answer
  const modelsToTry = [modelName, fallbackModelName].filter(Boolean);
  const tried = new Set<string>();
  let reply: string | null = null;
  let primaryError: unknown = null;
  for (const m of modelsToTry) {
    if (!m || tried.has(m)) continue;
    tried.add(m);
    try {
      reply = await callGemini(apiKey, m, contents);
      if (reply) break;
    } catch (e) {
      primaryError = e;
      const msg = getErrorMessage(e);
      if (isModelUnavailableError(msg) || isRateLimitError(msg) || isHighDemandError(msg)) {
        // Continue to next model
        continue;
      } else {
        // Unexpected error – abort loop
        break;
      }
    }
  }

  // 5️⃣ Degraded fallback if still no reply
  if (!reply) {
    let status = 500;
    let errMsg = "An unexpected error occurred.";
    if (primaryError) {
      const msg = getErrorMessage(primaryError);
      errMsg = msg;
      if (isRateLimitError(msg)) {
        status = 429;
      } else if (isHighDemandError(msg)) {
        status = 503;
      }
    }
    return jsonResponse({ error: errMsg }, status);
  }

  // Store in cache (short TTL - 5 min)
  if (canUseCache) {
    responseCache.set(cacheKey, reply);
  }

  // Return response
  return jsonResponse({ reply });
});
