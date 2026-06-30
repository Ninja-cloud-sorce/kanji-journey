import type { PracticeQuestion } from '@/hooks/data/usePracticeQuestions';
import { supabase } from '@/integrations/supabase/client';

export async function fetchPracticeQuestions(params: {
  level: string;
  topic: PracticeQuestion['topic'];
  count: number;
}) {
  const { data, error } = await supabase
    .from('practice_questions')
    .select('*')
    .eq('level', params.level)
    .eq('topic', params.topic)
    .limit(params.count);

  if (error) throw error;
  return (data ?? []) as PracticeQuestion[];
}

export async function fetchExamSectionQuestions(params: {
  level: string;
  section: PracticeQuestion['section'];
  count?: number;
}) {
  const { data, error } = await supabase
    .from('practice_questions')
    .select('*')
    .eq('level', params.level)
    .eq('section', params.section)
    .eq('is_exam_ready', true)
    .limit(params.count ?? 12);

  if (error) throw error;
  return (data ?? []) as PracticeQuestion[];
}
