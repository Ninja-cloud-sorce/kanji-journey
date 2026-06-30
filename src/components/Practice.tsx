import React from 'react';
import { 
  Target, 
  AlertCircle, 
  Timer, 
  Flame,
  ChevronRight,
  FileBarChart
} from "lucide-react";
import { GlassCard } from './ui/GlassCard';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { getPracticeSessionCards } from '@/lib/practiceCatalog';
import { useNavigate } from 'react-router-dom';

export function Practice() {
  const { startSession } = useStore();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const sessions = getPracticeSessionCards();
  const recommendedSession = [...sessions].sort((a, b) => b.itemCount - a.itemCount)[0];

  if (!user || !profile) return null;

  return (
    <div className="flex flex-col gap-10 animate-fade-in w-full pb-20 mt-4 text-left font-sans text-white">
      {/* Top Navigation */}
      <header className="flex items-center justify-between pt-2 px-1 text-white">
        <nav className="flex items-center gap-10">
          {['Practice'].map((item) => (
            <button 
              key={item} 
              className="text-[11px] font-black tracking-[0.3em] transition-colors text-white border-b border-white pb-1 uppercase"
            >
              {item}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-12 pt-6">
        {/* Left Area: Active Sessions */}
        <div className="col-span-8 space-y-12">
          
          <section className="space-y-4 flex flex-col items-start font-sans">
            <h1 className="text-6xl font-display font-bold text-white tracking-tight leading-tight uppercase">Active Sessions</h1>
            <p className="text-white/60 text-base font-medium max-w-2xl leading-relaxed italic font-display uppercase tracking-wider">
              Master Japanese through daily ritual. Select a discipline to begin your focused practice session.
            </p>
          </section>

          <div className="space-y-4">
            {sessions.map((session) => (
              <GlassCard 
                key={session.id}
                onClick={() => navigate(`/session/${session.type}`)}
                className="p-8 flex items-center justify-between group"
              >
                <div className="flex items-center gap-8">
                  <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white group-hover:scale-110 transition-all border border-white/5 shadow-2xl">
                    <session.icon size={24} />
                  </div>
                  <div className="space-y-1 flex flex-col items-start font-sans">
                    <h3 className="text-2xl font-display font-medium text-white leading-none tracking-wide group-hover:text-white transition-colors uppercase">{session.title}</h3>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] font-sans">{session.subtitle}</p>
                    <p className="text-sm text-white/50 max-w-xl normal-case">{session.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right space-y-1 mr-2">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{session.collectionLabel}</p>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{session.itemCount} items</p>
                  </div>
                  <span className="text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest translate-x-2 group-hover:translate-x-0 font-sans">START SESSION</span>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-white transition-all mr-2" />
                </div>
              </GlassCard>
            ))}

            {/* JLPT Exam Simulator Card */}
            <GlassCard 
              onClick={() => navigate('/practice/exam')}
              className="p-8 flex items-center justify-between group border border-primary/20 bg-primary/5"
            >
              <div className="flex items-center gap-8">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all border border-primary/20 shadow-2xl">
                  <FileBarChart size={24} />
                </div>
                <div className="space-y-1 flex flex-col items-start font-sans">
                  <h3 className="text-2xl font-display font-medium text-white leading-none tracking-wide group-hover:text-primary transition-colors uppercase">JLPT Exam Simulator</h3>
                  <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.2em] font-sans">Timed Mock Test</p>
                  <p className="text-sm text-white/50 max-w-xl normal-case">Experience a full-length, timed JLPT simulation covering Kanji, Vocab, Grammar, and Reading.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest translate-x-2 group-hover:translate-x-0 font-sans">ENTER SIMULATOR</span>
                <ChevronRight size={18} className="text-white/20 group-hover:text-white transition-all mr-2" />
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 gap-8 pt-4 w-full">
             {recommendedSession && (
               <GlassCard 
                  onClick={() => navigate(`/session/${recommendedSession.type}`)}
                  className="p-12 overflow-hidden relative group min-h-[320px] w-full"
                >
                  <div className="absolute right-0 bottom-0 opacity-[0.03] text-[20rem] font-display font-bold text-white translate-x-20 translate-y-20 rotate-12 select-none pointer-events-none uppercase">
                    {recommendedSession.title.split(' ')[0]}
                  </div>
                  <div className="space-y-6 relative z-10 flex flex-col items-start text-left font-sans">
                     <div className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] font-sans">Recommended for you</span>
                     </div>
                     <h2 className="text-4xl font-display font-bold text-white tracking-tight max-w-[280px] uppercase">{recommendedSession.title}</h2>
                     <p className="text-white/60 text-base leading-relaxed max-w-[480px] font-medium italic font-display tracking-wider normal-case">
                       {recommendedSession.description}
                     </p>
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                       {recommendedSession.collectionLabel} • {recommendedSession.itemCount} items ready
                     </p>
                  </div>
               </GlassCard>
             )}
          </div>
        </div>

        {/* Right Area: Practice Progress */}
        <div className="col-span-4 self-start space-y-8 flex flex-col items-start text-left w-full">
           <GlassCard className="p-12 space-y-12 w-full flex flex-col items-start relative overflow-hidden">
              <div className="space-y-3 flex flex-col items-start text-left font-sans">
                <h2 className="text-2xl font-display font-bold text-white tracking-wide uppercase">Session Progress</h2>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest font-sans">Learning metrics</p>
              </div>

              <div className="space-y-12 w-full font-sans">
                {[
                  { icon: FileBarChart, label: 'Reading Progress', active: true },
                   { icon: Target, label: 'Vocabulary Recall', active: false },
                   { icon: AlertCircle, label: 'Weak Points', active: false },
                   { icon: Timer, label: 'Active Time', active: false },
                ].map((stat, i) => (
                  <div key={i} className={`flex items-center gap-6 group cursor-pointer ${!stat.active ? 'opacity-40 hover:opacity-100 transition-opacity' : ''}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${stat.active ? 'bg-white/10 text-white border-white/20 shadow-xl' : 'bg-white/5 text-white/20 border-white/5'}`}>
                      <stat.icon size={22} />
                    </div>
                    <h4 className="text-[11px] font-black text-white/40 tracking-[0.2em] group-hover:text-white transition-colors uppercase font-sans">{stat.label}</h4>
                  </div>
                ))}
              </div>

              <div className="h-px w-full bg-white/10" />

              <div className="w-full flex items-center justify-between relative z-10 pt-4 font-sans">
                 <div className="flex items-center gap-2">
                    <Flame size={18} className="text-white/60 fill-white/10" />
                    <span className="text-base font-black text-white uppercase tracking-widest">{profile.streak || 0} DAYS</span>
                 </div>
                 <div className="text-right">
                    <p className="text-3xl font-display font-bold text-white tracking-tight uppercase">{profile.xp || 0} XP</p>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-auto">DAILY TOTAL</p>
                 </div>
              </div>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}
