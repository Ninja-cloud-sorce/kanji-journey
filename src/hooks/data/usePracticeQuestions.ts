import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
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

// Maps local jlpt_n5 mock questions to the PracticeQuestion shape
function mapMockQuestion(m: ReturnType<typeof getPracticeQuestions>[number], level = 'N5'): PracticeQuestion {
  const section = m.topic === 'kanji_reading' ? 'vocabulary' : m.topic as PracticeQuestion['section'];
  return {
    id:           m.id,
    level,
    topic:        section as any,
    section,
    prompt:       m.question,
    display_text: m.question,
    options:      m.options,
    correct_index: m.options.indexOf(m.correct_answer),
    explanation:  m.explanation ?? null,
    is_exam_ready: true,
  };
}

export function usePracticeQuestions(
  level: string,
  topic: PracticeQuestion['topic'] | undefined = 'kanji',
  count: number = 10,
  _userId?: string
) {
  return useQuery({
    queryKey: queryKeys.practiceQuestions(level, topic ?? 'kanji', count),
    enabled: !!level && count > 0,
    staleTime: 30_000,
    queryFn: () => {
      // Serve from local mock data — same N5 content that was seeded in Supabase
      const raw = getPracticeQuestions(level, count, topic);
      return raw.map((m) => mapMockQuestion(m, level));
    },
  });
}

export function useExamQuestions(level: string, section: PracticeQuestion['section']) {
  return useQuery({
    queryKey: queryKeys.examQuestions(level, section),
    enabled: !!level && !!section,
    staleTime: 30_000,
    queryFn: () => {
      const raw = getPracticeQuestions(level, 20, section === 'vocabulary' ? 'kanji' : section);
      return raw.map((m) => mapMockQuestion(m, level));
    },
  });
}

export function useGeneratedExam(level: string) {
  return useQuery({
    queryKey: queryKeys.generatedExam(level),
    enabled: !!level,
    staleTime: 30_000,
    queryFn: () => {
      const all = getPracticeQuestions(level, 60);
      const sections: Record<string, PracticeQuestion[]> = {
        vocabulary: [], grammar: [], reading: [], listening: [],
      };
      for (const m of all) {
        const q = mapMockQuestion(m, level);
        const bucket = q.topic === 'kanji' ? 'vocabulary' : q.topic;
        if (sections[bucket]) sections[bucket].push(q);
      }
      return { level, sections };
    },
  });
}

export function useSavePracticeAnswer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      questionId,
      isCorrect,
      topic,
    }: {
      userId: string;
      questionId: string;
      isCorrect: boolean;
      topic?: string;
    }) => {
      if (isCorrect) return;
      const skillArea = topic ?? 'practice';
      await api.post('/api/weak-topics/batch', {
        items: [{
          user_id:        userId,
          topic:          skillArea,
          skill_area:     skillArea,
          mistakes_count: 1,
          last_seen_at:   new Date().toISOString(),
        }],
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quizHistory'] });
      qc.invalidateQueries({ queryKey: ['weakTopics'] });
    },
  });
}
