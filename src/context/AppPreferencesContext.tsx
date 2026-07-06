import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

const STORAGE_KEY = 'kairo:app-preferences';

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

const DEFAULTS: AppPreferences = {
  language: 'English',
  themePreference: 'System',
  audioPreference: 'Balanced',
  notificationsEnabled: true,
};

function loadPreferences(): AppPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

function savePreferences(prefs: AppPreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<AppPreferences>(loadPreferences);

  const update = useCallback((patch: Partial<AppPreferences>) => {
    setPrefs(prev => {
      const next = { ...prev, ...patch };
      savePreferences(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      ...prefs,
      setLanguage:             (v: string)  => update({ language: v }),
      setThemePreference:      (v: string)  => update({ themePreference: v }),
      setAudioPreference:      (v: string)  => update({ audioPreference: v }),
      setNotificationsEnabled: (v: boolean) => update({ notificationsEnabled: v }),
    }),
    [prefs, update]
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
