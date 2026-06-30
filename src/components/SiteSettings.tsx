import { motion } from 'framer-motion';
import { Bell, Globe2, MoonStar, Volume2, UserCog } from 'lucide-react';
import { useAppPreferences } from '@/context/AppPreferencesContext';

export function SiteSettings() {
  const {
    language,
    themePreference,
    audioPreference,
    notificationsEnabled,
    setLanguage,
    setThemePreference,
    setAudioPreference,
    setNotificationsEnabled,
  } = useAppPreferences();

  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg md:max-w-2xl xl:max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-light text-foreground mb-2">Site Settings</h1>
          <p className="text-muted-foreground">Preferences for app behavior, language, sound, and account experience.</p>
        </div>

        <div className="glass-card p-5 space-y-5">
          <div className="flex items-center gap-3">
            <Globe2 className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Language</p>
              <p className="text-sm text-muted-foreground">Interface language and helper text.</p>
            </div>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-xl bg-secondary px-3 py-2 text-sm text-foreground">
              <option>English</option>
              <option>Japanese</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <MoonStar className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Theme</p>
              <p className="text-sm text-muted-foreground">Choose light, dark, or system mode.</p>
            </div>
            <select value={themePreference} onChange={(e) => setThemePreference(e.target.value)} className="rounded-xl bg-secondary px-3 py-2 text-sm text-foreground">
              <option>System</option>
              <option>Light</option>
              <option>Dark</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Audio Preferences</p>
              <p className="text-sm text-muted-foreground">Playback emphasis for charts, lessons, and pronunciation.</p>
            </div>
            <select value={audioPreference} onChange={(e) => setAudioPreference(e.target.value)} className="rounded-xl bg-secondary px-3 py-2 text-sm text-foreground">
              <option>Balanced</option>
              <option>Voice Focus</option>
              <option>Quiet</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Notifications</p>
              <p className="text-sm text-muted-foreground">Control daily reminders and milestone nudges.</p>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-12 h-7 rounded-full ${notificationsEnabled ? 'bg-primary' : 'bg-secondary'}`}
            >
              <motion.div animate={{ x: notificationsEnabled ? 22 : 4 }} className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <UserCog className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Account Controls</p>
              <p className="text-sm text-muted-foreground">Reserved for profile, privacy, and export settings.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
