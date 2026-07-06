import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGeneratedExam, type PracticeQuestion } from '@/hooks/data/usePracticeQuestions';
import { api } from '@/integrations/api/client';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Section = 'vocabulary' | 'grammar' | 'reading' | 'listening';

interface ExamSimulatorProps {
  profile: Profile;
}

const SECTIONS: Section[] = ['vocabulary', 'grammar', 'reading', 'listening'];
const SECTION_SECONDS: Record<Section, number> = {
  vocabulary: 25 * 60,
  grammar: 25 * 60,
  reading: 35 * 60,
  listening: 20 * 60,
};

export function ExamSimulator({ profile }: ExamSimulatorProps) {
  const [started, setStarted] = useState(false);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [remaining, setRemaining] = useState(SECTION_SECONDS.vocabulary);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [sectionQuestions, setSectionQuestions] = useState<Record<Section, PracticeQuestion[]>>({
    vocabulary: [],
    grammar: [],
    reading: [],
    listening: [],
  });
  const [finished, setFinished] = useState(false);
  const savedRef = useRef(false);

  const section = SECTIONS[sectionIndex];
  const { data: generatedExam, isLoading } = useGeneratedExam(profile.current_level);
  const sectionMap = generatedExam?.sections ?? {
    vocabulary: [],
    grammar: [],
    reading: [],
    listening: [],
  };
  const questions = sectionMap[section] ?? [];
  const current = questions[qIndex];
  const totalQuestions = SECTIONS.reduce((sum, s) => sum + (sectionMap[s]?.length ?? 0), 0);
  const totalMinutes = Math.round(SECTIONS.reduce((sum, s) => sum + SECTION_SECONDS[s], 0) / 60);

  useEffect(() => {
    if (!started || finished) return;
    if (remaining <= 0) {
      nextSectionOrFinish();
      return;
    }
    const t = window.setInterval(() => setRemaining((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [started, remaining, finished]);

  useEffect(() => {
    if (!started) return;
    const sec = SECTIONS[sectionIndex];
    setRemaining(SECTION_SECONDS[sec]);
    setQIndex(0);
  }, [sectionIndex, started]);

  useEffect(() => {
    if (!started) return;
    setSectionQuestions(sectionMap);
  }, [sectionMap, started]);

  const answer = (idx: number) => {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: idx }));
  };

  const persistExamResults = async (allSectionQs: Record<Section, PracticeQuestion[]>) => {
    if (savedRef.current) return;
    savedRef.current = true;

    const now = new Date().toISOString();
    const payload: { user_id: string; topic: string; skill_area: string; mistakes_count: number; last_seen_at: string }[] = [];

    for (const s of SECTIONS) {
      for (const q of (allSectionQs[s] ?? [])) {
        if (answers[q.id] !== q.correct_index) {
          payload.push({
            user_id:       profile.user_id,
            topic:         q.topic as string,
            skill_area:    s,
            mistakes_count: 1,
            last_seen_at:  now,
          });
        }
      }
    }

    if (payload.length > 0) {
      await api.post('/api/weak-topics/batch', { items: payload });
    }
  };

  const nextSectionOrFinish = () => {
    if (sectionIndex >= SECTIONS.length - 1) {
      persistExamResults(sectionQuestions);
      setFinished(true);
      setStarted(false);
      return;
    }
    setSectionIndex((i) => i + 1);
  };

  const nextQuestion = () => {
    if (!questions.length) return;
    if (qIndex >= questions.length - 1) {
      nextSectionOrFinish();
      return;
    }
    setQIndex((i) => i + 1);
  };

  const prevQuestion = () => {
    if (qIndex <= 0) return;
    setQIndex((i) => i - 1);
  };

  if (!started && !finished) {
    return (
      <div className="min-h-screen pt-24 pb-24 px-4">
        <div className="max-w-lg md:max-w-2xl xl:max-w-4xl mx-auto glass-card p-6 space-y-4">
          <h1 className="text-2xl font-light text-foreground">{profile.current_level} Mock Test</h1>
          <p className="text-muted-foreground">Preview before starting the full timed exam.</p>
          <div className="glass-card-subtle p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground">Vocabulary</p>
              <p className="text-sm text-muted-foreground">{Math.round(SECTION_SECONDS.vocabulary / 60)} min</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground">Grammar</p>
              <p className="text-sm text-muted-foreground">{Math.round(SECTION_SECONDS.grammar / 60)} min</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground">Reading</p>
              <p className="text-sm text-muted-foreground">{Math.round(SECTION_SECONDS.reading / 60)} min</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground">Listening</p>
              <p className="text-sm text-muted-foreground">{Math.round(SECTION_SECONDS.listening / 60)} min</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Total time: {totalMinutes} minutes · Total questions: {totalQuestions}
          </p>
          {isLoading ? <p className="text-sm text-muted-foreground">Preparing exam sections...</p> : null}
          <button
            onClick={() => {
              setStarted(true);
              setFinished(false);
              setSectionIndex(0);
              setQIndex(0);
              setAnswers({});
              setSectionQuestions({ vocabulary: [], grammar: [], reading: [], listening: [] });
              setRemaining(SECTION_SECONDS.vocabulary);
            }}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium"
          >
            Start Simulation
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    let total = 0;
    let correct = 0;
    const bySection: Record<Section, { total: number; correct: number }> = {
      vocabulary: { total: 0, correct: 0 },
      grammar: { total: 0, correct: 0 },
      reading: { total: 0, correct: 0 },
      listening: { total: 0, correct: 0 },
    };

    for (const s of SECTIONS) {
      const set = sectionQuestions[s] ?? [];
      for (const q of set) {
        total += 1;
        bySection[s].total += 1;
        if (answers[q.id] === q.correct_index) {
          correct += 1;
          bySection[s].correct += 1;
        }
      }
    }

    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    return (
      <div className="min-h-screen pt-24 pb-24 px-4">
        <div className="max-w-lg md:max-w-2xl xl:max-w-4xl mx-auto glass-card p-6 space-y-4">
          <h2 className="text-2xl font-light text-foreground">Simulation Result</h2>
          <p className="text-muted-foreground">{correct}/{total} correct ({pct}%)</p>
          <div className="glass-card-subtle p-3 rounded-xl">
            <p className="text-sm text-muted-foreground">
              Weakest section:{' '}
              <span className="capitalize text-foreground">
                {SECTIONS.reduce((min, s) => {
                  const t = bySection[s].total;
                  const score = t > 0 ? bySection[s].correct / t : 1;
                  const minTotal = bySection[min].total;
                  const minScore = minTotal > 0 ? bySection[min].correct / minTotal : 1;
                  return score < minScore ? s : min;
                }, 'vocabulary' as Section)}
              </span>
            </p>
          </div>
          <div className="space-y-2">
            {SECTIONS.map((s) => {
              const t = bySection[s].total;
              const c = bySection[s].correct;
              return (
                <div key={s} className="glass-card-subtle p-3 rounded-xl flex items-center justify-between">
                  <span className="capitalize text-foreground">{s}</span>
                  <span className="text-muted-foreground">{c}/{t}</span>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => {
              setStarted(false);
              setFinished(false);
            }}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium"
          >
            Run Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg md:max-w-2xl xl:max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground capitalize">Section: {section}</p>
          <p className="text-sm font-medium text-foreground">{Math.max(0, remaining)}s</p>
        </div>
        <div className="flex gap-2">
          {SECTIONS.map((s, idx) => (
            <button
              key={s}
              onClick={() => {
                setSectionIndex(idx);
                setQIndex(0);
              }}
              className={`flex-1 py-2 rounded-lg text-xs capitalize ${
                idx === sectionIndex ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {!current ? (
          <div className="glass-card p-5 space-y-3">
            <p className="text-muted-foreground">No questions available in this section.</p>
            <button onClick={nextSectionOrFinish} className="w-full py-3 rounded-xl bg-primary text-primary-foreground">
              Continue
            </button>
          </div>
        ) : (
          <>
            <div className="glass-card p-6">
              <p className="text-sm text-muted-foreground mb-2">{current.prompt}</p>
              <p className="text-2xl font-light text-foreground">{current.display_text}</p>
            </div>
            <div className="space-y-2">
              {current.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => answer(idx)}
                  className={`w-full p-4 rounded-xl text-left calm-transition ${
                    answers[current.id] === idx ? 'bg-primary text-primary-foreground' : 'glass-card-subtle'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <button
              onClick={nextQuestion}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium"
            >
              {qIndex >= questions.length - 1 ? 'Next Section' : 'Next Question'}
            </button>
            <button
              onClick={prevQuestion}
              disabled={qIndex === 0}
              className="w-full py-2.5 rounded-xl bg-secondary text-foreground font-medium disabled:opacity-50"
            >
              Previous Question
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
