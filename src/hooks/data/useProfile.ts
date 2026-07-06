import { useQuery } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
import { queryKeys } from './queryKeys';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profile(userId ?? ''),
    enabled: !!userId,
    staleTime: 30_000,
    queryFn: () => api.get<Profile>(`/api/profiles/${userId}`),
  });
}
