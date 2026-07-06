import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  ChevronRight,
  Loader2,
  Save,
  Upload,
} from "lucide-react";
import { GlassCard } from './ui/GlassCard';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const AVATAR_PRESETS = [
  { id: 'preset:学', kanji: '学', bg: 'from-white/10 to-white/5',   label: 'Scholar'  },
  { id: 'preset:道', kanji: '道', bg: 'from-blue-500/20 to-blue-900/10', label: 'Path'    },
  { id: 'preset:武', kanji: '武', bg: 'from-red-500/20 to-red-900/10',  label: 'Warrior' },
  { id: 'preset:文', kanji: '文', bg: 'from-amber-500/20 to-amber-900/10', label: 'Culture'},
  { id: 'preset:月', kanji: '月', bg: 'from-indigo-500/20 to-indigo-900/10', label: 'Moon' },
  { id: 'preset:花', kanji: '花', bg: 'from-pink-500/20 to-pink-900/10', label: 'Flower'  },
  { id: 'preset:龍', kanji: '龍', bg: 'from-emerald-500/20 to-emerald-900/10', label: 'Dragon'},
  { id: 'preset:鳥', kanji: '鳥', bg: 'from-sky-500/20 to-sky-900/10',  label: 'Bird'    },
  { id: 'preset:星', kanji: '星', bg: 'from-violet-500/20 to-violet-900/10', label: 'Star' },
  { id: 'preset:風', kanji: '風', bg: 'from-teal-500/20 to-teal-900/10', label: 'Wind'   },
  { id: 'preset:火', kanji: '火', bg: 'from-orange-500/20 to-orange-900/10', label: 'Fire' },
  { id: 'preset:水', kanji: '水', bg: 'from-cyan-500/20 to-cyan-900/10', label: 'Water'   },
];

export function AvatarDisplay({ avatarUrl, size = 'md', className = '' }: { avatarUrl?: string | null; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const preset = AVATAR_PRESETS.find(p => p.id === avatarUrl);
  const sizeClass = size === 'sm' ? 'text-2xl' : size === 'lg' ? 'text-7xl' : 'text-4xl';

  if (preset) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${preset.bg} flex items-center justify-center ${className}`}>
        <span className={`${sizeClass} font-display font-bold text-white select-none`}>{preset.kanji}</span>
      </div>
    );
  }

  return (
    <img
      src={avatarUrl || '/images/default-avatar.svg'}
      alt="Avatar"
      className={`w-full h-full object-cover ${className}`}
      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.svg'; }}
    />
  );
}

export function Settings() {
  const { profile, updateProfile } = useAuth();

  const [activeSection, setActiveSection] = useState('identity');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar_url || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setSelectedAvatar(profile.avatar_url || '');
    }
  }, [profile]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const SECTIONS = [
    { id: 'identity', label: 'Identity', icon: User },
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await updateProfile({
        display_name: displayName,
        bio: bio,
        avatar_url: selectedAvatar || null,
      });
      if (error) throw error;
      toast.success("Identity records updated");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }
    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${profile.user_id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      // Update local state AND persist immediately so Profile reflects it without needing form submit
      setSelectedAvatar(publicUrl);
      await updateProfile({ avatar_url: publicUrl });
      toast.success('Profile photo updated');
    } catch (err: unknown) {
      toast.error(`Upload failed: ${(err as Error).message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };


  return (
    <div className="flex flex-col gap-12 animate-fade-in w-full pb-20 mt-4 text-left font-sans text-white">
      {/* Top Header */}
      <header className="flex flex-col gap-4 items-start text-left">
         <h1 className="text-6xl font-display font-bold text-white tracking-tight leading-tight uppercase">Scholar Settings</h1>
         <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em]">Customize your disciplinary environment</p>
      </header>

     <div className="grid grid-cols-12 gap-16">
        {/* Left: Navigation Menu */}
        <aside className="col-span-4 space-y-3 flex flex-col items-start w-full">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full p-6 rounded-2xl flex items-center justify-between group transition-all active:scale-[0.98] active:bg-[#121214] font-sans ${activeSection === section.id ? 'bg-white/10 text-white shadow-xl ring-1 ring-white/10' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/[0.08]'}`}
                style={{ transition: "background 120ms ease, transform 80ms ease" }}
              >
                <div className="flex items-center gap-6">
                   <section.icon size={20} className={`${activeSection === section.id ? 'text-white' : 'text-white/40 group-hover:text-white'} transition-colors`} />
                   <span className="text-[12px] font-black uppercase tracking-[0.2em] font-sans">{section.label}</span>
                </div>
                <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${activeSection === section.id ? 'opacity-100 translate-x-1' : ''}`} />
              </button>
            ))}
            
         </aside>

         {/* Right: Content Area */}
         <main className="col-span-8 flex flex-col items-start w-full">
            <GlassCard className="p-12 space-y-12 w-full flex flex-col items-start relative overflow-hidden min-h-[600px]">
              
              {/* IDENTITY TAB */}
              {activeSection === 'identity' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 w-full flex flex-col items-start">
                  <div className="space-y-4 flex flex-col items-start font-sans text-left">
                      <h3 className="text-4xl font-display font-bold text-white tracking-tight uppercase">Scholar Identity</h3>
                      <p className="text-white/60 text-base font-medium leading-relaxed italic font-display opacity-80 uppercase tracking-wider">Update your credentials and digital presence within the Kairo ecosystem.</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="w-full space-y-10 flex flex-col items-start">
                     {/* Avatar Picker */}
                     <div className="space-y-6 w-full flex flex-col items-start">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-1">Profile Icon</label>

                       <div className="flex items-start gap-10 w-full">
                         {/* Preview + upload */}
                         <div className="flex flex-col items-center gap-4 flex-shrink-0">
                           <div className="w-24 h-24 rounded-2xl border border-white/20 overflow-hidden shadow-xl">
                             <AvatarDisplay avatarUrl={selectedAvatar} size="sm" />
                           </div>
                           <button
                             type="button"
                             onClick={() => fileInputRef.current?.click()}
                             disabled={isUploading}
                             className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:border-white/40 transition-all disabled:opacity-40"
                           >
                             {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                             {isUploading ? 'Uploading...' : 'Upload Photo'}
                           </button>
                           <input
                             ref={fileInputRef}
                             type="file"
                             accept="image/*"
                             className="hidden"
                             onChange={handleImageUpload}
                           />
                         </div>

                         {/* Preset grid */}
                         <div className="flex-1 space-y-3">
                           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Or choose a preset</p>
                           <div className="grid grid-cols-6 gap-3">
                             {AVATAR_PRESETS.map((preset) => (
                               <button
                                 key={preset.id}
                                 type="button"
                                 onClick={() => setSelectedAvatar(preset.id)}
                                 title={preset.label}
                                 className={`w-full aspect-square rounded-xl border-2 transition-all duration-150 flex items-center justify-center bg-gradient-to-br ${preset.bg} active:scale-90 active:brightness-75 ${
                                   selectedAvatar === preset.id
                                     ? 'border-white ring-2 ring-white ring-offset-2 ring-offset-[#121214] scale-110 shadow-[0_0_18px_rgba(255,255,255,0.35)]'
                                     : 'border-white/15 hover:border-white/50 hover:scale-105'
                                 }`}
                               >
                                 <span className="text-lg font-display font-bold text-white select-none">{preset.kanji}</span>
                               </button>
                             ))}
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* Display Name */}
                     <div className="space-y-4 w-full flex flex-col items-start">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-1">Display Name</label>
                      <input 
                         type="text" 
                         value={displayName}
                         onChange={(e) => setDisplayName(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-2xl font-display font-bold text-white focus:outline-none focus:border-white transition-all uppercase tracking-tight shadow-inner"
                         placeholder="Scholar Name"
                      />
                     </div>

                     {/* Bio */}
                     <div className="space-y-4 w-full flex flex-col items-start">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-1">Academic Objective (Bio)</label>
                      <textarea 
                         value={bio}
                         onChange={(e) => setBio(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 p-8 rounded-3xl text-base font-medium italic font-display text-white/60 focus:outline-none focus:border-white transition-all uppercase tracking-wider shadow-inner min-h-[160px] resize-none"
                         placeholder="Dedicated to mastering..."
                      />
                     </div>

                     <button 
                      type="submit"
                      disabled={isSaving}
                      className="bg-white text-black px-12 py-5 shadow-2xl uppercase font-black text-[12px] tracking-[0.4em] rounded-full hover:bg-white/90 transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95"
                    >
                       {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={16} />}
                       Update Identity
                     </button>
                  </form>
                </motion.div>
              )}


            </GlassCard>
         </main>
      </div>
    </div>
  );
}
