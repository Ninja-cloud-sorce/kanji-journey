import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface AppPreferences {
  language: string;
  themePreference: string;
  audioPreference: string;
  notificationsEnabled: boolean;
}

interface AppPreferencesContextValue extends AppPreferences {
  setLanguage: (value: string) => void;
  setThemePreference: (value: string) => void;
  setAudioPreference: (value: string) => void;
  setNotificationsEnabled: (value: boolean) => void;
}

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('English');
  const [themePreference, setThemePreference] = useState('System');
  const [audioPreference, setAudioPreference] = useState('Balanced');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const value = useMemo(
    () => ({
      language,
      themePreference,
      audioPreference,
      notificationsEnabled,
      setLanguage,
      setThemePreference,
      setAudioPreference,
      setNotificationsEnabled,
    }),
    [language, themePreference, audioPreference, notificationsEnabled]
  );

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  );
}

export function useAppPreferences() {
  const ctx = useContext(AppPreferencesContext);
  if (!ctx) {
    throw new Error('useAppPreferences must be used inside AppPreferencesProvider');
  }
  return ctx;
}
