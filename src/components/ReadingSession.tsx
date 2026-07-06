import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Settings, 
  HelpCircle, 
  Languages, 
  Volume2, 
  BarChart2, 
  Target, 
  Timer, 
  ChevronRight,
  Activity,
  Loader2,
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight
} from "lucide-react";
import { GlassCard } from './ui/GlassCard';
import { useStore } from '@/store/useStore';
import { useReadingPassages, ReadingPassage } from '@/hooks/data/useReadingPassages';
import { useUpdateProgress } from '@/hooks/data/useUpdateProgress';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function ReadingSession({ onBack }: { onBack: () => void }) {
  const { selectedLessonId } = useStore();
  const { user, profile } = useAuth();
  const { data: passages, isLoading } = useReadingPassages(selectedLessonId);
  const updateProgress = useUpdateProgress();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const currentPassage = passages?.[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const handleFinish = () => {
    if (user?.id && profile?.current_level) {
      updateProgress.mutate({
        userId: user.id,
        level: profile.current_level,
        score: 100,
      });
    }
    onBack();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (qIdx: number, option: string) => {
    setAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Loader2 className="w-12 h-12 text-white/20 animate-spin" />
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] animate-pulse">Retrieving Scholarly Scroll</p>
      </div>
    );
  }

  if (isFinished || !currentPassage) {
     return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] gap-12 text-center p-12">
            <BookOpen size={64} className="text-white/20" />
            <div className="space-y-4">
                <h2 className="text-4xl font-display font-bold text-white uppercase tracking-tight">Artifact Deciphered</h2>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Mastery Recorded</p>
            </div>
            <button onClick={handleFinish} className="btn-pink px-16 py-4 uppercase font-black tracking-widest text-[11px]">Finalize Session</button>
        </motion.div>
     );
  }

  return (
    <div className="flex flex-col gap-10 animate-fade-in w-full pb-20 mt-4 text-left min-h-screen font-sans">
      <header className="flex items-center justify-between pt-2 px-1">
        <div className="flex items-center gap-10 text-white">
          <h2 className="text-2xl font-display font-bold text-white tracking-wide uppercase">Reading Hub</h2>
          <nav className="flex items-center gap-10">
            <button className="text-[11px] font-black tracking-[0.3em] transition-colors text-white border-b border-white pb-1 uppercase">
              Current Session
            </button>
          </nav>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-16 pt-12 items-start h-full">
         <div className="col-span-8 flex flex-col justify-between h-full min-h-[600px] pb-12">
            <AnimatePresence mode="wait">
              <motion.div 
                 key={currentIndex + (showQuestions ? '-q' : '-p')}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-12 flex flex-col items-start"
              >
                 <div className="flex items-center gap-4 group">
                    <div className="h-0.5 w-12 bg-white rounded-full transition-all" />
                    <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em]">Scholarly Scroll {currentIndex + 1} / {passages?.length}</span>
                 </div>
                 
                 <h1 className="text-7xl font-display font-bold text-white tracking-tight leading-tight uppercase">
                   {currentPassage.title}
                 </h1>

                 {!showQuestions ? (
                   <div className="space-y-16 pt-12 flex flex-col items-start text-left normal-case">
                      <p className="text-5xl leading-[1.8] text-white/90 tracking-wide font-medium font-sans max-w-4xl">
                        {currentPassage.text}
                      </p>
                      <AnimatePresence>
                        {showTranslation && (
                          <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl leading-[1.6] text-white/40 tracking-wider font-light italic font-sans max-w-4xl border-l border-white/10 pl-10"
                          >
                             {currentPassage.translation}
                          </motion.p>
                        )}
                      </AnimatePresence>
                   </div>
                 ) : (
                    <div className="space-y-12 pt-12 w-full">
                       {currentPassage.questions.map((q, qIdx) => (
                         <div key={qIdx} className="space-y-8 p-10 bg-white/5 border border-white/10 rounded-3xl">
                            <h3 className="text-3xl font-display font-bold text-white uppercase tracking-wide leading-relaxed">{q.q}</h3>
                            <div className="grid grid-cols-2 gap-4">
                               {q.options.map((opt, oIdx) => {
                                  const isSelected = answers[qIdx] === opt;
                                  const isCorrect = opt === q.correct;
                                  const showFeedback = !!answers[qIdx];
                                  
                                  return (
                                     <button 
                                       key={oIdx}
                                       onClick={() => handleAnswer(qIdx, opt)}
                                       disabled={showFeedback}
                                       className={cn(
                                          "p-6 rounded-2xl border text-lg font-black uppercase tracking-widest transition-all",
                                          !showFeedback && "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/40 hover:text-white",
                                          showFeedback && isSelected && isCorrect && "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]",
                                          showFeedback && isSelected && !isCorrect && "bg-rose-500/20 border-rose-500/50 text-rose-400 opacity-50",
                                          showFeedback && !isSelected && isCorrect && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500/40",
                                          showFeedback && !isSelected && !isCorrect && "opacity-10 grayscale"
                                       )}
                                     >
                                        {opt}
                                     </button>
                                  );
                               })}
                            </div>
                         </div>
                       ))}
                    </div>
                 )}
              </motion.div>
            </AnimatePresence>

            {/* Reading Utils */}
            <div className="flex items-center gap-12 pt-12 border-t border-white/10 mt-24">
               {!showQuestions ? (
                 <>
                    <button 
                      onClick={() => setShowTranslation(!showTranslation)}
                      className="flex items-center gap-4 group"
                    >
                      <div className={cn("w-14 h-14 rounded-2xl border flex items-center justify-center transition-all shadow-xl", showTranslation ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/40 group-hover:text-white group-hover:border-white/40")}>
                        <Languages size={24} />
                      </div>
                      <span className="text-[11px] font-black text-white/40 group-hover:text-white uppercase tracking-[0.3em] transition-colors">{showTranslation ? 'Hide' : 'Show'} Translation</span>
                    </button>

                    <button 
                      onClick={() => setShowQuestions(true)}
                      className="flex items-center gap-4 group ml-auto"
                    >
                      <span className="text-[11px] font-black text-white/40 group-hover:text-white uppercase tracking-[0.3em] transition-colors">Confirm Comprehension</span>
                      <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center transition-all shadow-2xl group-hover:scale-110">
                        <ArrowRight size={24} />
                      </div>
                    </button>
                 </>
               ) : (
                 <button 
                  onClick={() => {
                    if (currentIndex < (passages?.length || 1) - 1) {
                      setCurrentIndex(i => i + 1);
                      setShowQuestions(false);
                      setAnswers({});
                    } else {
                      setIsFinished(true);
                    }
                  }}
                  className="btn-pink px-16 py-6 font-black uppercase tracking-[0.2em] ml-auto"
                 >
                   {currentIndex < (passages?.length || 1) - 1 ? 'Next Scroll' : 'Finalize Recognition'}
                 </button>
               )}
            </div>
         </div>

         {/* Sidebar */}
         <div className="col-span-4 self-stretch font-sans">
            <GlassCard className="h-fit lg:sticky lg:top-12 p-12 space-y-12 border-white/10 shadow-2xl flex flex-col items-start bg-white/5 backdrop-blur-xl">
                <div className="space-y-3 flex flex-col items-start text-left">
                  <h2 className="text-2xl font-display font-bold text-white tracking-wide uppercase">Session Analytics</h2>
                  <p className="text-[10px] text-white/20 font-black uppercase tracking-widest italic">Aura Calibration</p>
                </div>

                <div className="space-y-10 w-full flex flex-col items-start">
                   <div className="space-y-6 flex flex-col items-start w-full">
                      <div className="flex items-center justify-between text-[11px] font-black text-white/40 tracking-widest uppercase w-full">
                         <div className="flex items-center gap-3">
                           <Activity size={18} className="text-white/20" />
                           <span>Passage Progress</span>
                         </div>
                         <span className="text-white font-bold">{Math.round(((currentIndex + (showQuestions ? 1 : 0)) / (passages?.length || 1)) * 100)}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                         <motion.div animate={{ width: `${((currentIndex + (showQuestions ? 1 : 0)) / (passages?.length || 1)) * 100}%` }} className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                      </div>
                   </div>

                   <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-between group shadow-inner w-full">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/40">
                          <Target size={32} strokeWidth={1.5} />
                        </div>
                        <h4 className="text-lg font-display font-bold text-white tracking-tight uppercase">Comprehension</h4>
                      </div>
                      <span className="text-4xl font-display font-bold text-white">
                        {Object.values(answers).length > 0 ? `${Object.values(answers).filter((a, i) => a === currentPassage.questions[i].correct).length}/${currentPassage.questions.length}` : '--'}
                      </span>
                   </div>

                   <div className="space-y-6 flex flex-col items-start w-full">
                      <div className="flex items-center gap-3 text-[11px] font-black text-white/40 tracking-widest uppercase">
                         <Timer size={18} className="text-white/20" />
                         <span>Ritual Duration</span>
                      </div>
                      <p className="text-7xl font-display font-bold text-white tracking-tight overflow-hidden">{formatTime(elapsed)}</p>
                   </div>
                </div>

                <div className="h-px w-full bg-white/5" />
                
                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] leading-relaxed italic">
                   Recognition focus increases neuroplastic retention. Avoid surface-level reading.
                </p>
            </GlassCard>
         </div>
      </div>
    </div>
  );
}
