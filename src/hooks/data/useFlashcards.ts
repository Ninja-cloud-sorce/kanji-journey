import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
import { queryKeys } from './queryKeys';

export type FlashcardWithLegacy = {
  id: string;
  user_id: string;
  lesson_id: string | null;
  front: string;
  back: string;
  review_state: string;
  ease_factor: number;
  interval_days: number;
  next_review_date: string;
  reviews_total: number;
  reviews_correct: number;
  created_at: string;
  updated_at: string;
  // Legacy aliases used by components
  collection_id?: string | null;
  srs_level: number;
  next_review: string;
  hint: string;
};

function toLegacy(card: Omit<FlashcardWithLegacy, 'collection_id' | 'srs_level' | 'next_review' | 'hint'>): FlashcardWithLegacy {
  return {
    ...card,
    collection_id: null,
    srs_level: card.review_state === 'review' ? 3 : card.review_state === 'learning' ? 2 : 1,
    next_review: card.next_review_date,
    hint: card.back,
  };
}

export function useFlashcardsDue(userId: string | undefined, collectionId?: string | null) {
  return useQuery({
    queryKey: queryKeys.flashcardsDue(userId ?? '', collectionId),
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      const path = `/api/flashcards/${userId}/due${collectionId ? `?collectionId=${collectionId}` : ''}`;
      const cards = await api.get<FlashcardWithLegacy[]>(path);
      return cards.map(toLegacy);
    },
  });
}

export function useFlashcards(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.flashcards(userId ?? ''),
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      const cards = await api.get<FlashcardWithLegacy[]>(`/api/flashcards/${userId}`);
      return cards.map(toLegacy);
    },
  });
}

export function useCreateFlashcard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      user_id: string;
      lesson_id?: string | null;
      front: string;
      back: string;
      next_review_date?: string;
      review_state?: string;
    }) => {
      return api.post<FlashcardWithLegacy>('/api/flashcards', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcards(variables.user_id) });
    },
  });
}

export function useReviewFlashcard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ cardId, grade, userId }: { cardId: string; grade: number; userId: string }) => {
      return api.post<FlashcardWithLegacy>(`/api/flashcards/${cardId}/review`, { grade });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcardsDue(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcards(variables.userId) });
    },
  });
}
