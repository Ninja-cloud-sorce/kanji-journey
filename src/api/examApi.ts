import type { PracticeQuestion } from '@/hooks/data/usePracticeQuestions';
import { supabase } from '@/integrations/supabase/client';

export interface GeneratedExam {
  level: string;
  sections: Record<'vocabulary' | 'grammar' | 'reading' | 'listening', PracticeQuestion[]>;
}

export async function generateExam(level: string): Promise<GeneratedExam> {
  const { data, error } = await supabase
    .from('practice_questions')
    .select('*')
    .eq('level', level)
    .eq('is_exam_ready', true);

  if (error) {
    throw error;
  }

  const sections: GeneratedExam['sections'] = {
    vocabulary: [],
    grammar: [],
    reading: [],
    listening: [],
  };

  (data ?? []).forEach((question: any) => {
    const targetSection = question.section as keyof GeneratedExam['sections'];
    if (!sections[targetSection]) return;
    sections[targetSection].push(question as PracticeQuestion);
  });

  return {
    level,
    sections,
  };
}
