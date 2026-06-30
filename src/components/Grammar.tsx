import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  History, 
  ArrowRight, 
  BookMarked, 
  Flame,
  Layout,
  ExternalLink
} from "lucide-react";
import { GlassCard } from './ui/GlassCard';

interface GrammarModule {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  status: 'IN PROGRESS' | 'NOT STARTED' | 'LOCKED';
  progress?: number;
}

const MODULES: GrammarModule[] = [
  { id: '1', tag: '[助詞]', title: 'Particles', subtitle: 'Understanding post-positional semantic markers (は, が, を, に)', status: 'IN PROGRESS', progress: 65 },
  { id: '2', tag: '[動詞]', title: 'Verb Conjugation', subtitle: 'Group 1, 2, and Irregular patterns across all temporal aspects', status: 'NOT STARTED' },
  { id: '3', tag: '[敬語]', title: 'Honorifics (Keigo)', subtitle: 'Sonkeigo, Kenjougo, and Teineigo sociolinguistic rules', status: 'LOCKED' },
  { id: '4', tag: '[文型]', title: 'Sentence Structures', subtitle: 'Complex clause chaining, conditional forms, and nominalization', status: 'NOT STARTED' },
];

export function Grammar() {
  return (
    <div className="flex flex-col gap-10 animate-fade-in w-full pb-20 selection:bg-accent/30 text-white">
       {/* Top Navigation */}
       <header className="flex items-center justify-between pt-2">
        <nav className="flex items-center gap-10">
          {['Grammar', 'Curriculum', 'Resources'].map((item) => (
            <button 
              key={item} 
              className={`text-[11px] font-bold tracking-widest transition-colors ${item === 'Grammar' ? 'text-white border-b-2 border-white pb-1' : 'text-muted hover:text-secondary'}`}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </nav>
        
        <div className="flex items-center gap-6">
          <div className="px-5 py-2 bg-white/[0.03] border border-white/[0.05] rounded-full flex items-center gap-3">
            <Flame size={14} className="text-accent/60 fill-accent/30" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">24 Day Streak</span>
          </div>
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-muted">
             <Layout size={18} />
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="space-y-4 pt-6">
        <span className="text-[11px] font-black text-muted uppercase tracking-[0.4em]">Curriculum Overview</span>
        <h1 className="text-7xl font-serif font-bold text-white tracking-tight">Grammar <span className="italic text-secondary font-medium ml-2">Structure</span></h1>
        <p className="text-secondary text-lg font-medium opacity-80 max-w-2xl leading-relaxed mt-2">
          Master the architectural pillars of the Japanese language. From basic particles to complex honorific expressions, build your sanctuary of understanding piece by piece.
        </p>
      </section>

      {/* Module List */}
      <div className="mt-8 space-y-4">
        {/* Table Headers */}
        <div className="flex px-10 mb-4 text-[9px] font-bold text-muted uppercase tracking-[0.3em]">
          <span className="w-40">Classification</span>
          <span className="flex-1">Focus Module</span>
          <span className="w-64 text-right">Mastery Progress</span>
        </div>

        <div className="glass-card divide-y divide-white/[0.02]">
          {MODULES.map((module) => (
            <div key={module.id} className={`p-10 flex items-center justify-between group transition-all ${module.status === 'LOCKED' ? 'opacity-40' : 'hover:bg-white/[0.015] cursor-pointer'}`}>
              <div className="flex items-center w-full">
                <span className="w-40 text-xl font-serif font-bold text-muted group-hover:text-white transition-colors">{module.tag}</span>
                
                <div className="flex-1 space-y-1.5 ml-8 pr-12 text-left">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-serif font-bold text-white tracking-wide">{module.title}</h3>
                    {module.status === 'IN PROGRESS' && <span className="px-2 py-0.5 bg-accent/20 border border-accent/30 rounded text-[8px] font-black text-accent tracking-widest uppercase">IN PROGRESS</span>}
                    {module.status === 'NOT STARTED' && <span className="px-2 py-0.5 bg-white/[0.05] border border-white/[0.05] rounded text-[8px] font-black text-muted tracking-widest uppercase">NOT STARTED</span>}
                  </div>
                  <p className="text-sm text-secondary font-medium tracking-wide">{module.subtitle}</p>
                </div>

                <div className="w-64 flex items-center justify-end gap-10">
                  {module.status === 'IN PROGRESS' && (
                    <div className="flex flex-col items-end gap-2 pr-4">
                      <div className="h-0.5 w-32 bg-white/[0.04] rounded-full overflow-hidden">
                        <motion.div animate={{ width: '65%' }} className="h-full bg-accent" />
                      </div>
                      <span className="text-[9px] font-bold text-muted uppercase tracking-widest">65% Mastery</span>
                    </div>
                  )}
                  
                  <button className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${module.status === 'LOCKED' ? 'text-muted' : 'text-secondary hover:text-white group-hover:translate-x-1'}`}>
                    {module.status === 'IN PROGRESS' ? 'Continue' : module.status === 'LOCKED' ? 'Locked' : 'Start'}
                    <ArrowRight size={14} className={module.status === 'LOCKED' ? 'hidden' : ''} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Insights */}
      <div className="grid grid-cols-12 gap-8 mt-4">
        {/* Weekly Grammar Insight */}
        <div className="col-span-7 glass-card p-12 space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-center text-accent">
              <BookMarked size={22} />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Weekly Grammar Insight</h2>
              <p className="text-secondary text-base leading-relaxed max-w-[85%] font-medium">
                The particle <span className="text-white italic">wa</span> (は) marks the topic, while <span className="text-white italic">ga</span> (が) marks the subject. Mastering this subtle distinction is the first step to natural sounding Japanese.
              </p>
            </div>
          </div>
          <button className="text-[10px] font-black text-white hover:text-accent flex items-center gap-3 uppercase tracking-[0.3em] transition-colors mt-8">
            Read The Journal <ExternalLink size={14} />
          </button>
        </div>

        {/* Practice Mode */}
        <div className="col-span-5 glass-card overflow-hidden relative group min-h-[400px]">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[4s] group-hover:scale-110" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542013976693-8b9210173062?auto=format&fit=crop&q=80&w=1200')" }}
          />
          <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-12 gap-6 z-10">
            <div className="space-y-3">
              <h2 className="text-4xl font-serif font-bold text-white tracking-tight">Practice Mode</h2>
              <p className="text-white/60 text-sm font-medium leading-relaxed max-w-[280px]">
                Immerse yourself in context-based grammar drills designed for retention.
              </p>
            </div>
            <button className="px-8 py-3.5 bg-accent/30 hover:bg-accent/40 border border-accent/20 backdrop-blur-md rounded-md text-xs font-black text-white hover:text-white uppercase tracking-[0.3em] mt-4 transition-all">
              Enter Sanctuary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
