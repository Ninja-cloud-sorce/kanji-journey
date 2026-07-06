import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, LogOut } from "lucide-react";
import { AvatarDisplay } from './Settings';
import { GlassCard } from './ui/GlassCard';
import { useAuth } from '@/hooks/useAuth';
import { useQuizHistory } from '@/hooks/data/useQuizHistory';
import { useWeakTopics } from '@/hooks/data/useWeakTopics';
import { useFlashcards } from '@/hooks/data/useFlashcards';

export function Profile() {
  const { user, profile, signOut } = useAuth();
  const { data: history } = useQuizHistory(user?.id);
  const { data: weakTopics } = useWeakTopics(user?.id);
  const { data: flashcards } = useFlashcards(user?.id);
  
  if (!user || !profile) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" /></div>;

  const averageAccuracy = history && history.length > 0
    ? Math.round(history.reduce((acc, curr) => acc + (curr.score || 0), 0) / history.length)
    : 0;

  const totalReviews = flashcards?.reduce((acc, curr) => acc + (curr.reviews_total || 0), 0) || 0;
  const correctReviews = flashcards?.reduce((acc, curr) => acc + (curr.reviews_correct || 0), 0) || 0;
  const retentionValue = totalReviews > 0 ? (correctReviews / totalReviews) : 0.85; // Default to 85% for better curve if no data
  const retentionRate = (retentionValue * 100).toFixed(1);

  // Generate a dynamic SVG path for the Retention Curve based on user performance
  // y = 100 * e^(-kt). We'll simulate 4 points: 0, 100, 400, 1000 pixels across
  const baseK = 0.0015;
  const k = baseK * (1.5 - (parseFloat(retentionRate) / 100)); // Higher k = faster drop-off
  const points = [
    { x: 0, y: 50 },
    { x: 250, y: 50 + (150 * (1 - Math.exp(-k * 250))) },
    { x: 500, y: 50 + (250 * (1 - Math.exp(-k * 500))) },
    { x: 1000, y: 50 + (280 * (1 - Math.exp(-k * 1000))) },
  ];
  
  const retentionPath = `M${points[0].x},${points[0].y} C${points[1].x},${points[1].y} ${points[2].x},${points[2].y} ${points[3].x},${points[3].y}`;

  // Map weak topics to the conceptual mastery grid
  const masteryItems = (weakTopics || []).slice(0, 4).map(wt => ({
    title: wt.topic,
    sub: wt.skill_area,
    // We don't have total per topic, so we use a heuristic or just show mistake count
    accuracy: wt.mistakes_count > 10 ? 'Needs Focus' : wt.mistakes_count > 5 ? 'Progressing' : 'Developing',
    progress: Math.max(10, 100 - (wt.mistakes_count * 10))
  }));

  // Fallback if no mastery data
  const finalMasteryItems = masteryItems.length > 0 ? masteryItems : [
    { title: 'Hiragana', sub: 'Foundations', accuracy: '100%', progress: 100 },
    { title: 'Basic Particles', sub: 'Grammar', accuracy: '90%', progress: 90 }
  ];

  return (
    <div className="flex flex-col gap-12 animate-fade-in w-full pb-20 mt-4 text-left font-sans text-white uppercase">
      <div className="grid grid-cols-12 gap-16">
        
        {/* Left Column: Identity & Achievements */}
        <div className="col-span-4 space-y-12 flex flex-col items-start text-left">
          {/* Avatar & Branding */}
          <div className="space-y-8 flex flex-col items-start">
            <div className="relative w-56 h-56">
              <div className="absolute inset-0 rounded-[32px] bg-white/5 border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
                <AvatarDisplay avatarUrl={profile.avatar_url} size="lg" />
              </div>
              <div className="absolute -bottom-4 -right-4 px-6 py-2 bg-white rounded-xl text-[10px] font-black tracking-widest shadow-xl text-black border border-white uppercase">
                {(profile.xp || 0) >= 1000 ? 'Master' : 'Student'}
              </div>
            </div>

            <div className="space-y-4 flex flex-col items-start font-sans">
               <h1 className="text-6xl font-display font-bold text-white tracking-tight leading-none uppercase">{profile.display_name?.toUpperCase()}</h1>
               <div className="w-10 h-1 bg-white/20 rounded-full" />
               <p className="text-white/40 text-[10px] leading-relaxed font-black max-w-[320px] uppercase tracking-[0.3em] font-sans">
                 Practitioner ID: #{(profile?.id || '00000000').slice(0, 8).toUpperCase()}
               </p>
               <p className="text-white/60 text-lg leading-relaxed font-medium italic font-display opacity-80 uppercase tracking-wider">
                 {profile.bio || 'No bio set.'}
               </p>
            </div>

            <button
              onClick={() => signOut()}
              className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/30 active:scale-[0.98] transition-all text-red-400 text-[11px] font-black uppercase tracking-[0.3em] font-sans shadow-[0_4px_20px_-8px_rgba(239,68,68,0.3)]"
            >
              <LogOut size={16} strokeWidth={2.5} />
              Terminate Session
            </button>
          </div>
        </div>

        {/* Right Column: Analytics & Metrics */}
        <div className="col-span-8 space-y-16 flex flex-col items-start text-left">
          {/* Top Overview Cards */}
          <GlassCard className="p-12 grid grid-cols-3 divide-x divide-white/10 w-full shadow-2xl">
             <div className="px-8 space-y-3 flex flex-col items-start text-left">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Accuracy</p>
                <div className="flex items-baseline gap-4 font-sans">
                   <span className="text-5xl font-display font-bold text-white tracking-widest">{averageAccuracy}%</span>
                </div>
             </div>
             <div className="px-12 space-y-3 flex flex-col items-start text-left">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total XP</p>
                <span className="text-5xl font-display font-bold text-white tracking-widest">{(profile.xp || 0).toLocaleString()}</span>
             </div>
             <div className="px-12 space-y-5 flex flex-col items-start text-left">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Current Level</p>
                <div className="space-y-4 w-full">
                   <p className="text-[11px] font-black text-white/80 tracking-[0.2em] uppercase font-sans">
                     LEVEL {Math.floor((profile.xp || 0) / 1000) + 1}
                     <span className="text-white/40 text-[9px] ml-2 font-black">({(profile.xp || 0) % 1000}/1000 to next)</span>
                   </p>
                   <div className="h-1 bg-white/10 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-1000" style={{ width: `${((profile.xp || 0) % 1000) / 10}%` }} />
                   </div>
                </div>
             </div>
          </GlassCard>

          {/* Retention Curve */}
          <section className="space-y-8 flex flex-col items-start text-left w-full">
            <div className="flex items-end justify-between w-full">
              <div className="space-y-3 flex flex-col items-start">
                <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em]">System Metric</p>
                <h2 className="text-6xl font-display font-bold text-white tracking-tight uppercase">Retention Curve</h2>
              </div>
              <div className="text-right">
                <p className="text-6xl font-display font-bold text-white tracking-tighter">{retentionRate}%</p>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1 font-sans">Expected Recall</p>
              </div>
            </div>

            <GlassCard className="p-16 h-[380px] relative overflow-hidden flex flex-col justify-end w-full shadow-2xl">
               {/* Line Chart Representation */}
               <div className="absolute inset-0 pt-20 px-20">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none">
                     <motion.path 
                       initial={{ pathLength: 0, opacity: 0 }}
                       animate={{ pathLength: 1, opacity: 0.4 }}
                       transition={{ duration: 2, ease: "easeOut" }}
                       d={retentionPath} 
                       fill="none" 
                       stroke="#FFFFFF" 
                       strokeWidth="6"
                       strokeLinecap="round"
                       className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                     />
                     <circle cx={points[0].x} cy={points[0].y} r="8" fill="#FFFFFF" />
                     <circle cx={points[3].x} cy={points[3].y} r="8" fill="#FFFFFF" opacity="0.4" />
                  </svg>
               </div>
               
               {/* Chart Axis Labels */}
               <div className="flex justify-between items-center text-[10px] font-black text-white/40 uppercase tracking-[0.3em] relative z-10 w-full font-sans">
                  <span>Immediate</span>
                  <span>24 Hours</span>
                  <span>7 Days</span>
                  <span>30 Days</span>
               </div>
            </GlassCard>
          </section>

          {/* Conceptual Mastery Grid */}
          <section className="space-y-8 flex flex-col items-start text-left w-full">
            <div className="space-y-3 flex flex-col items-start">
              <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em]">Granular Analysis</p>
              <h2 className="text-6xl font-display font-bold text-white tracking-tight uppercase">Conceptual Mastery</h2>
            </div>

            <div className="grid grid-cols-2 gap-8 w-full font-sans">
                {finalMasteryItems.map((item) => (
                  <GlassCard key={item.title} className="p-10 flex flex-col justify-between h-[240px] group transition-all shadow-xl">
                     <div className="flex justify-between items-start w-full">
                        <div className="space-y-2 flex flex-col items-start">
                           <h4 className="text-3xl font-display font-bold text-white tracking-wide group-hover:text-white transition-colors uppercase">{item.title}</h4>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{item.sub}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-4xl font-display font-bold text-white tracking-tight uppercase">{item.accuracy}</p>
                           <p className="text-[9px] font-black text-white/40 uppercase tracking-tighter mt-1">Accuracy</p>
                        </div>
                     </div>

                     <div className="flex items-center justify-between gap-12 mt-4 w-full">
                        <div className="flex-1 h-8 opacity-20">
                           <svg className="w-full h-full" viewBox="0 0 200 40">
                              <path 
                                d="M0,20 L20,10 L40,25 L60,15 L80,30 L100,5 L120,20 L140,10 L160,30 L180,15 L200,20"
                                fill="none"
                                stroke="#FFFFFF"
                                strokeWidth="2"
                              />
                           </svg>
                        </div>
                        <button className="bg-white text-black hover:bg-white/90 !px-8 !py-3 rounded-full transition-all font-black text-[9px] uppercase tracking-[0.2em] shadow-xl">
                          Ritual
                        </button>
                     </div>
                  </GlassCard>
                ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
