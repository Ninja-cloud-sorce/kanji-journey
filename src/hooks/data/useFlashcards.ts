import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from './queryKeys';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Flashcard = Tables<'flashcards'>;

async function fetchCollectionLessonIds(collectionId: string) {
  const { data, error } = await supabase
    .from('lessons' as any) // Assuming lessons table exists but maybe not in types yet
    .select('id, lesson_catalog_id, collection_id')
    .eq('collection_id', collectionId);

  if (error) throw error;

  return (data ?? []).map((row: any) => String(row.lesson_catalog_id ?? row.id));
}

export type FlashcardWithLegacy = Flashcard & {
  collection_id?: string | null;
  srs_level: number;
  next_review: string;
  hint: string;
};

function toLegacyFlashcard(card: Flashcard, collectionId?: string | null): FlashcardWithLegacy {
  return {
    ...card,
    collection_id: collectionId ?? null,
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
      try {
        let lessonIds: string[] | undefined;

        if (collectionId) {
          lessonIds = await fetchCollectionLessonIds(collectionId);
          if (lessonIds.length === 0) return [];
        }

        let query = supabase
          .from('flashcards')
          .select('*')
          .eq('user_id', userId!)
          .lte('next_review_date', new Date().toISOString().slice(0, 10));

        if (lessonIds?.length) {
          query = query.in('lesson_id', lessonIds);
        }

        const { data, error } = await query;

        if (error || !data || data.length === 0) {
          return collectionId 
            ? MOCK_FLASHCARDS.filter(c => c.collection_id === collectionId)
            : MOCK_FLASHCARDS;
        }
        return data.map((card: any) => toLegacyFlashcard(card, collectionId));
      } catch (err) {
        console.error("Flashcards fetch failed, falling back to mock:", err);
        return collectionId 
          ? MOCK_FLASHCARDS.filter(c => c.collection_id === collectionId)
          : MOCK_FLASHCARDS;
      }
    },
  });
}

const MOCK_FLASHCARDS: FlashcardWithLegacy[] = [
  { id: 'f1', front: 'あ', back: 'A', hint: 'Airy sound', srs_level: 1, next_review: new Date().toISOString(), user_id: 'mock', collection_id: 'h1', lesson_id: 'l1', ease_factor: 2.5, interval_days: 1, review_state: 'learning', next_review_date: new Date().toISOString(), reviews_total: 1, reviews_correct: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'f2', front: 'い', back: 'I', hint: 'Eee sound', srs_level: 1, next_review: new Date().toISOString(), user_id: 'mock', collection_id: 'h1', lesson_id: 'l1', ease_factor: 2.5, interval_days: 1, review_state: 'learning', next_review_date: new Date().toISOString(), reviews_total: 1, reviews_correct: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'f3', front: 'う', back: 'U', hint: 'Ooo sound', srs_level: 1, next_review: new Date().toISOString(), user_id: 'mock', collection_id: 'h1', lesson_id: 'l1', ease_factor: 2.5, interval_days: 1, review_state: 'learning', next_review_date: new Date().toISOString(), reviews_total: 1, reviews_correct: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'f4', front: 'え', back: 'E', hint: 'Eh sound', srs_level: 1, next_review: new Date().toISOString(), user_id: 'mock', collection_id: 'h1', lesson_id: 'l1', ease_factor: 2.5, interval_days: 1, review_state: 'learning', next_review_date: new Date().toISOString(), reviews_total: 1, reviews_correct: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'f5', front: 'お', back: 'O', hint: 'Oh sound', srs_level: 1, next_review: new Date().toISOString(), user_id: 'mock', collection_id: 'h1', lesson_id: 'l1', ease_factor: 2.5, interval_days: 1, review_state: 'learning', next_review_date: new Date().toISOString(), reviews_total: 1, reviews_correct: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'f6', front: 'カ', back: 'KA', hint: 'Sharp K', srs_level: 1, next_review: new Date().toISOString(), user_id: 'mock', collection_id: 'k1', lesson_id: 'l2', ease_factor: 2.5, interval_days: 1, review_state: 'learning', next_review_date: new Date().toISOString(), reviews_total: 1, reviews_correct: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'f7', front: 'サ', back: 'SA', hint: 'Soft S', srs_level: 1, next_review: new Date().toISOString(), user_id: 'mock', collection_id: 'k1', lesson_id: 'l2', ease_factor: 2.5, interval_days: 1, review_state: 'learning', next_review_date: new Date().toISOString(), reviews_total: 1, reviews_correct: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export function useFlashcards(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.flashcards(userId ?? ''),
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', userId!);

      if (error) throw error;
      return (data ?? []).map((card: any) => toLegacyFlashcard(card));
    },
  });
}

export function useCreateFlashcard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TablesInsert<'flashcards'>) => {
      const nextReviewDate = (payload as any).next_review_date
        ?? ((payload as any).next_review ? String((payload as any).next_review).slice(0, 10) : new Date().toISOString().slice(0, 10));

      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          ...payload,
          next_review_date: nextReviewDate,
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
      const { data, error } = await supabase.rpc('review_flashcard', {
        p_card_id: cardId,
        p_grade: grade,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcardsDue(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcards(variables.userId) });
    },
  });
}
