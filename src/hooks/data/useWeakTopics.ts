import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from './queryKeys';

/**
 * useWeakTopics — returns the user's weak topics calculated from recent sessions.
 */
export function useWeakTopics(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.weakTopics(userId ?? ''),
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weak_topics')
        .select('id, topic, skill_area, mistakes_count, last_seen_at, user_id')
        .eq('user_id', userId!)
        .order('mistakes_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data ?? [];
    },
  });
}
