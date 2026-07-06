import { useQuery } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
import { LEGACY_COLLECTIONS } from '@/lib/legacyCurriculum';
import { queryKeys } from './queryKeys';

export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  level: string;
  progressPercentage?: number;
}

const PLACEHOLDER_COLLECTIONS: Collection[] = LEGACY_COLLECTIONS.map(({ sortOrder, ...c }) => ({
  ...c,
  progressPercentage: 0,
}));

export function useCollections(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.collections(userId ?? ''),
    enabled: !!userId,
    staleTime: 5 * 60_000,
    gcTime:   30 * 60_000,
    placeholderData: PLACEHOLDER_COLLECTIONS,
    queryFn: async () => {
      try {
        return await api.get<Collection[]>(`/api/collections?userId=${userId}`);
      } catch {
        console.warn('Collections API unavailable, using local data');
        return PLACEHOLDER_COLLECTIONS;
      }
    },
  });
}
