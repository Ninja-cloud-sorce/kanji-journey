import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Trophy,
  Volume2
} from "lucide-react";
import { GlassCard } from './ui/GlassCard';
import { useStore } from '@/store/useStore';
import { useVocabQuiz, VocabQuestion } from '@/hooks/data/useVocabQuiz';
import { useUpdateProgress } from '@/hooks/data/useUpdateProgress';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function VocabularyQuiz({ onBack }: { onBack: () => void }) {
  const { selectedLessonId } = useStore();
  const { user, profile } = useAuth();
  const { data: questions, isLoading } = useVocabQuiz(selectedLessonId);
  const updateProgress = useUpdateProgress();
  const savedRef = useRef(false);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions?.[currentIndex];

  const handleOptionClick = (option: string) => {
    if (selectedOption !== null) return;

    setSelectedOption(option);
    const correct = option === currentQuestion?.correct;
    setIsCorrect(correct);

    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);

    setTimeout(() => {
      if (questions && currentIndex < questions.length - 1) {
        setCurrentIndex(i => i + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        // Persist XP when the last question is answered
        const finalScore = Math.round((newScore / (questions?.length ?? 1)) * 100);
        if (user?.id && profile?.current_level && !savedRef.current) {
          savedRef.current = true;
          updateProgress.mutate({
            userId: user.id,
            level: profile.current_level,
            score: finalScore,
          });
        }
        setIsFinished(true);
      }
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Loader2 className="w-12 h-12 text-white/20 animate-spin" />
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] animate-pulse">Syncing Vocabulary</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] gap-12 text-center p-12">
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full" />
          <Trophy size={80} className="text-white relative z-10" />
        </div>
        <div className="space-y-4">
          <h2 className="text-5xl font-display font-bold text-white uppercase tracking-tight">Ritual Complete</h2>
          <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.4em]">Lexical Mastery Attained</p>
        </div>
        <div className="text-8xl font-display font-bold text-white">
          {score} <span className="text-2xl text-white/20">/ {questions?.length}</span>
        </div>
        <button onClick={onBack} className="btn-pink px-16 py-4 uppercase font-black tracking-widest text-[11px]">Return to Library</button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-12 animate-fade-in w-full max-w-4xl mx-auto py-12">
      {/* Header Info */}
      <div className="flex justify-between items-center px-4">
        <div className="space-y-2 text-left">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">N5 Vocabulary Ritual</span>
          <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wide">Module {currentIndex + 1}</h2>
        </div>
        <div className="text-right space-y-2">
           <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Session Progress</span>
           <div className="flex items-center gap-4">
              <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden border border-white/5">
                 <motion.div 
                    animate={{ width: `${((currentIndex + 1) / (questions?.length || 1)) * 100}%` }}
                    className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                 />
              </div>
              <span className="text-[11px] font-display font-bold text-white">{currentIndex + 1} / {questions?.length}</span>
           </div>
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
           key={currentIndex}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           className="space-y-12"
        >
          <GlassCard className="p-20 flex flex-col items-center gap-10 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
               <HelpCircle size={100} strokeWidth={1} />
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4">
                <h1 className="text-8xl font-display font-bold text-white tracking-widest">
                  {currentQuestion?.word}
                </h1>
                <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                  <Volume2 size={20} />
                </button>
              </div>
              <p className="text-2xl text-white/40 font-display italic tracking-wide">
                {currentQuestion?.reading}
              </p>
            </div>

            <div className="h-px w-24 bg-white/10" />

            {/* Example Sentence */}
            <div className="space-y-4 max-w-lg">
               <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Contextual Flow</p>
               <p className="text-xl text-white/60 leading-relaxed font-medium italic">
                 "{currentQuestion?.example}"
               </p>
            </div>
          </GlassCard>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-6 px-4">
            {currentQuestion?.options.map((option, i) => {
              const isSelected = selectedOption === option;
              const isOptionCorrect = option === currentQuestion.correct;
              const showResult = selectedOption !== null;

              return (
                <button
                  key={i}
                  onClick={() => handleOptionClick(option)}
                  disabled={showResult}
                  className={cn(
                    "p-10 rounded-3xl border text-xl font-display font-bold uppercase tracking-widest transition-all relative overflow-hidden group active:scale-[0.98]",
                    !showResult && "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white",
                    showResult && isOptionCorrect && "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]",
                    showResult && isSelected && !isOptionCorrect && "bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)]",
                    showResult && !isSelected && !isOptionCorrect && "opacity-20 grayscale"
                  )}
                >
                  <div className="flex items-center justify-center gap-4">
                    {showResult && isOptionCorrect && <CheckCircle2 size={20} />}
                    {showResult && isSelected && !isOptionCorrect && <XCircle size={20} />}
                    {option}
                  </div>
                  
                  {/* Visual feedback pulses */}
                  {isSelected && isCorrect && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      className="absolute inset-0 bg-emerald-500/40 rounded-full"
                    />
                  )}
                  {isSelected && isCorrect === false && (
                    <motion.div 
                      initial={{ x: 0 }}
                      animate={{ x: [-5, 5, -5, 5, 0] }}
                      className="absolute inset-0 bg-rose-500/10 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Footer Branding */}
      <div className="mt-12 text-center">
         <button 
           onClick={onBack}
           className="text-[10px] font-black text-white/20 hover:text-white/60 transition-colors uppercase tracking-[0.6em] italic"
         >
           Exit Ritual
         </button>
      </div>
    </div>
  );
}
