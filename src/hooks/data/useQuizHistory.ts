import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from './queryKeys';

/**
 * useQuizHistory — fetches recent session results for the user history.
 */
export function useQuizHistory(userId: string | undefined, limit = 20) {
  return useQuery({
    queryKey: queryKeys.quizHistory(userId ?? ''),
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select(`
          id,
          created_at,
          completed_at,
          quiz_score,
          time_spent_sec,
          lesson_id,
          lesson_catalog:lesson_id (
            title,
            skill_area
          )
        `)
        .eq('user_id', userId!)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        created_at: row.completed_at ?? row.created_at,
        type: row.lesson_catalog?.skill_area ?? 'lesson',
        score: row.quiz_score ?? 0,
        duration_sec: row.time_spent_sec ?? 0,
        lesson_id: row.lesson_id,
        lessons: row.lesson_catalog ? { title: row.lesson_catalog.title } : null,
      }));
    },
  });
}
