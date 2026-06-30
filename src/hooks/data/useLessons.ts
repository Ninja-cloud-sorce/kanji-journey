import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getLegacyCollectionMeta, toLegacyLesson } from '@/lib/legacyCurriculum';

export interface Lesson {
  id: string;
  collection_id: string;
  title: string;
  subtitle: string;
  characters: string[];
  sort_order: number;
  content: any;
  status?: 'COMPLETED' | 'CURRENT' | 'LOCKED';
}

async function fetchCompatibilityLessons(collectionId: string) {
  const { data, error } = await supabase
    .from('lesson_catalog')
    .select('id, level, week_number, lesson_number, title, skill_area, topics')
    .order('week_number', { ascending: true })
    .order('lesson_number', { ascending: true });

  if (error) throw error;

  return ((data ?? []) as any[])
    .map((row) => toLegacyLesson(row))
    .filter((row) => row.collection_id === collectionId);
}

/**
 * useLessons — fetches all lessons for a specific collection.
 * Includes user progress per lesson.
 */
export function useLessons(collectionId: string | null, userId: string | undefined) {
  return useQuery({
    queryKey: ['lessons', collectionId, userId],
    enabled: !!collectionId,
    staleTime: 30_000,
    queryFn: async () => {
      try {
        const { data: lessons, error: lErr } = await supabase
          .from('lessons')
          .select('*')
          .eq('collection_id', collectionId!)
          .order('sort_order', { ascending: true });

        const lessonRows = (!lErr && lessons && lessons.length > 0)
          ? (lessons as Lesson[])
          : await fetchCompatibilityLessons(collectionId!);

        if (!lessonRows || lessonRows.length === 0) {
          return [];
        }

        if (!userId) {
          return lessonRows.map((lesson) => {
            return { ...lesson, status: 'CURRENT' as const };
          });
        }

        const { data: progress, error: pErr } = await supabase
          .from('lesson_progress')
          .select('lesson_id, completed')
          .eq('user_id', userId);

        if (pErr) throw pErr;

        return lessonRows.map((lesson: any) => {
          const p = progress?.find((item: any) => String(item.lesson_id) === String(lesson.id));
          
          let status: 'COMPLETED' | 'CURRENT' | 'LOCKED' = 'CURRENT';
          if (p?.completed) {
            status = 'COMPLETED';
          }

          return { ...lesson, status };
        });
      } catch (err) {
        console.error('Lessons fetch failed:', err);
        const fallbackLessons = await fetchCompatibilityLessons(collectionId!);
        return fallbackLessons.map((lesson) => {
          return { ...lesson, status: 'CURRENT' as const };
        });
      }
    },
  });
}

/**
 * useCollectionDetail — fetches the metadata for a specific collection.
 */
export function useCollectionDetail(collectionId: string | null) {
  return useQuery({
    queryKey: ['collection-detail', collectionId],
    enabled: !!collectionId,
    staleTime: 60_000,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('collections')
          .select('*')
          .eq('id', collectionId!)
          .single();

        if (error || !data) {
          return getLegacyCollectionMeta(collectionId!);
        }
        return data;
      } catch (err) {
        console.error('Collection detail fetch failed:', err);
        return getLegacyCollectionMeta(collectionId!);
      }
    },
  });
}
