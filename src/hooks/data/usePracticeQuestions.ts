import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from './queryKeys';
import { getPracticeQuestions } from '@/data/mockData';

export interface PracticeQuestion {
  id: string;
  level: string;
  topic: 'kanji' | 'vocabulary' | 'grammar' | 'reading' | 'listening';
  section: 'vocabulary' | 'grammar' | 'reading' | 'listening';
  prompt: string;
  display_text: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  is_exam_ready: boolean;
}

export function usePracticeQuestions(
  level: string,
  topic: PracticeQuestion['topic'] | undefined = 'kanji',
  count: number = 10,
  userId?: string
) {
  return useQuery({
    queryKey: ['practice-questions', level, topic, count],
    enabled: !!level && count > 0,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('practice_questions')
        .select('*')
        .eq('level', level)
        .eq('topic', topic)
        .limit(count);

      if (error || !data || data.length === 0) {
        // Fallback to mock data for N5
        if (level === 'N5') {
          const mock = getPracticeQuestions(level, count, topic);
          return mock.map(m => ({
            id: m.id,
            level: 'N5',
            topic: m.topic as any,
            section: m.topic as any,
            prompt: m.question,
            display_text: m.question,
            options: m.options,
            correct_index: m.options.indexOf(m.correct_answer),
            explanation: m.explanation,
            is_exam_ready: true
          }));
        }
        return [];
      }

      return data.map(q => ({
        id: q.id,
        level: q.level,
        topic: q.topic as any,
        section: q.topic as any,
        prompt: q.prompt,
        display_text: q.display_text,
        options: q.options,
        correct_index: q.correct_index,
        explanation: q.explanation,
        is_exam_ready: true
      }));
    },
  });
}

export function useExamQuestions(level: string, section: PracticeQuestion['section']) {
  return useQuery({
    queryKey: queryKeys.examQuestions(level, section),
    enabled: !!level && !!section,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('practice_questions')
        .select('*')
        .eq('level', level)
        .eq('section', section)
        .eq('is_exam_ready', true);

      if (error) throw error;
      return data.map(q => ({
        id: q.id,
        level: q.level,
        topic: q.topic as any,
        section: q.topic as any,
        prompt: q.prompt,
        display_text: q.display_text,
        options: q.options,
        correct_index: q.correct_index,
        explanation: q.explanation,
        is_exam_ready: true
      }));
    },
  });
}

export function useGeneratedExam(level: string) {
  return useQuery({
    queryKey: queryKeys.generatedExam(level),
    enabled: !!level,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('practice_questions')
        .select('*')
        .eq('level', level);

      if (error) throw error;
      
      const sections: any = { vocabulary: [], grammar: [], reading: [], listening: [] };
      data.forEach(q => {
        const target = q.topic === 'kanji' ? 'vocabulary' : q.topic;
        if (sections[target]) {
           sections[target].push({
            id: q.id,
            level: q.level,
            topic: q.topic,
            section: target,
            prompt: q.prompt,
            display_text: q.display_text,
            options: q.options,
            correct_index: q.correct_index,
            explanation: q.explanation,
            is_exam_ready: true
           });
        }
      });

      return {
        level,
        sections
      };
    },
  });
}

export function useSavePracticeAnswer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, questionId, isCorrect }: { userId: string, questionId: string, isCorrect: boolean }) => {
      if (isCorrect) return;

      const { data: question, error: questionErr } = await supabase
        .from('practice_questions')
        .select('topic')
        .eq('id', questionId)
        .maybeSingle();

      if (questionErr) throw questionErr;

      const topic = question?.topic ?? 'practice';
      const { error } = await supabase
        .from('weak_topics')
        .upsert({
          user_id: userId,
          topic,
          skill_area: topic,
          mistakes_count: 1,
          last_seen_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,topic,skill_area',
          ignoreDuplicates: false,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quizHistory'] });
      qc.invalidateQueries({ queryKey: ['weakTopics'] });
    },
  });
}
