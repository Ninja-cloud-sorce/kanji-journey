import React from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Lock, 
  ChevronRight, 
  ArrowRight,
  BookOpen,
  Sparkles
} from "lucide-react";
import { GlassCard } from './ui/GlassCard';
import { ProgressBar } from './ui/ProgressBar';
import { cn } from '@/lib/utils';

// --- Data ---
const MODULES = [
  { id: 'particles', title: 'Particles', jpTitle: '[助詞]', progress: 65, status: 'In Progress', locked: false },
  { id: 'verbs',     title: 'Verb Conjugation', jpTitle: '[動詞]', progress: 0, status: 'Not Started', locked: false },
  { id: 'honorifics',title: 'Honorifics (Keigo)', jpTitle: '[敬語]', progress: 0, status: 'Locked', locked: true },
  { id: 'structures',title: 'Sentence Structures', jpTitle: '[文型]', progress: 0, status: 'Not Started', locked: false },
];

interface CurriculumViewProps {
  level: string;
  onNavigate: (page: string) => void;
  onBack?: () => void;
}

export function CurriculumView({ level, onNavigate, onBack }: CurriculumViewProps) {
  return (
    <div className="flex flex-col gap-12 animate-fade-up max-w-5xl">
      {/* Header Section */}
      <section className="space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B4C6FC]/60">
            Foundation Tier
          </span>
          <h1 className="text-font-3xl font-serif font-bold text-white leading-tight">
            Grammar <span className="italic text-white/40 font-medium">Structure</span>
          </h1>
        </div>
        <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
          Master the architectural pillars of the Japanese language. From basic particles to complex honorific expressions, build your sanctuary of understanding piece by piece.
        </p>
      </section>

      {/* Module List Section */}
      <section className="space-y-4">
        <div className="flex flex-col gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.04]">
          {MODULES.map((module) => (
            <div 
              key={module.id}
              className={cn(
                "group bg-[#0D0D0D] p-6 flex items-center gap-10 transition-all duration-300",
                module.locked ? "opacity-30 cursor-not-allowed" : "hover:bg-white/[0.02] cursor-pointer"
              )}
            >
              {/* Module JP Label */}
              <div className="w-16 font-jp text-lg text-white/40 group-hover:text-white/60 transition-colors">
                {module.jpTitle}
              </div>

              {/* Module Info */}
              <div className="flex-1 flex items-center gap-12">
                <div className="w-48">
                  <h3 className="font-semibold text-white/90 group-hover:text-white transition-colors">
                    {module.title}
                  </h3>
                  {module.status === 'In Progress' && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                      In Progress
                    </span>
                  )}
                </div>

                {/* Progress Tracking (Conditional) */}
                {!module.locked && (
                  <div className="flex-1 flex items-center gap-6">
                    <div className="flex-1 max-w-xs">
                      <ProgressBar progress={module.progress} color="#5E6AD2" />
                    </div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest whitespace-nowrap">
                      {module.progress}% Mastery
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="w-24 flex justify-end">
                {module.locked ? (
                  <Lock size={16} className="text-text-muted" />
                ) : (
                  <button className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-white transition-colors">
                    <span>{module.status === 'Not Started' ? 'Start' : 'Continue'}</span>
                    <Play size={10} fill="currentColor" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <GlassCard className="p-8 space-y-4 bg-gradient-to-br from-white/[0.02] to-transparent">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-[#B4C6FC]">
            <BookOpen size={20} />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-serif font-semibold text-white/90">
              Weekly Grammar Insight
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              The particle <span className="text-white/80 font-jp">wa</span> (は) marks the topic, while <span className="text-white/80 font-jp">ga</span> (が) marks the subject. Mastering this subtle distinction is the first step to natural sounding Japanese.
            </p>
          </div>
          <button className="pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#B4C6FC] hover:text-white transition-colors">
            Read the Journal <ArrowRight size={14} />
          </button>
        </GlassCard>

        <div className="relative rounded-2xl overflow-hidden group border border-white/[0.04]">
          <img 
            src="https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=800" 
            alt="Practice Mode"
            className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-[#060606]/40 p-10 flex flex-col justify-end gap-6 items-start">
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
                Practice Mode
              </h2>
              <p className="text-white/60 text-sm max-w-xs leading-relaxed">
                Immerse yourself in context-based grammar drills designed for retention.
              </p>
            </div>
            <button className="px-8 py-3 bg-[#B4C6FC] text-[#060606] rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-blue-400/20">
              Enter Sanctuary
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
