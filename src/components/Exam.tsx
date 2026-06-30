import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Check, X, Target, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { usePracticeQuestions } from '@/hooks/data/usePracticeQuestions';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface ExamProps {
  onNavigate: (page: string) => void;
  profile?: Profile | null;
  userId?: string;
  level: string;
}

export function Exam({ onNavigate, profile, userId, level }: ExamProps) {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes
  const [answers, setAnswers] = useState<{ isCorrect: boolean; topic: string }[]>([]);

  // Fetch 15 questions for the exam (mix of topics)
  const { data: questions = [], isLoading } = usePracticeQuestions(level, 'vocabulary', 15);

  useEffect(() => {
    let timer: any;
    if (started && timeLeft > 0 && !finished) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [started, timeLeft, finished]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[current];
  const isLast = current === questions.length - 1;

  const handlePick = (idx: number) => {
    if (showResult || !currentQuestion) return;
    const isCorrect = idx === currentQuestion.correct_index;
    setSelected(idx);
    setShowResult(true);
    if (isCorrect) setScore((s) => s + 1);
    setAnswers([...answers, { isCorrect, topic: currentQuestion.topic }]);
  };

  const handleNext = () => {
    if (isLast) {
      setFinished(true);
      // Sync results logic here if userId exists
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  if (finished) {
    const finalScore = Math.round((score / questions.length) * 100);
    const weakAreas = Array.from(new Set(answers.filter(a => !a.isCorrect).map(a => a.topic)));

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl glass-panel p-16 rounded-[3.5rem] flex flex-col items-center text-center space-y-12"
      >
        <div className="space-y-4">
           <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto shadow-glow">
              <Target className="w-12 h-12 text-primary" />
           </div>
           <h2 className="text-4xl font-heading tracking-widest uppercase">Result Protocol</h2>
           <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground font-bold">Analysis complete</p>
        </div>

        <div className="grid grid-cols-2 gap-8 w-full">
           <div className="glass-panel p-8 rounded-[2rem] space-y-2">
              <p className="text-5xl font-light font-heading">{finalScore}%</p>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Score Index</p>
           </div>
           <div className="glass-panel p-8 rounded-[2rem] space-y-2">
              <p className="text-5xl font-light font-heading text-primary">{finalScore > 70 ? 'Pass' : 'Review'}</p>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Readiness level</p>
           </div>
        </div>

        {weakAreas.length > 0 && (
          <div className="w-full space-y-6 pt-6 border-t border-white/5">
             <div className="flex items-center justify-center space-x-3 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <p className="text-[10px] uppercase tracking-widest font-bold">Weak Areas Detected</p>
             </div>
             <div className="flex flex-wrap justify-center gap-4">
                {weakAreas.map(topic => (
                  <div key={topic} className="px-6 py-2 rounded-full glass-panel border border-red-400/20 text-red-200 text-[10px] uppercase tracking-widest">
                    {topic}
                  </div>
                ))}
             </div>
          </div>
        )}

        <button 
          onClick={() => onNavigate('Roadmap')}
          className="w-full h-16 rounded-full bg-primary text-black font-bold text-[11px] uppercase tracking-[0.4em] shadow-glow"
        >
          Return to Path
        </button>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[500px]">
      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full glass-panel p-16 rounded-[3.5rem] text-center space-y-12"
          >
             <div className="space-y-4">
                <Target className="w-16 h-16 text-primary mx-auto opacity-60" />
                <h2 className="text-4xl font-heading tracking-widest uppercase">JLPT {level} Checkpoint</h2>
                <p className="text-muted-foreground tracking-[0.4em] uppercase text-[10px]">Test your mastery protocol</p>
             </div>

             <div className="grid grid-cols-3 gap-6">
                {['Vocabulary', 'Grammar', 'Listening'].map(s => (
                  <div key={s} className="glass-panel py-6 px-4 rounded-2xl flex flex-col items-center space-y-3">
                     <div className="w-2 h-2 rounded-full bg-primary/40" />
                     <p className="text-[9px] uppercase tracking-widest font-bold">{s}</p>
                  </div>
                ))}
             </div>

             <div className="flex items-center justify-center space-x-4 px-10 py-6 rounded-2xl bg-white/5 border border-white/5">
                <Clock className="w-5 h-5 text-primary opacity-60" />
                <p className="text-[12px] font-light tracking-[0.2em]">Duration: 20:00 Minutes</p>
             </div>

             <button 
               onClick={() => setStarted(true)}
               className="w-full h-18 rounded-[2rem] bg-primary text-black font-bold text-[11px] tracking-[0.5em] uppercase hover:scale-[1.03] transition-all shadow-glow"
             >
                Start Exam
             </button>
          </motion.div>
        ) : (
          <motion.div
            key="exam"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full space-y-12"
          >
             <div className="flex justify-between items-center px-4">
                <div className="flex items-center space-x-3 text-red-500/80 font-bold tracking-widest text-xs">
                   <Clock className="w-4 h-4" />
                   <span>{formatTime(timeLeft)}</span>
                </div>
                <div className="flex space-x-2">
                   {questions.map((_, i) => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === current ? 'w-8 bg-primary shadow-glow' : 'w-2 bg-white/10'}`} />
                   ))}
                </div>
                <p className="text-[10px] tracking-widest opacity-40">{current + 1} / {questions.length}</p>
             </div>

             <AnimatePresence mode="wait">
               {currentQuestion && (
                 <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-8"
                 >
                    <div className="glass-panel p-16 rounded-[3.5rem] text-center space-y-8">
                       <p className="text-[10px] tracking-[0.5em] uppercase text-primary/60 font-bold">{currentQuestion.prompt}</p>
                       <h3 className="text-6xl font-jp font-light leading-relaxed text-glow">{currentQuestion.display_text}</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                       {currentQuestion.options.map((opt, idx) => {
                          const isCorrect = idx === currentQuestion.correct_index;
                          const isSelected = selected === idx;
                          return (
                            <button
                              key={idx}
                              onClick={() => handlePick(idx)}
                              disabled={showResult}
                              className={`h-20 px-8 rounded-2xl glass-panel text-left flex items-center justify-between group transition-all duration-500 ${
                                showResult 
                                  ? isCorrect 
                                    ? 'border-green-500/40 bg-green-500/10' 
                                    : isSelected 
                                      ? 'border-red-500/40 bg-red-500/10 opacity-60' 
                                      : 'opacity-20 blur-[1px]'
                                  : 'hover:bg-white/10 hover:border-white/20'
                              }`}
                            >
                               <span className="text-[11px] tracking-[0.2em] uppercase font-light">{opt}</span>
                               {showResult && isCorrect && <Check className="w-5 h-5 text-green-400" />}
                               {showResult && isSelected && !isCorrect && <X className="w-5 h-5 text-red-400" />}
                            </button>
                          );
                       })}
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>

             {showResult && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleNext}
                  className="w-full h-16 rounded-2xl bg-white text-black font-semibold text-[11px] tracking-[0.5em] uppercase hover:scale-[1.02] transition-all"
                >
                  {isLast ? 'Complete Exam' : 'Next Question'}
                </motion.button>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
