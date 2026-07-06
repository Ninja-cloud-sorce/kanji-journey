import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
import { queryKeys } from './queryKeys';
import { invalidateLessonCompletion } from './invalidation';

export interface LessonProgressRow {
  id: string;
  user_id: string;
  lesson_id: string;
  level: string;
  week_number: number;
  completed: boolean;
  completed_at: string | null;
  quiz_score: number | null;
  time_spent_sec: number;
  created_at: string;
}

export function useLessonProgress(userId: string | undefined, level: string) {
  return useQuery({
    queryKey: queryKeys.lessonProgress(userId ?? '', level),
    enabled: !!userId && !!level,
    staleTime: 30_000,
    queryFn: () =>
      api.get<LessonProgressRow[]>(`/api/lesson-progress/${userId}?level=${encodeURIComponent(level)}`),
  });
}

export function useNextLesson(userId: string | undefined, level: string) {
  return useQuery({
    queryKey: queryKeys.nextLesson(userId ?? '', level),
    enabled: !!userId && !!level,
    staleTime: 30_000,
    queryFn: async () => {
      const [progressRows, catalogRows] = await Promise.all([
        api.get<LessonProgressRow[]>(`/api/lesson-progress/${userId}?level=${encodeURIComponent(level)}`),
        api.get<{ id: string }[]>(`/api/lessons/catalog?level=${encodeURIComponent(level)}`),
      ]);
      const completedIds = new Set(progressRows.filter((p) => p.completed).map((p) => p.lesson_id));
      const next = catalogRows.find((l) => !completedIds.has(l.id));
      return next?.id ?? null;
    },
  });
}

export interface QuizAnswer {
  question_id: string;
  question_text: string;
  correct_answer: string;
  user_answer: string;
  is_correct: boolean;
  skill_area: string;
  topic: string;
}

export function useCompleteLesson(userId: string, level: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lessonId,
      answers,
      timeSpentSec,
    }: {
      lessonId: string;
      answers: QuizAnswer[];
      timeSpentSec?: number;
    }) => {
      const score = answers.length > 0
        ? Math.floor((answers.filter((a) => a.is_correct).length / answers.length) * 100)
        : 100;

      const rpcAnswers = answers.map((a) => ({
        question:       a.question_text,
        correct_answer: a.correct_answer,
        is_correct:     a.is_correct,
      }));

      const result = await api.post<{ xp_gain: number; new_xp: number; new_streak: number }>(
        '/api/complete-lesson',
        { userId, lessonId, answers: rpcAnswers, score, timeSpentSec: timeSpentSec ?? 0, level }
      );

      return { score, ...result };
    },
    onSuccess: () => {
      invalidateLessonCompletion(qc, userId, level);
    },
  });
}
