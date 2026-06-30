require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { guestAuthRouter } = require('./auth/guest.route.cjs');


const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(cookieParser());

app.use(guestAuthRouter);

const JLPT_LEVELS = new Set(['N5', 'N4', 'N3', 'N2', 'N1']);
const EXAM_SECTIONS = ['vocabulary', 'grammar', 'reading', 'listening'];

async function fetchSectionQuestions(level, section, limit = 10) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required for exam generation');
  }

  const url = `${supabaseUrl}/rest/v1/practice_questions?select=*&level=eq.${encodeURIComponent(level)}&section=eq.${encodeURIComponent(section)}&is_exam_ready=eq.true&limit=${limit}`;
  const res = await fetch(url, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload?.message || `Failed to fetch exam section (${section})`);
  }
  return Array.isArray(payload) ? payload : [];
}

app.get('/exam/generate', async (req, res) => {
  try {
    const level = (req.query.level || 'N5').toString().toUpperCase();
    if (!JLPT_LEVELS.has(level)) {
      return res.status(400).json({ message: 'Invalid JLPT level' });
    }

    const sectionEntries = await Promise.all(
      EXAM_SECTIONS.map(async (section) => {
        const questions = await fetchSectionQuestions(level, section, 12);
        return [section, questions];
      })
    );

    const sections = Object.fromEntries(sectionEntries);
    return res.json({
      level,
      generatedAt: new Date().toISOString(),
      sections,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Could not generate exam' });
  }
});

// Example protected read route: guests are allowed.
app.get('/api/content', authGuest(), (req, res) => {
  res.json({ items: ['dashboard', 'roadmap', 'practice'] });
});



// Example protected write route: guests are blocked by authGuest().
app.post('/api/content', authGuest(), (_req, res) => {
  res.status(201).json({ ok: true });
});

function base64ToBuffer(base64) {
  return Buffer.from(base64, 'base64');
}

function normalize(str) {
  return (str || '').toString().trim().toLowerCase();
}

function similarityPercent(a, b) {
  const aa = normalize(a);
  const bb = normalize(b);
  if (!aa || !bb) return 0;
  if (aa === bb) return 100;
  const maxLen = Math.max(aa.length, bb.length);
  let same = 0;
  for (let i = 0; i < Math.min(aa.length, bb.length); i += 1) {
    if (aa[i] === bb[i]) same += 1;
  }
  return Math.max(0, Math.round((same / maxLen) * 100));
}



app.post('/api/pronunciation/score', async (req, res) => {
  try {
    const { audioBase64, targetText } = req.body || {};
    if (!audioBase64 || !targetText) {
      return res.status(400).json({ message: 'audioBase64 and targetText are required' });
    }

    const hfToken = process.env.HF_API_TOKEN;
    const hfModel = process.env.HF_JA_ASR_MODEL || 'kotoba-tech/kotoba-whisper-v2.0';
    if (!hfToken) {
      return res.status(503).json({
        message: 'HF_API_TOKEN is not configured for pronunciation scoring',
      });
    }

    const audioBuffer = base64ToBuffer(audioBase64);
    const asrRes = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'audio/webm',
      },
      body: audioBuffer,
    });

    const asrPayload = await asrRes.json();
    if (!asrRes.ok) {
      return res.status(502).json({
        message: asrPayload?.error || `ASR request failed (${asrRes.status})`,
      });
    }

    const transcript = (asrPayload?.text || '').toString().trim();
    const pronunciationScore = similarityPercent(transcript, targetText);
    // Temporary accent proxy until OJAD contour integration is added.
    const pitchAccentScore = Math.max(40, pronunciationScore - 8);

    return res.json({
      transcript,
      pronunciationScore,
      pitchAccentScore,
      suggestions: pronunciationScore < 75
        ? [
            'Speak slightly slower and keep mora timing even.',
            'Repeat while shadowing native audio 2-3 times.',
            'Focus on vowel length and small-tsu pauses.',
          ]
        : ['Good clarity. Next: refine pitch accent contour.'],
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Pronunciation scoring failed' });
  }
});

if (require.main === module) {
  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Guest auth server running on http://localhost:${port}`);
  });
}

module.exports = { app };
