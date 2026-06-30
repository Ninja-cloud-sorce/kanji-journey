import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Settings, 
  HelpCircle, 
  Eraser, 
  RotateCcw, 
  Play, 
  PenTool, 
  Target, 
  BookOpen, 
  Timer, 
  AlertCircle,
  Lightbulb,
  MoreVertical,
  Loader2,
  ChevronRight
} from "lucide-react";
import { GlassCard } from './ui/GlassCard';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { useCompleteLesson } from '@/hooks/data/useLessonProgress';
import { supabase } from '@/integrations/supabase/client';
import hiraganaData from '@/data/japanese/hiragana.json';
import katakanaData from '@/data/japanese/katakana.json';

import { useUpdateProgress } from '@/hooks/data/useUpdateProgress';

function getLocalCharacters(collectionId: string | null) {
  if (collectionId === 'h1') {
    return hiraganaData.map((item) => item.char);
  }

  if (collectionId === 'k1') {
    return katakanaData.map((item) => item.char);
  }

  return [];
}

export function WritingSession({ onBack }: { onBack: () => void }) {
  const { selectedLessonId } = useStore();
  const { user } = useAuth();
  const { mutate: updateProgressMutation, isPending: isSyncing } = useUpdateProgress();
  
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [startTime] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    async function fetchLesson() {
      if (!selectedLessonId) {
        setLoading(false);
        return;
      }

      const localCharacters = getLocalCharacters(selectedLessonId);
      if (localCharacters.length > 0) {
        setLesson({
          id: selectedLessonId,
          title: 'Local Writing Practice',
          characters: localCharacters,
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('collection_id', selectedLessonId)
        .order('sort_order', { ascending: true })
        .limit(1);
      
      if (!error) setLesson(data?.[0] ?? null);
      setLoading(false);
    }
    fetchLesson();
  }, [selectedLessonId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const handleFinish = () => {
    if (user && selectedLessonId) {
      updateProgressMutation({
        userId: user.id,
        level: 'N5',
        score: 100, // Completion based
        lessonId: selectedLessonId
      }, {
        onSuccess: () => {
          onBack();
        },
        onError: () => {
          onBack(); // Exit anyway if error, to avoid being stuck
        }
      });
    } else {
      onBack();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <Loader2 className="w-12 h-12 text-white/20 animate-spin" />
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] animate-pulse">Initializing Canvas</p>
      </div>
    );
  }

  const characters = lesson?.characters || ['道', '理', '法'];
  const currentChar = characters[currentCharIndex];

  if (isFinished) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[80vh] gap-12 text-center p-12">
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full" />
          <Target size={80} className="text-white relative z-10" />
        </div>
        <div className="space-y-4">
          <h2 className="text-5xl font-display font-bold text-white uppercase tracking-tight">Writing Ritual Complete</h2>
          <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.4em]">
            {isSyncing ? 'Submitting to the Scribes...' : 'Calligraphy Mastered'}
          </p>
        </div>
        <div className="text-8xl font-display font-bold text-white uppercase">
          Done
        </div>
        <button 
          onClick={handleFinish} 
          disabled={isSyncing}
          className="btn-pink px-16 py-4 uppercase font-black tracking-widest text-[11px] flex items-center gap-4 relative z-50 cursor-pointer"
        >
          {isSyncing && <Loader2 size={14} className="animate-spin" />}
          Return to Library
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-10 animate-fade-in w-full pb-20 mt-4 text-left min-h-screen uppercase font-sans">
      {/* Top Navigation */}
      <header className="flex items-center justify-between pt-2 px-1">
        <div className="flex items-center gap-10">
          <h2 className="text-2xl font-display font-bold text-white tracking-wide uppercase">Writing Hub</h2>
        </div>
      </header>

      {/* Writing Session Grid */}
      <div className="grid grid-cols-12 gap-16 pt-12 items-start h-full">
         
         {/* Left Side: Writing Area */}
         <div className="col-span-8 space-y-12">
            <div className="space-y-4 flex flex-col items-start text-left">
              <h1 className="text-7xl font-display font-bold text-white tracking-tight leading-tight uppercase">Calligraphy Practice</h1>
              <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em]">Stroke Order mastery • Session #{currentCharIndex + 1}</p>
            </div>

            <div className="grid grid-cols-2 gap-8 h-[540px]">
               {/* Kanji Preview Card */}
               <GlassCard className="flex flex-col items-center justify-center relative group p-12 border-white/10 shadow-xl">
                  <div className="flex flex-col items-center gap-12 font-sans overflow-visible">
                     <AnimatePresence mode="wait">
                       <motion.span 
                         key={currentChar}
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 1.2 }}
                         className="text-[160px] font-display font-bold text-white tracking-tighter select-none font-display z-10"
                       >
                         {currentChar}
                       </motion.span>
                     </AnimatePresence>
                  </div>

                  {currentCharIndex < characters.length - 1 && (
                     <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentCharIndex(prev => prev + 1);
                      }}
                      className="absolute bottom-8 right-8 flex items-center gap-2 text-[10px] font-black text-white/40 hover:text-white transition-colors tracking-widest uppercase z-50 cursor-pointer p-4"
                     >
                       Next <ChevronRight size={14} />
                     </button>
                  )}
               </GlassCard>

               {/* Drawing Canvas Area placeholder */}
               <GlassCard className="bg-white/5 border-white/10 p-12 relative flex flex-col overflow-hidden shadow-inner flex flex-col items-start">
                  {/* Grid Background */}
                  <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FFFFFF 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                  
                  <div className="flex items-center justify-start gap-4 relative z-50 font-sans">
                     <button className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black tracking-widest text-white/40 hover:text-white hover:border-white/40 transition-all uppercase shadow-lg cursor-pointer">
                        <RotateCcw size={16} /> Undo
                     </button>
                     <button className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black tracking-widest text-white/40 hover:text-white hover:border-white/40 transition-all uppercase shadow-lg cursor-pointer">
                        <Eraser size={16} /> Clear
                     </button>
                  </div>

                  <div className="flex-1 flex items-center justify-center relative font-display w-full">
                     <span className="text-[240px] text-white opacity-[0.03] select-none pointer-events-none font-bold">
                       {currentChar}
                     </span>
                     <p className="absolute text-[10px] font-black text-white/10 uppercase tracking-[0.5em] bottom-10">Trace directly on the stone</p>
                  </div>

               </GlassCard>
            </div>
         </div>

         {/* Right Side: Sidebar Analytics */}
         <div className="col-span-4 h-full font-sans">
            <GlassCard className="p-12 space-y-12 border-white/10 h-full shadow-2xl flex flex-col items-start">
                <div className="space-y-3 flex flex-col items-start text-left">
                  <h2 className="text-2xl font-display font-bold text-white tracking-wide uppercase">Session Analytics</h2>
                  <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Ink Calibration</p>
                </div>

                <div className="space-y-12 w-full flex flex-col items-start">
                   {/* Accuracy */}
                   {/* Accuracy - Dynamic Decay */}
                   <div className="p-8 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-start gap-6 group shadow-sm transition-all hover:bg-white/10 w-full overflow-hidden">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 shadow-sm overflow-hidden">
                          <Target 
                            size={22} 
                            style={{ 
                              opacity: Math.max(0.1, 1 - (elapsed / 300)),
                              transform: `scale(${Math.max(0.7, 1 - (elapsed / 600))})`
                            }}
                            className="transition-all duration-1000 ease-linear"
                          />
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] font-sans leading-none">Accuracy</h4>
                          <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest">Ritual Life</p>
                        </div>
                      </div>
                   </div>

                   {/* Progress */}
                   <div className="space-y-6 flex flex-col items-start w-full font-sans">
                      <div className="flex items-center justify-between text-[11px] font-black text-white/40 tracking-widest uppercase w-full">
                         <div className="flex items-center gap-3">
                           <BookOpen size={18} className="text-white/20" />
                           <span>Characters</span>
                         </div>
                         <span className="text-white font-bold">{currentCharIndex + 1} / {characters.length}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                         <motion.div initial={{ width: 0 }} animate={{ width: `${((currentCharIndex + 1) / characters.length) * 100}%` }} className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                      </div>
                   </div>

                   {/* Time Elapsed */}
                   <div className="space-y-6 flex flex-col items-start w-full">
                      <div className="flex items-center gap-3 text-[11px] font-black text-white/40 tracking-widest uppercase font-sans">
                         <Timer size={18} className="text-white/20" />
                         <span>Inscribed Time</span>
                      </div>
                      <p className="text-6xl font-display font-bold text-white tracking-wide">{formatTime(elapsed)}</p>
                   </div>

                   {/* Stroke Pressure Tip placeholder */}
                   <div className="p-10 bg-white/5 border border-white/10 rounded-[24px] space-y-6 relative overflow-hidden flex flex-col items-start w-full shadow-lg">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 shadow-sm flex items-center justify-center text-white/40">
                        <Lightbulb size={24} />
                      </div>
                      <p className="text-[11px] italic text-white/40 leading-relaxed font-sans text-left font-medium uppercase tracking-widest">
                        Focus on the fluidity of the final stroke. The ritual requires unwavering focus.
                      </p>
                   </div>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFinished(true);
                  }}
                  className="btn-pink w-full flex items-center justify-center gap-4 group shadow-xl relative z-50 cursor-pointer"
                >
                  <span className="text-[11px] font-black">FINISH SESSION</span>
                </button>
            </GlassCard>
         </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
