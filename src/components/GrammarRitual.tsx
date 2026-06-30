import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Settings, 
  HelpCircle, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Trophy,
  ArrowRight,
  MessageSquare
} from "lucide-react";
import { GlassCard } from './ui/GlassCard';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { useGrammarExercises, GrammarQuestion } from '@/hooks/data/useGrammarExercises';
import { useUpdateProgress } from '@/hooks/data/useUpdateProgress';
import { cn } from '@/lib/utils';

export function GrammarRitual({ onExit }: { onExit: () => void }) {
  const { selectedLessonId } = useStore();
  const { user } = useAuth();
  const { data: exercises, isLoading } = useGrammarExercises(selectedLessonId);
  const { mutate: updateProgress, isPending: isSyncing } = useUpdateProgress();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const handleFinish = () => {
    if (user && exercises) {
      const finalScore = Math.round((score / exercises.length) * 100);
      updateProgress({
        userId: user.id,
        level: 'N5', // Fallback level
        score: finalScore,
        mistakes: mistakes.length > 0 ? Array.from(new Set(mistakes)) : undefined,
        lessonId: selectedLessonId || undefined
      });
    }
    onExit();
  };

  const currentExercise = exercises?.[currentIndex];

  const handleOptionClick = (option: string) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(option);
    const correct = option === currentExercise?.correct;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(s => s + 1);
    } else if (currentExercise) {
      setMistakes(prev => [...prev, currentExercise.usage || currentExercise.pattern || 'Grammar Pattern']);
    }

    // Delay before next question to allow reading the explanation
    setTimeout(() => {
      if (exercises && currentIndex < exercises.length - 1) {
        setCurrentIndex(i => i + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setIsFinished(true);
      }
    }, 2500);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Loader2 className="w-12 h-12 text-white/20 animate-spin" />
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] animate-pulse">Mapping Structure</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] gap-12 text-center p-12">
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full" />
          <MessageSquare size={80} className="text-white relative z-10" />
        </div>
        <div className="space-y-4">
          <h2 className="text-5xl font-display font-bold text-white uppercase tracking-tight">Ritual Complete</h2>
          <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.4em]">
            {isSyncing ? 'Synchronizing Scholar Progress...' : 'Grammatical Logic Mastered'}
          </p>
        </div>
        <div className="text-8xl font-display font-bold text-white">
          {score} <span className="text-2xl text-white/20">/ {exercises?.length}</span>
        </div>
        <button 
          onClick={handleFinish} 
          disabled={isSyncing}
          className="btn-pink px-16 py-4 uppercase font-black tracking-widest text-[11px] flex items-center gap-4"
        >
          {isSyncing && <Loader2 size={14} className="animate-spin" />}
          Return to Library
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-12 animate-fade-in w-full max-w-5xl mx-auto py-12">
      {/* Structural Header */}
      <div className="flex justify-between items-center px-4">
        <div className="space-y-2 text-left">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Grammar Logic Mapping</span>
          <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wide">Analysis {currentIndex + 1}</h2>
        </div>
        <div className="text-right space-y-2">
           <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Pattern Retention</span>
           <div className="flex items-center gap-4">
              <div className="h-1.5 w-40 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                 <motion.div 
                    animate={{ width: `${((currentIndex + 1) / (exercises?.length || 1)) * 100}%` }}
                    className="h-full bg-white shadow-[0_0_20px_rgba(255,214,224,0.4)]"
                 />
              </div>
              <span className="text-[11px] font-display font-bold text-white">{currentIndex + 1} / {exercises?.length}</span>
           </div>
        </div>
      </div>

      {/* Main Analysis Board */}
      <AnimatePresence mode="wait">
        <motion.div
           key={currentIndex}
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.98 }}
           className="space-y-12"
        >
          <GlassCard className="p-24 flex flex-col items-center gap-16 text-center relative overflow-hidden group border-white/10 shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
               <span className="text-[12rem] font-display font-bold text-white">文</span>
            </div>
            
            <div className="space-y-12 max-w-4xl text-center">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] mb-4">Scholarly Artifact No.{currentIndex + 1}</p>
              <h1 className="text-6xl md:text-7xl font-sans font-medium text-white tracking-wide leading-relaxed">
                  {currentExercise?.sentence.split('___').map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className={cn(
                          "mx-4 inline-flex items-center justify-center min-w-[3rem] border-b-4 h-16 transition-all duration-300",
                          selectedOption ? "border-white scale-110 text-white font-bold" : "border-white/20 scale-100 text-white/10"
                        )}>
                          {selectedOption || '？'}
                        </span>
                      )}
                    </React.Fragment>
                  ))}
              </h1>
              
              <div className="h-px w-32 bg-white/10 mx-auto" />
              
              <p className="text-2xl text-white/40 font-display italic tracking-[0.1em] opacity-80 uppercase transition-opacity">
                {currentExercise?.translation}
              </p>
            </div>

            {/* Explanation Reveal */}
            <AnimatePresence>
               {selectedOption && (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 bg-white/5 border border-white/10 rounded-3xl max-w-2xl text-left space-y-4"
                 >
                    <div className="flex items-center gap-4 text-emerald-400">
                       <CheckCircle2 size={24} />
                       <span className="text-[10px] font-black uppercase tracking-[0.4em]">Pattern Logic Reveal</span>
                    </div>
                    <p className="text-white text-lg font-medium leading-relaxed italic font-display">
                      {currentExercise?.explanation}
                    </p>
                 </motion.div>
               )}
            </AnimatePresence>
          </GlassCard>

          {/* Options Palette */}
          <div className="flex flex-wrap justify-center gap-8 py-4">
            {currentExercise?.options.map((option, i) => {
              const isSelected = selectedOption === option;
              const isOptionCorrect = option === currentExercise.correct;
              const showResult = selectedOption !== null;

              return (
                <button
                  key={i}
                  onClick={() => handleOptionClick(option)}
                  disabled={showResult}
                  className={cn(
                    "min-w-[140px] px-10 py-6 rounded-2xl border text-3xl font-display font-bold uppercase tracking-widest transition-all relative overflow-hidden group active:scale-[0.98] shadow-lg",
                    !showResult && "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/40 hover:text-white hover:scale-110",
                    showResult && isOptionCorrect && "bg-[#FFD6E0]/20 border-[#FFD6E0]/50 text-[#FFD6E0] scale-110 shadow-[0_0_40px_-5px_rgba(255,214,224,0.3)]",
                    showResult && isSelected && !isOptionCorrect && "bg-rose-500/20 border-rose-500/50 text-rose-400 opacity-50",
                    showResult && !isSelected && !isOptionCorrect && "opacity-10 grayscale blur-[2px]"
                  )}
                >
                   {option}
                   {isSelected && isCorrect && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      className="absolute inset-0 bg-[#FFD6E0]/40 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 text-center pb-24">
         <button 
           onClick={onExit}
           className="text-[10px] font-black text-white/20 hover:text-white/60 transition-colors uppercase tracking-[0.6em] italic"
         >
           Abandon Ritual
         </button>
      </div>
    </div>
  );
}
