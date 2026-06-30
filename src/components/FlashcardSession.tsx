import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  RotateCcw, 
  Check, 
  Zap,
  MoreVertical,
  Loader2,
  BookOpen
} from "lucide-react";
import { cn } from '@/lib/utils';
import { GlassCard } from './ui/GlassCard';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/store/useStore';
import { useFlashcardsDue, useReviewFlashcard, FlashcardWithLegacy } from '@/hooks/data/useFlashcards';
import { toast } from 'sonner';

export function FlashcardSession({ onExit }: { onExit: () => void }) {
  const { user } = useAuth();
  const { selectedLessonId } = useStore();
  const { data: queue, isLoading } = useFlashcardsDue(user?.id, selectedLessonId);
  const reviewMutation = useReviewFlashcard();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [sessionQueue, setSessionQueue] = useState<FlashcardWithLegacy[]>([]);
  const [sessionSeed, setSessionSeed] = useState<string | null>(null);

  useEffect(() => {
    if (!queue) return;

    const incomingSeed = queue.map((card) => card.id).join('|');
    if (incomingSeed !== sessionSeed) {
      setSessionQueue(queue);
      setSessionSeed(incomingSeed);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsExiting(false);
    }
  }, [queue, sessionSeed]);

  const totalCards = useMemo(() => sessionQueue.length + currentIndex, [currentIndex, sessionQueue.length]);
  const visiblePosition = Math.min(currentIndex + 1, totalCards || 1);
  const progress = (visiblePosition / (totalCards || 1)) * 100;
  const currentCard = sessionQueue[0];

  const handleGrade = async (grade: number) => {
    if (!currentCard || !user) return;

    const remainingCards = sessionQueue.slice(1);
    setCurrentIndex((prev) => prev + 1);
    setSessionQueue(remainingCards);
    setIsFlipped(false);

    if (remainingCards.length === 0) {
      setIsExiting(true);
      setTimeout(onExit, 800);
    }

    try {
      await reviewMutation.mutateAsync({
        cardId: currentCard.id,
        grade,
        userId: user.id
      });
    } catch (error) {
      toast.error('Progress was not saved, but the session continued.');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[var(--bg-base)] z-[100] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-12 h-12 text-white/20 animate-spin" />
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] animate-pulse">Syncing Flashcard Deck</p>
        </div>
      </div>
    );
  }

  if (!currentCard && !isLoading) {
    return (
      <div className="fixed inset-0 bg-[var(--bg-base)] z-[100] flex flex-col items-center justify-center gap-10 font-sans selection:bg-white/20 uppercase">
        <div className="scholar-bg opacity-30" />
        <BookOpen size={48} className="text-white/10" />
        <div className="text-center space-y-4">
           <h2 className="text-4xl font-display font-bold text-white tracking-widest uppercase">Deck Exhausted</h2>
           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">No reviews scheduled for this hour.</p>
        </div>
        <button onClick={onExit} className="btn-pink !px-12 !py-4 shadow-xl">Return to Sanctuary</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[var(--bg-base)] text-[var(--text-primary)] z-[100] flex flex-col font-sans selection:bg-white/20 overflow-hidden text-left uppercase">
      {/* Hand-Drawn Atmospheric Layer */}
      <div className="scholar-bg opacity-30" />

      {/* Top Header */}
      <header className="flex items-center justify-between px-16 py-10 relative z-10 transition-opacity duration-700" style={{ opacity: isExiting ? 0 : 1 }}>
        <div className="flex items-center gap-8">
          <h2 className="text-3xl font-display font-bold text-white tracking-tight uppercase">Cognitive Ritual</h2>
          <div className="w-px h-6 bg-white/20" />
          <span className="text-[11px] font-black text-white/60 uppercase tracking-[0.4em]">Review Session</span>
        </div>

        <div className="flex items-center gap-12">
          <div className="flex flex-col items-end gap-3 text-right">
            <div className="flex items-center gap-4 text-[11px] font-black text-white/40 tracking-widest uppercase">
               <span>{visiblePosition} / {totalCards || 1} REMAINING</span>
               <span className="text-white">{Math.round(progress)}%</span>
            </div>
            <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
            </div>
          </div>
          <button 
            onClick={onExit}
            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 hover:scale-110 active:scale-95 transition-all shadow-sm"
          >
            <X size={28} />
          </button>
        </div>
      </header>

      {/* Main Study Area */}
      <main className="flex-1 flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          {!isExiting && currentCard && (
            <motion.div 
              key={currentCard.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-[720px] h-full max-h-[480px] p-2 relative group cursor-pointer"
            >
              <GlassCard className="w-full h-full flex flex-col items-center justify-center relative bg-[var(--bg-surface)] border-[var(--border-default)] shadow-2xl transition-all duration-700">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isFlipped ? 'back' : 'front'}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center gap-8"
                    >
                      <span className={cn(
                        "font-display font-bold text-white tracking-tighter select-none transition-all duration-700",
                        isFlipped ? "text-8xl italic opacity-80" : "text-[220px]"
                      )}>
                        {isFlipped ? currentCard.back : currentCard.front}
                      </span>
                      {isFlipped && currentCard.hint && (
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">{currentCard.hint}</p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                 
                 <div className="absolute bottom-12 flex flex-col items-center gap-2 opacity-10 group-hover:opacity-40 transition-opacity">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">{isFlipped ? 'Click to obscure' : 'Reveal Recall'}</p>
                    <div className="w-px h-4 bg-white/20" />
                 </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Control Buttons */}
      <footer className={cn(
        "h-64 flex items-center justify-center gap-24 pb-12 relative z-10 transition-all duration-700",
        !isFlipped ? "opacity-20 pointer-events-none scale-95 blur-sm" : "opacity-100"
      )}>
        <div className="flex flex-col items-center gap-5">
           <button 
            onClick={() => handleGrade(1)}
            className="w-16 h-16 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:scale-110 active:scale-95 transition-all group"
           >
             <RotateCcw size={22} className="group-hover:-rotate-45 transition-transform" />
           </button>
           <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] font-sans">RECALIBRATE</span>
        </div>

        <div className="flex flex-col items-center gap-5 scale-125">
           <button 
            onClick={() => handleGrade(3)}
            className="w-20 h-20 rounded-[28px] bg-white flex items-center justify-center text-black shadow-xl hover:scale-110 active:scale-95 transition-all"
           >
             <Check size={32} strokeWidth={3} />
           </button>
           <span className="text-[11px] font-black text-white uppercase tracking-[0.4em] font-display">MASTERY</span>
        </div>

        <div className="flex flex-col items-center gap-5">
           <button 
            onClick={() => handleGrade(4)}
            className="w-16 h-16 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:scale-110 active:scale-95 transition-all group"
           >
             <Zap size={22} className="group-hover:scale-110 transition-transform" />
           </button>
           <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] font-sans">FLUIDITY</span>
        </div>
      </footer>
    </div>
  );
}
