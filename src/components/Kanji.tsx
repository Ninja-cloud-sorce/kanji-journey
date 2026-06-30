import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Layers, 
  Target, 
  Bookmark,
  History,
  MoreVertical,
  BookOpen
} from "lucide-react";
import { GlassCard } from './ui/GlassCard';

interface KanjiEntry {
  id: string;
  char: string;
  readings: { on: string; kun: string };
  meaning: string;
  strokes: number;
  level: string;
  progress: number;
}

const KANJI_DATA: KanjiEntry[] = [
  { id: '1', char: '道', readings: { on: 'ドウ', kun: 'みち' }, meaning: 'Way, Road, Path', strokes: 12, level: 'N4', progress: 85 },
  { id: '2', char: '学', readings: { on: 'ガク', kun: 'まな.ぶ' }, meaning: 'Study, Learning, Science', strokes: 8, level: 'N5', progress: 100 },
  { id: '3', char: '書', readings: { on: 'ショ', kun: 'か.く' }, meaning: 'Write, Book, Script', strokes: 10, level: 'N4', progress: 45 },
  { id: '4', char: '識', readings: { on: 'シキ', kun: 'し.る' }, meaning: 'Knowledge, Discern', strokes: 19, level: 'N2', progress: 15 },
];

export function Kanji() {
  return (
    <div className="flex flex-col gap-14 animate-fade-in w-full pb-20 selection:bg-accent/30 text-white">
      {/* Top Header & Search */}
      <header className="flex flex-col gap-10">
        <div className="flex items-center justify-between">
           <div className="space-y-4">
             <h1 className="text-6xl font-serif font-bold text-white tracking-tight leading-tight">Kanji Registry</h1>
             <p className="text-[10px] font-black text-muted uppercase tracking-[0.4em]">Character Database • Scholar Level</p>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 px-6 py-3 bg-white/[0.03] border border-white/[0.05] rounded-xl text-muted text-xs font-bold uppercase tracking-widest">
                 <History size={16} />
                 Recent Search
              </div>
              <div className="flex items-center gap-4 px-6 py-3 bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 rounded-xl text-accent text-xs font-bold uppercase tracking-widest">
                 <Bookmark size={16} />
                 Saved Items (12)
              </div>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex-1 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-white transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search by Kanji, Reading, or Meaning..."
                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl py-6 px-16 text-lg font-serif placeholder:text-muted focus:outline-none focus:border-white/10 transition-all focus:bg-white/[0.03]"
              />
           </div>
           <button className="h-full px-8 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex items-center justify-center text-muted hover:text-white transition-all">
              <Filter size={20} />
           </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-16">
         {/* Left Side: Result List */}
         <div className="col-span-8 space-y-8">
            <div className="flex items-center justify-between border-b border-white/[0.03] pb-6">
               <div className="flex items-center gap-8">
                  {['All', 'Essential', 'Advanced', 'Radicals'].map((tab) => (
                    <button key={tab} className={`text-[11px] font-black tracking-[0.3em] uppercase ${tab === 'All' ? 'text-white border-b border-white pb-2' : 'text-muted hover:text-white'}`}>
                      {tab}
                    </button>
                  ))}
               </div>
               <span className="text-[10px] font-bold text-muted uppercase tracking-widest">1,248 Results found</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
               {KANJI_DATA.map((kanji) => (
                 <GlassCard 
                   key={kanji.id}
                   className="p-8 flex items-center justify-between hover:bg-white/[0.02] border-white/[0.03] group cursor-pointer transition-all h-[140px]"
                 >
                    <div className="flex items-center gap-10 h-full">
                       <div className="w-20 h-20 bg-white/[0.015] border border-white/[0.04] rounded-2xl flex items-center justify-center text-5xl font-serif text-[#B4C6FC]/90 group-hover:scale-110 transition-all">
                          {kanji.char}
                       </div>
                       
                       <div className="flex flex-col justify-center h-full gap-2 border-l border-white/[0.03] pl-10">
                          <h3 className="text-2xl font-serif font-bold text-white tracking-wide">{kanji.meaning}</h3>
                          <div className="flex items-center gap-6">
                             <div className="flex flex-col">
                                <span className="text-[9px] font-black text-muted uppercase tracking-widest">Onyomi</span>
                                <span className="text-xs font-serif text-white/80">{kanji.readings.on}</span>
                             </div>
                             <div className="flex flex-col border-l border-white/[0.05] pl-6">
                                <span className="text-[9px] font-black text-muted uppercase tracking-widest">Kunyomi</span>
                                <span className="text-xs font-serif text-white/80">{kanji.readings.kun}</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-12 text-right">
                       <div className="flex flex-col gap-2 w-32">
                          <div className="flex justify-between text-[9px] font-black text-muted uppercase tracking-widest">
                             <span>Mastery</span>
                             <span className="text-white/60">{kanji.progress}%</span>
                          </div>
                          <div className="h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${kanji.progress}%` }} className="h-full bg-accent" />
                          </div>
                       </div>
                       <div className="px-3 py-1 bg-white/[0.03] border border-white/[0.05] rounded text-[10px] font-black text-muted tracking-widest uppercase">
                          {kanji.level}
                       </div>
                       <ChevronRight size={18} className="text-muted group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                 </GlassCard>
               ))}
            </div>
         </div>

         {/* Right Side: Registry Analytics & Quick Filters */}
         <div className="col-span-4 space-y-10">
            <GlassCard className="p-10 space-y-12 bg-white/[0.015] border border-white/[0.05]">
               <div className="space-y-4">
                  <h2 className="text-xl font-serif font-bold text-white tracking-wide">Registry Overview</h2>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Database Health & Progress</p>
               </div>

               <div className="space-y-10">
                  <div className="space-y-4">
                     <div className="flex items-center justify-between text-[11px] font-black text-secondary tracking-widest uppercase">
                        <div className="flex items-center gap-3">
                           <Target size={16} />
                           <span>Overall Mastery</span>
                        </div>
                        <span className="text-white">42%</span>
                     </div>
                     <div className="h-6 w-full bg-white/[0.03] rounded-md overflow-hidden relative border border-white/[0.05]">
                        <motion.div initial={{ width: 0 }} animate={{ width: '42%' }} className="h-full bg-accent/40" />
                        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white/50 tracking-widest uppercase">
                           892 / 2136 Characters Mastered
                        </div>
                     </div>
                  </div>

                  <div className="p-8 bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-2xl relative overflow-hidden group cursor-pointer">
                     <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-3">
                           <Layers size={16} className="text-accent" />
                           <span className="text-[10px] font-black text-white uppercase tracking-widest">Primitive Origin Study</span>
                        </div>
                        <h4 className="text-2xl font-serif font-bold text-white leading-tight">Deciphering Radicals</h4>
                        <p className="text-xs text-muted leading-relaxed font-medium">Understand the building blocks of the Jōyō Kanji through historical pictograms.</p>
                     </div>
                     <BookOpen className="absolute -right-4 -bottom-4 w-32 h-32 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                  </div>
               </div>
               
               <button className="w-full py-5 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] rounded-xl text-[10px] font-black text-white uppercase tracking-[0.4em] transition-all">
                  EXPORT DATABASE
               </button>
            </GlassCard>
            
            <div className="p-8 space-y-6">
               <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Quick Radicals</h3>
               <div className="flex flex-wrap gap-3">
                  {['氵', '人', '口', '火', '手', '木', '目', '女'].map((rad) => (
                    <span key={rad} className="w-10 h-10 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-lg font-serif text-muted hover:text-white hover:bg-white/[0.04] cursor-pointer transition-all">
                       {rad}
                    </span>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
