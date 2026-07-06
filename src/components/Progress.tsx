import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Target, 
  Zap, 
  History, 
  TrendingUp, 
  ChevronRight,
  Clock,
  Award,
  Search,
  Filter,
  Flame,
  PenTool,
  BookOpen,
  Loader2
} from "lucide-react";
import { GlassCard } from './ui/GlassCard';
import { useAuth } from '@/hooks/useAuth';
import { useQuizHistory } from '@/hooks/data/useQuizHistory';

export function Progress() {
  const { user, profile } = useAuth();
  const { data: history, isLoading } = useQuizHistory(user?.id);
  const [showIntensity, setShowIntensity] = React.useState(false);

  // Calculate dynamic weekly accuracies for the last 8 weeks
  const rawWeeks = Array.from({ length: 8 }, (_, i) => {
    const weekAgo = 7 - i;
    const now = new Date();
    const start = new Date(now.getTime() - (weekAgo * 7 * 24 * 60 * 60 * 1000));
    const end = new Date(now.getTime() - ((weekAgo - 1) * 7 * 24 * 60 * 60 * 1000));
    const weekAttempts = (history as any[])?.filter((h: any) => {
      const d = new Date(h.created_at);
      return d >= start && d < end;
    }) || [];
    if (weekAttempts.length === 0) return 0;
    return Math.round(weekAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / weekAttempts.length);
  });
  const chartData = history && history.length > 0 ? rawWeeks : [40, 60, 55, 80, 95, 70, 85, 92];

  if (!user || !profile) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" /></div>;

  // Calculate activity for last 30 days
  const today = new Date();
  const last30DaysArr = Array.from({ length: 35 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (34 - i));
    const dayStr = date.toISOString().split('T')[0];
    const hasActivity = (history as any[])?.some((h: any) => new Date(h.created_at).toISOString().split('T')[0] === dayStr);
    return { date, active: hasActivity };
  });

  const averageAccuracy = (history as any[]) && (history as any[]).length > 0 
    ? Math.round((history as any[]).reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / (history as any[]).length)
    : 0;

  const totalTimeSec = (history as any[])?.reduce((acc: number, curr: any) => acc + (curr.duration_sec || 0), 0) || 0;
  const timeStudiedHours = (totalTimeSec / 3600).toFixed(1);

  return (
    <div className="flex flex-col gap-14 animate-fade-in w-full pb-20 selection:bg-white/20 text-white font-sans uppercase text-left">
      {/* Top Header */}
      <header className="flex flex-col gap-12">
        <div className="flex items-center justify-between">
           <div className="space-y-4 flex flex-col items-start">
             <h1 className="text-6xl font-display font-bold text-white tracking-tight leading-tight">Scholar Analytics</h1>
             <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Historical Data • Performance Deep-Dive</p>
           </div>
           
           <div className="relative font-sans">
              <div 
                onClick={() => setShowIntensity(!showIntensity)}
                className={`px-8 py-4 border rounded-xl flex items-center gap-4 group cursor-pointer transition-all shadow-sm ${showIntensity ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
              >
                 <Calendar size={18} className={showIntensity ? 'text-black' : 'text-white/40 group-hover:text-white'} />
                 <span className="text-xs font-bold tracking-wide">Last 30 Days</span>
              </div>

              {/* Study Intensity Dropdown */}
              <AnimatePresence>
                {showIntensity && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-6 z-50 min-w-[320px]"
                  >
                    <GlassCard className="p-10 space-y-8 bg-black/60 backdrop-blur-3xl border-white/10 shadow-2xl ring-1 ring-white/10">
                       <div className="space-y-4 flex flex-col items-start">
                         <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">Study Intensity</h3>
                         <div className="grid grid-cols-7 gap-2 w-full">
                            {last30DaysArr.map((day, i) => (
                              <div 
                                key={i} 
                                className={`aspect-square rounded-sm transition-all shadow-sm ${day.active ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'bg-white/10 border border-white/5'}`} 
                              />
                            ))}
                         </div>
                         <div className="flex items-center justify-between text-[8px] font-black text-white/20 uppercase tracking-widest mt-2 px-1 w-full">
                            <span>Sun</span>
                            <span>Sat</span>
                         </div>
                       </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        {/* Top Level Metrics */}
        <div className="grid grid-cols-4 gap-8 font-sans">
           {[
             { label: 'Avg. Accuracy', val: `${averageAccuracy}%`, icon: Target, trend: '+2.1%', color: '#FFFFFF' },
             { label: 'Time Studied', val: `${timeStudiedHours}h`, icon: Clock, trend: '+5.4h', color: '#B4C6FC' },
             { label: 'XP Earned', val: (profile.xp || 0).toLocaleString(), icon: Zap, trend: `+${(profile.xp || 0) % 100}`, color: '#FFD700' },
             { label: 'Days Active', val: profile.streak || 0, icon: Flame, trend: 'Streak', color: '#FF4500' },
           ].map((metric) => (
             <GlassCard key={metric.label} className="p-8 space-y-4 hover:bg-white/10 border-white/10 transition-all shadow-lg flex flex-col items-start">
                <div className="flex items-center justify-between w-full">
                   <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 shadow-sm">
                      <metric.icon size={18} />
                   </div>
                   <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{metric.trend}</span>
                </div>
                <div className="space-y-1 flex flex-col items-start">
                   <p className="text-3xl font-display font-bold text-white tracking-tight">{metric.val}</p>
                   <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{metric.label}</p>
                </div>
             </GlassCard>
           ))}
        </div>
      </header>

      <div className="grid grid-cols-12 gap-16 font-sans">
         {/* Left Side: Historical Charts */}
         <div className="col-span-8 space-y-16">
            
            {/* Accuracy Over Time Chart */}
            <section className="space-y-8 flex flex-col items-start">
               <div className="flex items-end justify-between w-full">
                  <div className="space-y-2 flex flex-col items-start">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Performance Trend</p>
                    <h2 className="text-4xl font-display font-bold text-white tracking-tight leading-tight">Accuracy Over Time</h2>
                  </div>
                  <div className="flex gap-4">
                     {['Weekly', 'Monthly'].map((item) => (
                       <button key={item} className={`px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest transition-all ${item === 'Weekly' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}>{item}</button>
                     ))}
                  </div>
               </div>

               <GlassCard className="p-12 h-[340px] flex flex-col justify-between bg-white/5 border-white/10 shadow-xl w-full">
                  <div className="flex-1 flex items-end justify-between gap-4">
                     {chartData.map((h, i) => (
                       <div key={i} className="flex-1 flex flex-col items-center gap-4 h-full justify-end">
                          <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} className={`w-full rounded-t-md relative group ${i === 7 ? 'bg-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-white/5 border border-white/5 transition-all hover:bg-white/10'}`}>
                             <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/40 border border-white/5 px-2 py-1 rounded text-[9px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                {h}%
                             </div>
                          </motion.div>
                          <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest select-none">W{i+1}</span>
                       </div>
                     ))}
                  </div>
                  <div className="flex justify-between pt-8 border-t border-white/5 mt-8 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
                     <span>OCTOBER 01</span>
                     <span>OCTOBER 15</span>
                     <span>TODAY</span>
                  </div>
               </GlassCard>
            </section>

            {/* Session History Table */}
            <section className="space-y-8 flex flex-col items-start w-full">
               <div className="flex items-center justify-between w-full">
                  <div className="space-y-2 flex flex-col items-start">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Activity Log</p>
                    <h2 className="text-4xl font-display font-bold text-white tracking-tight leading-tight">Recent Sessions</h2>
                  </div>
                  <div className="flex items-center gap-6">
                     <Search size={16} className="text-white/20" />
                     <Filter size={16} className="text-white/20" />
                  </div>
               </div>

               {isLoading ? (
                  <GlassCard className="p-20 flex flex-col items-center justify-center gap-6 shadow-xl w-full">
                    <Loader2 className="w-10 h-10 text-white/10 animate-spin" />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] animate-pulse">Syncing History</p>
                  </GlassCard>
               ) : history && (history as any[]).length > 0 ? (
                  <div className="glass-card w-full overflow-hidden divide-y divide-white/10 border-white/10 bg-white/5 shadow-2l flex flex-col uppercase">
                   {(history as any[]).map((session: any) => (
                      <div key={session.id} className="p-8 flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer">
                         <div className="flex items-center gap-10 w-[40%] text-left font-sans">
                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/40 group-hover:text-white transition-colors shadow-sm">
                               <TrendingUp size={22} />
                            </div>
                            <div className="space-y-1.5 border-l border-white/10 pl-10 flex flex-col items-start font-sans">
                              <h3 className="text-xl font-display font-bold text-white tracking-wide uppercase">{session.lesson_catalog?.title || session.type?.toUpperCase()}</h3>
                              <p className="text-[10px] text-white/20 font-black tracking-[0.2em] uppercase">{new Date(session.created_at).toLocaleDateString()}</p>
                            </div>
                         </div>

                         <div className="flex items-center gap-12 font-sans">
                            <div className="w-32 space-y-1 text-center">
                               <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Duration</p>
                               <p className="text-sm font-bold text-white/80">{Math.floor((session.duration_sec || 0) / 60)}M {(session.duration_sec || 0) % 60}S</p>
                            </div>
                            <div className="w-32 space-y-1 text-center font-display">
                               <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] font-sans">Accuracy</p>
                               <p className="text-lg font-bold text-white tracking-tighter uppercase">{session.score}%</p>
                            </div>
                            <div className="hidden lg:flex w-32 justify-center">
                               <span className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[8px] font-black text-white/40 tracking-widest uppercase shadow-sm">
                                  {session.score >= 90 ? 'MASTERED' : 'COMPLETED'}
                               </span>
                            </div>
                            <ChevronRight size={18} className="text-white/40 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                         </div>
                      </div>
                   ))}
                  </div>
               ) : (
                  <GlassCard className="p-20 text-center text-white/10 italic text-[11px] font-black uppercase tracking-[0.4em] shadow-xl w-full">
                    No Session Logs Recorded
                  </GlassCard>
               )}
            </section>
         </div>

         {/* Right Side: Deep Stats Context */}
         <div className="col-span-4 space-y-10 h-fit lg:sticky lg:top-12">
            <GlassCard className="p-10 space-y-10 bg-white/5 border-white/10 shadow-2xl flex flex-col items-start font-sans">
                <div className="space-y-4 flex flex-col items-start font-sans">
                  <h2 className="text-xl font-display font-bold text-white tracking-wide uppercase">Mastery Achievements</h2>
                  <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Milestones & Recognition</p>
                </div>

                <div className="space-y-8 w-full">
                   {[
                     { title: 'The Polyglot', desc: 'Maintained a 14-day streak with 95%+ accuracy.', icon: Flame, mastered: (profile.streak || 0) >= 14 },
                     { title: 'Scholarly Calligraphist', desc: 'Mastered 200 Kanji in the writing hub.', icon: PenTool, mastered: false },
                     { title: 'Narrative Expert', desc: 'Completed 50 short stories in Reading practice.', icon: BookOpen, mastered: false },
                   ].map((ach) => (
                     <div key={ach.title} className={`flex items-start gap-6 group transition-all text-left font-sans ${ach.mastered ? 'opacity-100' : 'opacity-40'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all shadow-lg ${ach.mastered ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/20'}`}>
                           <ach.icon size={22} />
                        </div>
                        <div className="space-y-1.5 flex-1 pt-1 flex flex-col items-start">
                           <h4 className="text-sm font-bold text-white tracking-wide group-hover:text-white transition-colors uppercase">{ach.title}</h4>
                           <p className="text-[11px] text-white/40 leading-relaxed font-medium italic normal-case">{ach.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
                
                <div className="flex items-center gap-3 pt-6 border-t border-white/10 w-full">
                   <Award size={16} className="text-white/60" />
                   <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">Global Rank: #892 (Guardian)</p>
                </div>
            </GlassCard>
         </div>
      </div>
    </div>
  );
}
