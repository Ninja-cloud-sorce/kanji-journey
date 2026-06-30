import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  HelpCircle, 
  User, 
  MessageCircle, 
  BookOpen, 
  Sparkles, 
  Lightbulb,
  Flame,
  ChevronRight
} from "lucide-react";
import { GlassCard } from './ui/GlassCard';

interface Deck {
  id: string;
  name: string;
  icon: typeof BookOpen;
  progress: number;
  status: 'Review' | 'Continue' | 'Start';
  isNew?: boolean;
}

const DECKS: Deck[] = [
  { id: '1', name: 'Hiragana Deck', icon: BookOpen, progress: 100, status: 'Review' },
  { id: '2', name: 'Katakana Deck', icon: BookOpen, progress: 45, status: 'Continue' },
  { id: '3', name: 'N2 Vocabulary Deck', icon: Sparkles, progress: 0, status: 'Start', isNew: true },
  { id: '4', name: 'Common Phrases', icon: MessageCircle, progress: 12, status: 'Continue' },
];

export function Flashcards({ onStartSession }: { onStartSession?: () => void }) {
  return (
    <div className="flex flex-col gap-14 animate-fade-in w-full pb-20 mt-4 text-left">
      {/* Top Header */}
      <header className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-10">
          <h2 className="text-2xl font-serif font-bold text-primary tracking-wide">Collections</h2>
          <nav className="flex items-center gap-10">
            {['Decks', 'Favorites', 'Recently Studied'].map((item) => (
              <button 
                key={item} 
                className={`text-[11px] font-black tracking-widest transition-colors ${item === 'Decks' ? 'text-accent border-b-2 border-accent pb-1' : 'text-pink-700 hover:text-accent'}`}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-6">
          <Settings size={18} className="text-pink-500 cursor-pointer hover:text-accent transition-colors" />
          <HelpCircle size={18} className="text-pink-500 cursor-pointer hover:text-accent transition-colors" />
           <div className="w-10 h-10 rounded-xl bg-white/40 border border-pink-200/50 flex items-center justify-center overflow-hidden">
             <User size={18} className="text-pink-500" />
          </div>
        </div>
      </header>

      {/* Grid Content */}
      <div className="space-y-16">
        <section className="space-y-8 flex flex-col items-start text-left">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-2 flex flex-col items-start">
              <h2 className="text-4xl font-serif font-bold text-primary tracking-tight">Hiragana Foundations</h2>
              <p className="text-pink-900 text-base font-medium italic font-serif opacity-80">Core syllabary study for basic literacy.</p>
            </div>
            <button className="text-[11px] font-black text-pink-700 hover:text-accent transition-colors uppercase tracking-widest">View All</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {[1, 2, 3].map((i) => (
              <GlassCard 
                key={i} 
                onClick={onStartSession}
                className="p-10 space-y-10 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-400 group-hover:text-accent group-hover:scale-110 transition-all">
                  <BookOpen size={28} />
                </div>
                <div className="space-y-3 flex flex-col items-start">
                  <h3 className="text-2xl font-serif font-bold text-primary group-hover:text-accent transition-colors">Session {i}</h3>
                  <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest leading-relaxed">System-generated focus session for reinforcement.</p>
                </div>
                <div className="flex items-center gap-4 w-full">
                   <div className="h-1.5 flex-1 bg-pink-100/50 rounded-full overflow-hidden">
                      <div className="h-full w-[40%] bg-accent shadow-[0_0_10px_rgba(219,39,119,0.2)]" />
                   </div>
                   <span className="text-[10px] font-black text-pink-500">40%</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      </div>

      {/* Deck List */}
      <div className="mt-8 space-y-8 flex flex-col items-start text-left">
        <h2 className="text-4xl font-serif font-bold text-primary tracking-tight">Your Decks</h2>
        <GlassCard className="w-full relative overflow-hidden divide-y divide-pink-100 shadow-sm">
          {DECKS.map((deck) => (
            <div key={deck.id} onClick={onStartSession} className="p-10 flex items-center justify-between hover:bg-white/40 transition-colors group cursor-pointer">
              <div className="flex items-center gap-12 min-w-[400px] flex-1">
                <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-400 group-hover:text-accent group-hover:rotate-12 transition-all">
                  <deck.icon size={26} />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-serif font-bold text-primary tracking-wide leading-tight group-hover:text-accent transition-colors">{deck.name}</h3>
                    {deck.isNew && (
                      <span className="px-3 py-1 bg-accent/20 border border-accent/20 rounded-lg text-[9px] font-black text-accent tracking-widest uppercase shadow-sm">NEW</span>
                    )}
                  </div>
                  <p className="text-[11px] text-pink-500 font-black uppercase tracking-widest">ACTIVE STUDY PROTOCOL</p>
                </div>
              </div>

              <div className="flex items-center gap-20">
                <div className="w-64 space-y-4 text-right flex flex-col items-end">
                  <div className="flex justify-between items-center text-[10px] font-black text-pink-700/60 tracking-widest uppercase w-full">
                    <span>{deck.status === 'Start' ? 'PROTOCOL STATUS' : 'MASTERED'}</span>
                    <span className="text-primary font-bold">{deck.status === 'Start' ? 'UNSTARTED' : deck.progress + '%'}</span>
                  </div>
                  <div className="h-1.5 w-full bg-pink-100/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: deck.progress + '%' }}
                      className="h-full bg-accent/80 shadow-[0_0_10px_rgba(219,39,119,0.2)]"
                    />
                  </div>
                </div>

                <div className="w-40 flex justify-end">
                   <button className={`${deck.status === 'Review' ? 'btn-secondary-pink' : deck.status === 'Continue' ? 'btn-pink' : 'btn-secondary-pink !border-pink-300'} !py-3 !text-[10px] w-32 shadow-sm`}>
                    {deck.status.toUpperCase()}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </GlassCard>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-12 gap-8 mt-4 w-full">
        {/* Study Tip */}
        <GlassCard className="col-span-12 p-12 flex flex-col justify-between relative overflow-hidden group min-h-[340px]">
           <div className="absolute top-0 right-0 p-20 opacity-[0.03] text-[25rem] font-serif font-bold text-accent translate-x-20 -translate-y-20 select-none pointer-events-none">識</div>
          
          <div className="space-y-8 relative z-10 flex flex-col items-start text-left max-w-3xl">
             <div className="flex items-center gap-4">
                <div className="w-1 h-10 bg-accent rounded-full" />
                <h2 className="text-4xl font-serif font-bold text-primary tracking-tight">Spaced Repetition <span className="italic text-accent font-medium">Protocol</span></h2>
             </div>
            <p className="text-pink-900 text-lg leading-relaxed font-medium italic font-serif opacity-90">
              Studies suggest that recalling information just as you are about to forget it strengthens memory pathways. Our algorithm schedules your reviews at these critical points of cognitive threshold.
            </p>
          </div>
          <div className="mt-12 flex items-center gap-6 py-5 px-8 bg-white/40 border border-pink-100 rounded-2xl w-fit relative z-10 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-accent shadow-inner">
              <Lightbulb size={24} />
            </div>
            <div className="flex flex-col items-start text-left">
               <p className="text-[10px] font-black text-pink-700/60 uppercase tracking-[0.2em] mb-1">Ritual Insight</p>
               <p className="text-base font-serif font-bold text-primary/80">Next Peak Recall: 4:00 PM Today</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
