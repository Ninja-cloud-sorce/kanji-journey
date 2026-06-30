import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ArrowRight, 
  CheckCircle2,
  Lock,
  Loader2
} from "lucide-react";
import { cn } from '@/lib/utils';
import { GlassCard } from './ui/GlassCard';
import { useCollections } from '@/hooks/data/useCollections';
import { useAuth } from '@/hooks/useAuth';

interface SyllabaryItem {
  id: string;
  char: string;
  romaji: string;
  hint: string;
}

// Complete Hiragana & Katakana Data Sets
const FULL_HIRAGANA: SyllabaryItem[] = [
  { id: 'h-a', char: 'あ', romaji: 'a', hint: 'Looks like an Apple' },
  { id: 'h-i', char: 'い', romaji: 'i', hint: 'Two lines like "i"' },
  { id: 'h-u', char: 'う', romaji: 'u', hint: 'Side-view of someone saying "U"' },
  { id: 'h-e', char: 'え', romaji: 'e', hint: 'Looks like an Expert' },
  { id: 'h-o', char: 'お', romaji: 'o', hint: 'Overdose of circles' },
  { id: 'h-ka', char: 'か', romaji: 'ka', hint: 'A "ka-raoke" singer' },
  { id: 'h-ki', char: 'き', romaji: 'ki', hint: 'Looks like a Key' },
  { id: 'h-ku', char: 'く', romaji: 'ku', hint: 'Cuckoo\'s beak' },
  { id: 'h-ke', char: 'け', romaji: 'ke', hint: 'Looks like a Keg' },
  { id: 'h-ko', char: 'こ', romaji: 'ko', hint: 'Two worms "co-habiting"' },
  { id: 'h-sa', char: 'さ', romaji: 'sa', hint: 'A sign' },
  { id: 'h-shi', char: 'し', romaji: 'shi', hint: 'She has long hair' },
  { id: 'h-su', char: 'す', romaji: 'su', hint: 'Swinging on a tail' },
  { id: 'h-se', char: 'せ', romaji: 'se', hint: 'Setting sun' },
  { id: 'h-so', char: 'そ', romaji: 'so', hint: 'A zigzag' },
  { id: 'h-ta', char: 'た', romaji: 'ta', hint: 'Looks like "ta"' },
  { id: 'h-chi', char: 'ち', romaji: 'chi', hint: 'A cheerleader' },
  { id: 'h-tsu', char: 'つ', romaji: 'tsu', hint: 'Tsunami wave' },
  { id: 'h-te', char: 'て', romaji: 'te', hint: 'A tentacle' },
  { id: 'h-to', char: 'と', romaji: 'to', hint: 'Toe with a thorn' },
  { id: 'h-na', char: 'な', romaji: 'na', hint: 'A nun praying' },
  { id: 'h-ni', char: 'に', romaji: 'ni', hint: 'A knee' },
  { id: 'h-nu', char: 'ぬ', romaji: 'nu', hint: 'Noodles' },
  { id: 'h-ne', char: 'ね', romaji: 'ne', hint: 'A cat (ne-ko)' },
  { id: 'h-no', char: 'の', romaji: 'no', hint: 'A "no" entry sign' },
  { id: 'h-ha', char: 'は', romaji: 'ha', hint: 'Ha-ha! A mouth laughing' },
  { id: 'h-hi', char: 'ひ', romaji: 'hi', hint: 'A big smile (hee-hee)' },
  { id: 'h-fu', char: 'ふ', romaji: 'fu', hint: 'Fuji mountain' },
  { id: 'h-he', char: 'へ', romaji: 'he', hint: 'Help! Climbing a hill' },
  { id: 'h-ho', char: 'ほ', romaji: 'ho', hint: 'A hot stove' },
  { id: 'h-ma', char: 'ま', romaji: 'ma', hint: 'Mama\'s face' },
  { id: 'h-mi', char: 'み', romaji: 'mi', hint: 'Who is me? (mi)' },
  { id: 'h-mu', char: 'む', romaji: 'mu', hint: 'A cow says moo' },
  { id: 'h-me', char: 'め', romaji: 'me', hint: 'A messy eye' },
  { id: 'h-mo', char: 'も', romaji: 'mo', hint: 'A fishhook for more fish' },
  { id: 'h-ya', char: 'や', romaji: 'ya', hint: 'A yak' },
  { id: 'h-yu', char: 'ゆ', romaji: 'yu', hint: 'A fish in a net' },
  { id: 'h-yo', char: 'よ', romaji: 'yo', hint: 'A yo-yo' },
  { id: 'h-ra', char: 'ら', romaji: 'ra', hint: 'A rabbit' },
  { id: 'h-ri', char: 'り', romaji: 'ri', hint: 'Reeds in a river' },
  { id: 'h-ru', char: 'る', romaji: 'ru', hint: 'A loop' },
  { id: 'h-re', char: 'れ', romaji: 're', hint: 'A resting man' },
  { id: 'h-ro', char: 'ろ', romaji: 'ro', hint: 'A road' },
  { id: 'h-wa', char: 'わ', romaji: 'wa', hint: 'A wasp' },
  { id: 'h-wo', char: 'を', romaji: 'wo', hint: 'A person on a wall' },
  { id: 'h-n',  char: 'ん', romaji: 'n',  hint: 'The letter N' },
];

const FULL_KATAKANA: SyllabaryItem[] = [
  { id: 'k-a', char: 'ア', romaji: 'a', hint: 'Looks like an Axe' },
  { id: 'k-i', char: 'イ', romaji: 'i', hint: 'Looks like an Eagle' },
  { id: 'k-u', char: 'ウ', romaji: 'u', hint: 'U and a tail' },
  { id: 'k-e', char: 'エ', romaji: 'e', hint: 'Looks like an Elevator' },
  { id: 'k-o', char: 'オ', romaji: 'o', hint: 'An old man reclining' },
  { id: 'k-ka', char: 'カ', romaji: 'ka', hint: 'Strong "K" punch' },
  { id: 'k-ki', char: 'キ', romaji: 'ki', hint: 'Sharp Key' },
  { id: 'k-ku', char: 'ク', romaji: 'ku', hint: 'Cook\'s hat' },
  { id: 'k-ke', char: 'ケ', romaji: 'ke', hint: 'Looks like a K with a "ke-p"' },
  { id: 'k-ko', char: 'コ', romaji: 'ko', hint: 'A corner (ko-rner)' },
  { id: 'k-sa', char: 'サ', romaji: 'sa', hint: 'Sailing' },
  { id: 'k-shi', char: 'シ', romaji: 'shi', hint: 'She-wolf eyes' },
  { id: 'k-su', char: 'ス', romaji: 'su', hint: 'Soup' },
  { id: 'k-se', char: 'セ', romaji: 'se', hint: 'A sexy leg' },
  { id: 'k-so', char: 'ソ', romaji: 'so', hint: 'Sowing seeds' },
  { id: 'k-ta', char: 'タ', romaji: 'ta', hint: 'A tidal wave' },
  { id: 'k-chi', char: 'チ', romaji: 'chi', hint: 'A child' },
  { id: 'k-tsu', char: 'ツ', romaji: 'tsu', hint: 'Two cats' },
  { id: 'k-te', char: 'テ', romaji: 'te', hint: 'A telescope' },
  { id: 'k-to', char: 'ト', romaji: 'to', hint: 'A totem pole' },
  { id: 'k-na', char: 'ナ', romaji: 'na', hint: 'A knife' },
  { id: 'k-ni', char: 'ニ', romaji: 'ni', hint: 'Two knees' },
  { id: 'k-nu', char: 'ヌ', romaji: 'nu', hint: 'New shoes' },
  { id: 'k-ne', char: 'ネ', romaji: 'ne', hint: 'Never-ending loop' },
  { id: 'k-no', char: 'ノ', romaji: 'no', hint: 'A nose' },
  { id: 'k-ha', char: 'ハ', romaji: 'ha', hint: 'Heart' },
  { id: 'k-hi', char: 'ヒ', romaji: 'hi', hint: 'He-man' },
  { id: 'k-fu', char: 'フ', romaji: 'fu', hint: 'Full moon' },
  { id: 'k-he', char: 'ヘ', romaji: 'he', hint: 'Headphones' },
  { id: 'k-ho', char: 'ホ', romaji: 'ho', hint: 'A house' },
  { id: 'k-ma', char: 'マ', romaji: 'ma', hint: 'Magic mask' },
  { id: 'k-mi', char: 'ミ', romaji: 'mi', hint: 'Mirror' },
  { id: 'k-mu', char: 'ム', romaji: 'mu', hint: 'Mushroom' },
  { id: 'k-me', char: 'メ', romaji: 'me', hint: 'Metal' },
  { id: 'k-mo', char: 'モ', romaji: 'mo', hint: 'Morning' },
];

export function Library({ onLessonSelect }: { onLessonSelect: (id: string) => void }) {
  const { user } = useAuth();
  const { data: collections, isLoading } = useCollections(user?.id);
  const [searchQuery, setSearchQuery] = React.useState('');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-6">
        <Loader2 className="w-10 h-10 text-white/20 animate-spin" />
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] animate-pulse">Scanning Curriculum</p>
      </div>
    );
  }

  const filteredCollections = collections?.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-16 animate-fade-in w-full pb-20 text-left font-sans text-white">
      {/* Top Header & Search */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pt-2 px-1">
        <div className="flex items-center gap-12">
           <div className="flex flex-col gap-1 items-start">
              <h2 className="text-4xl font-display font-bold text-white uppercase tracking-tight">The Library</h2>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] italic">Scholar's Repository</p>
           </div>
        </div>
        
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#FFD6E0] transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="Query Artifacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-10 text-[10px] text-white placeholder:text-white/20 w-full md:w-80 focus:outline-none focus:border-[#FFD6E0]/40 focus:bg-white/10 transition-all font-sans uppercase tracking-widest font-black"
            />
          </div>
        </div>
      </header>

      {/* --- MASTER ROADMAP SECTION --- */}
      <section className="space-y-12">
        <div className="flex flex-col gap-4 items-start">
           <div className="flex items-center gap-4">
              <div className="h-px w-8 bg-[#FFD6E0]/40" />
              <span className="text-[10px] font-black text-[#FFD6E0]/60 uppercase tracking-[0.4em]">Mastery Roadmap</span>
           </div>
           <h3 className="text-6xl font-display font-bold text-white tracking-tighter uppercase leading-[0.85]">Foundational <span className="italic font-medium text-white/40 font-serif lowercase">Curriculum</span></h3>
        </div>

        {filteredCollections && filteredCollections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredCollections.map((collection) => {
              const status = collection.progressPercentage && collection.progressPercentage > 0 ? (collection.progressPercentage === 100 ? 'DONE' : 'IN_PROGRESS') : 'AVAILABLE';
              
              return (
                <GlassCard 
                  key={collection.id} 
                  className="p-10 space-y-10 group relative overflow-hidden active:scale-[0.98] transition-all duration-500 cursor-pointer"
                  onClick={() => onLessonSelect(collection.id)}
                >
                  {/* Decorative background character */}
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] translate-x-4 -translate-y-4 scale-[3] pointer-events-none text-white font-display">
                    {collection.icon || '学'}
                  </div>

                  <div className="flex items-center justify-between w-full relative z-10">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl font-display font-bold text-white group-hover:bg-[#FFD6E0]/10 group-hover:border-[#FFD6E0]/20 transition-all border border-white/10 shadow-lg">
                      {collection.icon || '学'}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/20 group-hover:text-[#FFD6E0] group-hover:border-[#FFD6E0]/20 transition-all">
                      <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  
                  <div className="space-y-4 flex flex-col items-start relative z-10">
                    <h3 className="text-2xl font-display font-bold text-white tracking-tight leading-tight uppercase group-hover:text-[#FFD6E0] transition-colors">
                      {collection.title}
                    </h3>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{collection.subtitle}</p>
                  </div>

                  <div className="space-y-6 pt-4 w-full flex flex-col items-start relative z-10">
                    <div className="flex justify-between items-end w-full">
                      <div className="flex items-center gap-3">
                        {status === 'DONE' ? (
                          <CheckCircle2 size={12} className="text-[#FFD6E0]" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-[#FFD6E0] animate-pulse shadow-[0_0_10px_rgba(255,214,224,0.6)]" />
                        )}
                        <span className={`text-[10px] font-black tracking-widest uppercase ${status === 'DONE' ? 'text-[#FFD6E0]' : 'text-white/20'}`}>
                          {status.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xl font-display font-bold text-white tracking-tight">{collection.progressPercentage || 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${collection.progressPercentage || 0}%` }}
                        className="h-full bg-white shadow-[0_0_15px_rgba(255,214,224,0.4)] transition-all duration-1000" 
                      />
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        ) : (
          <GlassCard className="p-20 text-center flex flex-col items-center justify-center gap-6 shadow-xl border-dashed">
            <Search size={40} className="text-white/10" />
            <div className="space-y-2">
              <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em]">No matching artifacts found</p>
              <p className="text-[9px] text-white/10 uppercase tracking-widest">Adjust your search query and try again</p>
            </div>
          </GlassCard>
        )}
      </section>

      {/* Atmospheric Branding */}
      <footer className="mt-20 opacity-10 flex items-center justify-center gap-6">
         <div className="h-px w-24 bg-white" />
         <span className="text-[12px] font-display font-bold text-white uppercase tracking-[1em]">学識者</span>
         <div className="h-px w-24 bg-white" />
      </footer>
    </div>
  );
}
