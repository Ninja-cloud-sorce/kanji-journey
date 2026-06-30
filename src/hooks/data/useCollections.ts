import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LEGACY_COLLECTIONS } from '@/lib/legacyCurriculum';

export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  level: string;
  progressPercentage?: number;
}

/**
 * useCollections — fetches the full catalog of study collections.
 * includes user progress for each collection.
 */
export function useCollections(userId: string | undefined) {
  return useQuery({
    queryKey: ['collections', userId],
    staleTime: 60 * 1000,
    queryFn: async () => {
      try {
        const { data: collections, error: cErr } = await supabase
          .from('collections')
          .select('*')
          .order('sort_order', { ascending: true });

        if (cErr || !collections || collections.length === 0) {
          console.warn('Using local compatibility collections');
          return LEGACY_COLLECTIONS.map(({ sortOrder, ...collection }) => ({
            ...collection,
            progressPercentage: 0,
          }));
        }

        if (!userId) {
          return collections.map((collection: any) => ({
            ...collection,
            progressPercentage: 0,
          }));
        }

        const [{ data: lessons, error: lessonsErr }, { data: userProgress, error: pErr }] = await Promise.all([
          supabase.from('lessons').select('id, collection_id'),
          supabase.from('lesson_progress').select('lesson_id, completed').eq('user_id', userId),
        ]);

        if (lessonsErr) throw lessonsErr;
        if (pErr) throw pErr;

        const completedLessonIds = new Set(
          (userProgress ?? []).filter((row: any) => row.completed).map((row: any) => String(row.lesson_id))
        );

        const lessonsByCollection = new Map<string, number>();
        const completedByCollection = new Map<string, number>();

        (lessons ?? []).forEach((lesson: any) => {
          const collectionId = String(lesson.collection_id);
          lessonsByCollection.set(collectionId, (lessonsByCollection.get(collectionId) ?? 0) + 1);
          if (completedLessonIds.has(String(lesson.id))) {
            completedByCollection.set(collectionId, (completedByCollection.get(collectionId) ?? 0) + 1);
          }
        });

        return collections.map((col: any) => {
          const total = lessonsByCollection.get(col.id) ?? 0;
          const completed = completedByCollection.get(col.id) ?? 0;
          return {
            ...col,
            progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
          };
        });
      } catch (err) {
        console.error('Library fetch failed, falling back to local compatibility data:', err);
        return LEGACY_COLLECTIONS.map(({ sortOrder, ...collection }) => ({
          ...collection,
          progressPercentage: 0,
        }));
      }
    },
  });
}
