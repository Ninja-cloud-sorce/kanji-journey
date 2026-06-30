import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

async function extractFunctionErrorMessage(error: unknown) {
  if (!error) return 'The Oracle is temporarily silent.';

  const maybeError = error as {
    context?: Response;
    message?: string;
    name?: string;
  };

  // Supabase FunctionsHttpError exposes the underlying Response as `context`.
  const response = maybeError.context;
  if (response && typeof response.clone === 'function') {
    try {
      const payload = await response.clone().json();
      if (payload?.error) return payload.error;
      if (payload?.message) return payload.message;
    } catch {
      try {
        const text = await response.clone().text();
        if (text) return text;
      } catch { /* ignore */ }
    }
  }

  if (maybeError?.name === 'FunctionsRelayError') {
    return 'Supabase could not reach the chat Edge Function. Verify that the `chat` function is deployed and healthy.';
  }

  if (maybeError?.name === 'FunctionsFetchError') {
    return 'The app could not contact Supabase Functions. Check your network connection and Supabase project URL.';
  }

  if (error instanceof Error) return error.message;
  return String(error);
}

export function useChatMessages(userId: string | undefined) {
  return useQuery({
    queryKey: ['chat-messages', userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to prevent refetching on panel toggle
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ChatMessage[];
    },
  });
}

export function useSendMessage(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      if (!userId) throw new Error("Anonymous inquiries are not recorded in the archives.");

      // 1. Try to read from query cache first, fallback to DB query
      let history: Array<{ role: 'user' | 'assistant'; content: string }> = [];
      const cachedMessages = qc.getQueryData<ChatMessage[]>(['chat-messages', userId]);
      if (cachedMessages) {
        history = cachedMessages.slice(-10).map(m => ({
          role: m.role,
          content: m.content
        }));
      } else {
        const { data: historyData } = await supabase
          .from('chat_messages')
          .select('role, content')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })
          .limit(10);
        
        history = historyData?.map(m => ({ 
          role: m.role as 'user' | 'assistant', 
          content: m.content 
        })) || [];
      }

      // 2. Persist user inquiry to the Oracle's Scribe (Supabase)
      const { data: userMsg, error: uErr } = await supabase
        .from('chat_messages')
        .insert({ user_id: userId, role: 'user', content })
        .select()
        .single();

      if (uErr) {
        console.error("[Scribe Error] Failed to record user message:", uErr);
        throw new Error(`Failed to record your inquiry: ${uErr.message}`);
      }

      // 3. Optimistically update the cache to show user's inquiry immediately
      qc.setQueryData<ChatMessage[]>(['chat-messages', userId], (old) => {
        if (!old) return [userMsg as ChatMessage];
        return [...old, userMsg as ChatMessage];
      });

      try {
        // 4. Inquire with the Serverless Oracle (Supabase Edge Function)
        const { data, error: fErr } = await supabase.functions.invoke('chat', {
          body: { message: content, history }
        });

        if (fErr) {
          const extracted = await extractFunctionErrorMessage(fErr);
          console.error("[Oracle Error] Function invocation failed:", extracted);
          throw new Error(extracted);
        }

        if (!data || typeof data !== 'object') {
           throw new Error('The Oracle returned an unreadable scroll (Invalid Response).');
        }

        if (data.error) {
           throw new Error(data.error);
        }

        if (!data.reply) {
           throw new Error('Assistant is silent. Verify the Gemini API key in Supabase Edge Function secrets.');
        }

        const reply = data.reply;
        
        // 5. Scribe the Oracle's Response
        const { data: assistantMsg, error: aErr } = await supabase
          .from('chat_messages')
          .insert({ user_id: userId, role: 'assistant', content: reply })
          .select()
          .single();

        if (aErr) {
          console.error("[Scribe Error] Failed to record assistant reply:", aErr);
          throw new Error(`Failed to record the Oracle's reply: ${aErr.message}`);
        }

        // 6. Optimistically update the cache with the assistant reply
        qc.setQueryData<ChatMessage[]>(['chat-messages', userId], (old) => {
          if (!old) return [userMsg as ChatMessage, assistantMsg as ChatMessage];
          const hasUserMsg = old.some(m => m.id === userMsg.id);
          if (hasUserMsg) {
            return [...old.filter(m => m.id !== assistantMsg.id), assistantMsg as ChatMessage];
          }
          return [...old, userMsg as ChatMessage, assistantMsg as ChatMessage];
        });

        return { userMsg, assistantMsg };
      } catch (err) {
        console.error("The Oracle has gone dormant:", err);
        throw err;
      }
    },
  });
}
