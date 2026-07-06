import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Flame, 
  RefreshCw,
  Timer,
  BookOpen,
  Loader2
} from "lucide-react";
import { cn } from '@/lib/utils';
import { GlassCard } from './ui/GlassCard';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { useCollections } from '@/hooks/data/useCollections';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: collections, isFetching } = useCollections(user?.id);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showResults, setShowResults] = React.useState(false);

  // Universal Destination Index — must be before any early return (Rules of Hooks)
  const searchDestinations = useMemo(() => [
    { name: 'Profile / Status', query: 'profile', action: () => navigate('/profile'), icon: '👤' },
    { name: 'Progress / Analytics', query: 'progress analytics accuracy stats', action: () => navigate('/progress'), icon: '📊' },
    { name: 'Library / Curriculum', query: 'library curriculum packs archive', action: () => navigate('/library'), icon: '📚' },
    { name: 'Flashcards', query: 'flashcards deck review', action: () => navigate('/session/quiz'), icon: '🎴' },
    { name: 'Settings / Account', query: 'settings account preferences', action: () => navigate('/settings'), icon: '⚙️' },
    { name: 'Writing Session', query: 'writing kanji hiragana katakana ritual', action: () => navigate('/session/writing'), icon: '🖊️' },
    { name: 'Vocabulary Quiz', query: 'vocab words quiz dictionary', action: () => navigate('/session/vocab'), icon: '🗣️' },
    { name: 'Grammar Ritual', query: 'grammar particles verbs sentence', action: () => navigate('/session/grammar'), icon: '⛩️' },
    { name: 'Reading Practice', query: 'reading stories text narrative', action: () => navigate('/session/reading'), icon: '📖' },
    ...(collections?.map(c => ({
      name: c.title,
      query: `${c.title.toLowerCase()} ${c.subtitle?.toLowerCase() || ''} pack level`,
      action: () => navigate('/library/' + c.id),
      icon: c.icon || '学'
    })) || [])
  ], [collections, navigate]);

  const filteredResults = useMemo(() =>
    searchQuery.length > 0
      ? searchDestinations.filter(d =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.query.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [],
  [searchQuery, searchDestinations]);

  const handleSearchCommit = (dest: any) => {
    dest.action();
    setSearchQuery('');
    setShowResults(false);
  };

  const activeCollection = collections?.find(c => (c.progressPercentage || 0) < 100) || collections?.[0];

  if (!user || !profile) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-12 animate-fade-in w-full max-w-[1880px] mx-auto pb-16 font-sans">
      {/* Header / Top Nav area within main content */}
      <header className="flex items-start justify-between pb-10 border-b border-white/10">
        <div className="flex items-center gap-4 text-white pt-1">
          <h1 className="text-5xl xl:text-6xl font-display font-bold text-white tracking-wide uppercase leading-none">
            The Ink-Stone <span className="mx-3 text-white/20 font-sans font-light">/</span> <span className="text-white/40 text-base font-display tracking-[0.25em] font-black uppercase">{profile.display_name?.toUpperCase() || 'SCHOLAR'}'s Dashboard</span>
          </h1>
        </div>
        
        <div className="flex flex-col items-end gap-6 font-sans min-w-[480px]">
          {/* Streak Indicator */}
          <div className="flex items-center gap-3 px-5 min-h-[48px] bg-white/5 border border-white/10 rounded-xl shadow-sm">
            <Flame className="text-white fill-white/20" size={16} />
            <span className="text-xs font-black text-white uppercase tracking-widest">{profile.streak || 0}D STREAK</span>
          </div>

          {/* Universal Search Portal */}
          <div className="relative group w-[520px] max-w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors" size={15} />
            <input 
              type="text" 
              placeholder="Seek Anywhere..."
              value={searchQuery}
              onFocus={() => setShowResults(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredResults.length > 0) {
                  handleSearchCommit(filteredResults[0]);
                }
              }}
              className="bg-white/5 border border-white/10 rounded-xl h-12 px-12 text-sm text-white placeholder:text-white/20 w-full focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all font-sans uppercase tracking-widest font-black"
            />
            
            {/* Popover Results */}
            {showResults && filteredResults.length > 0 && (
              <div className="absolute right-0 top-full mt-4 w-full z-50">
                <GlassCard className="p-4 overflow-hidden border-white/20 bg-black/60 shadow-2xl backdrop-blur-3xl divide-y divide-white/5">
                  {filteredResults.map((dest, i) => (
                    <div 
                      key={dest.name} 
                      onClick={() => handleSearchCommit(dest)}
                      className={cn(
                        "p-4 flex items-center justify-between cursor-pointer group/item transition-all rounded-lg",
                        i === 0 ? "bg-white/10" : "hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-sm">{dest.icon}</span>
                        <span className="text-xs font-black text-white/60 group-hover/item:text-white uppercase tracking-widest">{dest.name}</span>
                      </div>
                      {i === 0 && <span className="text-[8px] font-black text-white/20 uppercase">ENTER</span>}
                    </div>
                  ))}
                </GlassCard>
              </div>
            )}
            {showResults && searchQuery.length > 0 && filteredResults.length === 0 && (
              <div className="absolute right-0 top-full mt-4 w-full z-50">
                <GlassCard className="p-8 text-center text-[9px] font-black text-white/20 uppercase tracking-[0.2em] border-white/10 bg-black/60 shadow-xl backdrop-blur-2xl">
                  No ritual paths found
                </GlassCard>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-10 pt-2 items-stretch">
        {/* Left Column */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
          
          {/* Active Curriculum */}
          <section className="space-y-6 flex flex-col items-start w-full">
            <h2 className="text-xl font-black text-white/50 uppercase tracking-[0.2em]">
              Active Curriculum
            </h2>
            {activeCollection ? (
              <GlassCard className="p-14 xl:p-16 relative overflow-hidden group w-full min-h-[420px] xl:min-h-[460px] flex flex-col items-start justify-between">
                <div className="flex justify-between items-start relative z-10 w-full mb-12 gap-10">
                  <div className="space-y-4 flex flex-col items-start">
                    <h3 className="text-5xl xl:text-7xl font-display font-bold text-white tracking-tight leading-[0.95] uppercase max-w-[18ch]">
                      {activeCollection.title}
                    </h3>
                    <p className="text-white/70 text-xl leading-relaxed font-medium italic font-display opacity-80 uppercase tracking-wider max-w-[40ch]">
                      {activeCollection.subtitle}
                    </p>
                  </div>
                  
                  <div className="text-right space-y-4 w-[320px] pt-2">
                    <div className="flex justify-between text-sm font-black tracking-widest text-white/40 uppercase">
                      <span className="flex items-center gap-2">
                        Overall Mastery
                        {isFetching && <Loader2 size={10} className="animate-spin opacity-40" />}
                      </span>
                      <span>{activeCollection.progressPercentage || 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${activeCollection.progressPercentage || 0}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-white/10 flex items-center gap-6 xl:gap-10 relative z-10 w-full flex-wrap">
                  <button 
                    onClick={() => navigate('/library/' + activeCollection.id)}
                    className="bg-white text-black hover:bg-white/90 px-12 min-h-[52px] rounded-full transition-all font-black text-sm uppercase tracking-[0.18em] shadow-xl active:scale-95"
                  >
                    Continue Study
                  </button>
                  <button 
                    onClick={() => navigate('/library')}
                    className="text-xs font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors font-sans btn-secondary-pink !px-8 !py-3 min-h-[48px]"
                  >
                    CURRICULUM INDEX
                  </button>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="p-12 w-full min-h-[420px] flex flex-col items-center justify-center gap-6 opacity-40">
                 <BookOpen size={32} />
                 <p className="text-sm font-black uppercase tracking-[0.3em]">No Active Curriculum Found</p>
                 <button onClick={() => navigate('/library')} className="btn-pink">Browse Library</button>
              </GlassCard>
            )}
          </section>

        </div>

        {/* Right Column */}
        <div className="col-span-12 xl:col-span-4 space-y-8 flex flex-col items-start text-left">
          
          {/* Quick Tools */}
          <section className="space-y-6 w-full flex flex-col items-start">
            <h2 className="text-xl font-black text-white/50 uppercase tracking-[0.2em]">
              Quick Rituals
            </h2>
            <div className="space-y-5 w-full">
              <GlassCard 
                onClick={() => navigate('/session/quiz')}
                className="p-8 min-h-[180px] flex items-center gap-6 w-full"
              >
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-white transition-colors border border-white/5">
                  <RefreshCw size={20} />
                </div>
                <div className="space-y-1.5 flex flex-col items-start font-sans">
                  <h4 className="text-xl font-display font-bold text-white uppercase tracking-wider">Sync Weak Points</h4>
                  <p className="text-sm text-white/30 font-black tracking-widest uppercase">Targeted ritual</p>
                </div>
              </GlassCard>
              <GlassCard 
                onClick={() => navigate('/session/reading')}
                className="p-8 min-h-[180px] flex items-center gap-6 w-full"
              >
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-white transition-colors border border-white/5">
                  <Timer size={20} />
                </div>
                <div className="space-y-1.5 flex flex-col items-start font-sans">
                  <h4 className="text-xl font-display font-bold text-white uppercase tracking-wider">Timed Sprint</h4>
                  <p className="text-sm text-white/30 font-black tracking-widest uppercase">Quick 5m Session</p>
                </div>
              </GlassCard>
            </div>
          </section>

          {/* Scholar's Note */}
          <GlassCard className="p-10 min-h-[300px] space-y-8 flex flex-col items-start w-full">
            <h2 className="text-xl font-black text-white/50 uppercase tracking-[0.2em]">
              Scholar's Note
            </h2>
            <div className="space-y-8 text-left pt-2">
              <p className="text-lg font-display italic text-white/60 leading-relaxed uppercase tracking-wider">
                "If you wish to know the road ahead, ask those who are coming back."
              </p>
              <div className="h-px w-12 bg-white/10" />
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-sm font-black text-white/20 uppercase tracking-[0.2em]">Focus for today</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
