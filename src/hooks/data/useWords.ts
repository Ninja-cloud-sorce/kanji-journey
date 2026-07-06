import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
import { queryKeys } from './queryKeys';
import { getN5Vocabulary } from '@/data/mockData';

export interface JLPTWord {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  level: string;
  example?: string;
  exampleMeaning?: string;
}

function getLocalWords(level: string): JLPTWord[] {
  if (level === 'N5') return getN5Vocabulary(50) as JLPTWord[];
  return [];
}

export function useWordsByLevel(level: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: queryKeys.words(level, limit, offset),
    queryFn: () => getLocalWords(level).slice(offset, offset + limit),
    staleTime: 5 * 60_000,
  });
}

export function useWordDetails(word: string, level: string) {
  return useQuery({
    queryKey: queryKeys.wordLookup(word),
    queryFn: () => getLocalWords(level).find((e) => e.word === word || e.id === word) ?? null,
    enabled: !!word,
  });
}

export function useAddToFlashcards() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, wordId }: { userId: string; wordId: string }) => {
      const word = getLocalWords('N5').find((e) => e.id === wordId);
      if (!word) throw new Error('Word not found');

      return api.post('/api/flashcards', {
        user_id:          userId,
        lesson_id:        null,
        front:            word.word,
        back:             word.meaning,
        next_review_date: new Date().toISOString().slice(0, 10),
        review_state:     'new',
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcardsDue(variables.userId) });
    },
  });
}
