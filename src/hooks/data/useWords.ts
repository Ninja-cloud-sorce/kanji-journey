import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { getN5Vocabulary } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';

export interface JLPTWord {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  level: string;
  example?: string;
  exampleMeaning?: string;
}

function getLocalWords(level: string) {
  if (level === 'N5') return getN5Vocabulary(50);
  return [];
}

export function useWordsByLevel(level: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: ['words', level, limit, offset],
    queryFn: async () => {
      return getLocalWords(level).slice(offset, offset + limit);
    },
    staleTime: 5 * 60_000,
  });
}

export function useWordDetails(word: string, level: string) {
  return useQuery({
    queryKey: ['word-lookup', word],
    queryFn: async () => {
      return getLocalWords(level).find((entry) => entry.word === word || entry.id === word) ?? null;
    },
    enabled: !!word,
  });
}

export function useAddToFlashcards() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, wordId }: { userId: string, wordId: string }) => {
      const word = getLocalWords('N5').find((entry) => entry.id === wordId);
      if (!word) throw new Error('Word not found');

      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          user_id: userId,
          lesson_id: null,
          front: word.word,
          back: word.meaning,
          next_review_date: new Date().toISOString().slice(0, 10),
          review_state: 'new',
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['flashcards-due', variables.userId] });
    }
  });
}
