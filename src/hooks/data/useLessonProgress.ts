import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from './queryKeys';
import { invalidateLessonCompletion } from './invalidation';

/**
 * useLessonProgress — fetches lesson_progress for a user at a given level.
 */
export function useLessonProgress(userId: string | undefined, level: string) {
  return useQuery({
    queryKey: queryKeys.lessonProgress(userId ?? '', level),
    enabled: !!userId && !!level,
    staleTime: 30_000,
    queryFn: async () => {
      // Joins can be complex with Supabase direct for hierarchical filtering, 
      // but we filter by userId on the lesson_progress table.
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId!)
        .eq('level', level);

      if (error) throw error;
      return data ?? [];
    },
  });
}

/**
 * useNextLesson — retrieves the next incomplete or active lesson for the user.
 */
export function useNextLesson(userId: string | undefined, level: string) {
  return useQuery({
    queryKey: queryKeys.nextLesson(userId ?? '', level),
    enabled: !!userId && !!level,
    staleTime: 30_000,
    queryFn: async () => {
      // Attempt to find the first lesson that is CURRENT or (LOCKED AND NOT COMPLETED)
      // For now, simpler: get all lessons from catalog and compare with progress
      const { data: progress } = await supabase
        .from('lesson_progress')
        .select('lesson_id, completed')
        .eq('user_id', userId!);
      
      const { data: lessons } = await supabase
        .from('lessons' as any)
        .select('id')
        .eq('level', level)
        .order('sort_order', { ascending: true });

      if (!lessons) return null;

      const completedIds = progress?.filter((p: any) => p.completed).map((p: any) => String(p.lesson_id)) || [];
      const next = lessons.find(l => !completedIds.includes(l.id));
      
      return next ? next.id : null;
    },
  });
}

/** Lesson completion mutation — writes directly to sessions and updates progress */
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
        ? Math.floor((answers.filter(a => a.is_correct).length / answers.length) * 100)
        : 100;

      if (answers.length > 0) {
        const { data, error } = await supabase.rpc('complete_lesson', {
          p_lesson_id: lessonId,
          p_quiz_answers: answers as any,
          p_time_spent_sec: timeSpentSec ?? 0,
        });

        if (error) throw error;
        return data ?? { score };
      }

      const { data: lessonRow, error: lessonErr } = await supabase
        .from('lesson_catalog')
        .select('level, week_number')
        .eq('id', lessonId)
        .single();

      if (lessonErr) throw lessonErr;

      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          level: lessonRow.level,
          week_number: lessonRow.week_number,
          completed: true,
          completed_at: new Date().toISOString(),
          quiz_score: score,
          time_spent_sec: timeSpentSec ?? 0,
        }, {
          onConflict: 'user_id,lesson_id',
        });

      if (error) throw error;
      return { score };
    },
    onSuccess: () => {
      invalidateLessonCompletion(qc, userId, level);
    },
  });
}
