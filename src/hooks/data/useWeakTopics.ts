import { useQuery } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
import { queryKeys } from './queryKeys';

export interface WeakTopicRow {
  id: string;
  user_id: string;
  topic: string;
  skill_area: string;
  mistakes_count: number;
  last_seen_at: string;
}

export function useWeakTopics(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.weakTopics(userId ?? ''),
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: () => api.get<WeakTopicRow[]>(`/api/weak-topics/${userId}`),
  });
}
