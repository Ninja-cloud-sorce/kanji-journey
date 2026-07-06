import { useQuery } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
import { queryKeys } from './queryKeys';

export interface QuizHistoryRow {
  id: string;
  created_at: string;
  type: string;
  score: number;
  duration_sec: number;
  lesson_id: string;
  lessons: { title: string } | null;
}

export function useQuizHistory(userId: string | undefined, limit = 20) {
  return useQuery({
    queryKey: queryKeys.quizHistory(userId ?? ''),
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: () =>
      api.get<QuizHistoryRow[]>(`/api/quiz-history/${userId}?limit=${limit}`),
  });
}
