import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Volume2, 
  ChevronRight,
  LogOut,
  Bell,
  Zap,
  Check,
  Camera, 
  Loader2, 
  Save,
  VolumeX,
  Volume1
} from "lucide-react";
import { GlassCard } from './ui/GlassCard';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAppPreferences } from '@/context/AppPreferencesContext';

export function Settings() {
  const { profile, updateProfile, signOut } = useAuth();
  const { 
    audioPreference, 
    setAudioPreference, 
    notificationsEnabled, 
    setNotificationsEnabled 
  } = useAppPreferences();

  const [activeSection, setActiveSection] = useState('identity');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for form
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [dailyGoal, setDailyGoal] = useState(profile?.daily_goal_minutes || 15);

  if (!profile) return null;

  const SECTIONS = [
    { id: 'identity', label: 'Identity', icon: User },
    { id: 'rituals', label: 'Rituals', icon: Bell },
    { id: 'audio', label: 'Audio', icon: Volume2 },
  ];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Synchronized with Sanctuary Network");
    }, 1500);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await updateProfile({
        display_name: displayName,
        bio: bio,
        avatar_url: avatarUrl,
        daily_goal_minutes: dailyGoal
      });
      if (error) throw error;
      toast.success("Identity records updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsSaving(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.user_id}/${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success("Avatar image uploaded to Sanctuary storage");
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      toast.error(`Avatar upload failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoalUpdate = async (minutes: number) => {
    setDailyGoal(minutes);
    try {
      const { error } = await updateProfile({
        daily_goal_minutes: minutes
      });
      if (error) throw error;
      toast.success(`Daily goal updated to ${minutes} minutes`);
    } catch (err: any) {
      toast.error("Failed to update daily goal");
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
            
            <div className="pt-8 space-y-4 w-full border-t border-white/10 flex flex-col items-start font-sans">
               <button 
                  onClick={() => signOut()}
                  className="w-full p-6 text-[10px] font-black text-white/20 hover:text-red-400 uppercase tracking-[0.3em] flex items-center gap-4 transition-all group pt-6 active:scale-95"
                >
                  <LogOut size={18} />
                  Terminate Session
               </button>
            </div>
         </aside>

         {/* Right: Content Area */}
         <main className="col-span-8 flex flex-col items-start w-full">
            <GlassCard className="p-12 space-y-12 w-full flex flex-col items-start relative overflow-hidden min-h-[600px]">
              
              {/* IDENTITY TAB */}
              {activeSection === 'identity' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 w-full flex flex-col items-start">
                  <div className="space-y-4 flex flex-col items-start font-sans text-left">
                      <h3 className="text-4xl font-display font-bold text-white tracking-tight uppercase">Scholar Identity</h3>
                      <p className="text-white/60 text-base font-medium leading-relaxed italic font-display opacity-80 uppercase tracking-wider">Update your credentials and digital presence within the Kanji Journey ecosystem.</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="w-full space-y-10 flex flex-col items-start">
                     {/* Avatar Section */}
                     <div className="flex items-center gap-12 p-10 rounded-[32px] bg-white/5 w-full shadow-xl border border-white/5 group">
                      <div className="relative w-32 h-32 rounded-[24px] bg-white/5 border border-white/10 overflow-hidden shadow-2xl flex-shrink-0">
                         <img 
                            src={avatarUrl || '/placeholder.svg'} 
                            className="w-full h-full object-cover transition-all group-hover:scale-105"
                            alt="avatar"
                         />
                         <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                            <Camera size={24} className="text-white translate-y-2 group-hover:translate-y-0 transition-transform" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                         </label>
                      </div>
                      <div className="space-y-3 flex flex-col items-start font-sans">
                         <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Identity Avatar</h4>
                         <p className="text-[13px] text-white/60 italic font-display uppercase tracking-widest leading-relaxed">Click image to upload new credentials visual</p>
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

              {/* RITUALS TAB */}
              {activeSection === 'rituals' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 w-full flex flex-col items-start text-left">
                  <div className="space-y-4 flex flex-col items-start font-sans">
                      <h3 className="text-4xl font-display font-bold text-white tracking-tight uppercase">Daily Rituals</h3>
                      <p className="text-white/60 text-base font-medium leading-relaxed italic font-display opacity-80 uppercase tracking-wider">Configure daily targets and notifications to maintain your study streak.</p>
                  </div>

                  <div className="w-full space-y-10">
                     {/* Daily Study Goal */}
                     <div className="space-y-6 flex flex-col items-start font-sans">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-1">Daily Study Target</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                          {[10, 15, 20, 30, 45, 60].map((mins) => (
                            <button
                              key={mins}
                              onClick={() => handleGoalUpdate(mins)}
                              className={`p-5 rounded-2xl text-center transition-all border font-sans ${dailyGoal === mins ? 'bg-white text-black border-white shadow-xl font-bold' : 'bg-white/5 text-white/60 border-white/5 hover:text-white hover:bg-white/10'}`}
                            >
                              <span className="block text-2xl font-display font-bold leading-none mb-1">{mins}</span>
                              <span className="text-[9px] font-black uppercase tracking-wider opacity-60">minutes</span>
                            </button>
                          ))}
                        </div>
                     </div>

                     <div className="h-px w-full bg-white/10" />

                     {/* Notification Toggles */}
                     <div className="flex items-center justify-between p-8 rounded-3xl bg-white/5 border border-white/5 w-full">
                        <div className="space-y-2 flex flex-col items-start font-sans">
                           <h4 className="text-lg font-bold text-white uppercase tracking-wider">Sanctuary Notifications</h4>
                           <p className="text-xs text-white/40 normal-case">Enable push notifications and emails to remind you before your streak expires.</p>
                        </div>
                        <button
                          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                          className={`w-16 h-8 rounded-full p-1 transition-all ${notificationsEnabled ? 'bg-white' : 'bg-white/10'}`}
                        >
                          <div className={`w-6 h-6 rounded-full transition-all ${notificationsEnabled ? 'bg-black translate-x-8' : 'bg-white/30 translate-x-0'}`} />
                        </button>
                     </div>
                  </div>
                </motion.div>
              )}

              {/* AUDIO TAB */}
              {activeSection === 'audio' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 w-full flex flex-col items-start text-left">
                  <div className="space-y-4 flex flex-col items-start font-sans">
                      <h3 className="text-4xl font-display font-bold text-white tracking-tight uppercase">Auditory Rituals</h3>
                      <p className="text-white/60 text-base font-medium leading-relaxed italic font-display opacity-80 uppercase tracking-wider">Modify the auditory feedbacks and audio pronunciation rendering style.</p>
                  </div>

                  <div className="w-full space-y-10">
                     <div className="space-y-6 flex flex-col items-start font-sans">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-1">Soundscapes & Feedback</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                          {[
                            { id: 'None', label: 'Silent Mode', icon: VolumeX, desc: 'All sound effects and background ambient ticks disabled.' },
                            { id: 'Balanced', label: 'Balanced Feedback', icon: Volume1, desc: 'Soft feedback sounds on correct quiz answers and alerts.' },
                            { id: 'High', label: 'Rich Resonance', icon: Volume2, desc: 'Immersive sound cues and full audio definitions playback.' }
                          ].map((pref) => (
                            <button
                              key={pref.id}
                              onClick={() => setAudioPreference(pref.id)}
                              className={`p-8 rounded-[32px] text-left transition-all border flex flex-col justify-between min-h-[200px] font-sans ${audioPreference === pref.id ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 text-white/40 border-white/5 hover:text-white hover:bg-white/10'}`}
                            >
                              <pref.icon size={28} className={audioPreference === pref.id ? 'text-black' : 'text-white/40'} />
                              <div className="space-y-2 mt-6">
                                <h4 className="text-base font-bold uppercase tracking-wider">{pref.label}</h4>
                                <p className={`text-xs normal-case leading-relaxed ${audioPreference === pref.id ? 'text-black/60' : 'text-white/30'}`}>{pref.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}

              <div className="mt-auto pt-10 flex items-center justify-end border-t border-white/10 w-full font-sans text-white">
                 <button 
                   onClick={handleSync}
                   disabled={isSyncing}
                   className="bg-white text-black px-12 py-4 shadow-2xl uppercase font-black text-[11px] tracking-[0.4em] rounded-full hover:bg-white/90 transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95"
                 >
                    {isSyncing ? (
                      <>Syncing...</>
                    ) : (
                      <>
                       <Check size={14} strokeWidth={4} />
                       Synchronize All
                      </>
                    )}
                 </button>
              </div>
            </GlassCard>
         </main>
      </div>
    </div>
  );
}
