import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from './queryKeys';

/**
 * useProfile — fetches the authenticated user's profile row.
 *
 * Uses React Query so the same data is shared across all components that
 * need it, and re-fetched automatically after mutations that invalidate
 * the 'profile' key.
 */
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profile(userId ?? ''),
    enabled: !!userId,
    staleTime: 30_000, // treat as fresh for 30 s
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}
