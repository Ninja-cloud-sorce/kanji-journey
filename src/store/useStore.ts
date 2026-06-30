import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SessionType = 'reading' | 'writing' | 'quiz' | 'vocab' | 'grammar';

interface Progress {
  h1: number; // Hiragana
  k1: number; // Katakana
  p1: number; // Particle
  v1: number; // Verb
  f1: number; // Starter
  f2: number; // Intermediate
}

interface AppState {
  // Navigation
  activeTab: string;
  selectedLessonId: string | null;
  sessionType: SessionType | null;
  
  // Data (persistent)
  progress: Progress;
  completedLessons: string[];
  xp: number;
  streak: number;
  
  // Actions
  setTab: (tab: string) => void;
  startLesson: (lessonId: string) => void;
  startSession: (type: SessionType) => void;
  exitSession: () => void;
  updateProgress: (module: keyof Progress, value: number) => void;
  completeLesson: (lessonId: string) => void;
  incrementXP: (amount: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      activeTab: 'dashboard',
      selectedLessonId: null,
      sessionType: null,
      
      progress: {
        h1: 0,
        k1: 0,
        p1: 0,
        v1: 0,
        f1: 0,
        f2: 0
      },
      completedLessons: [],
      xp: 0,
      streak: 0,

      setTab: (tab) => set({ 
        activeTab: tab, 
        selectedLessonId: tab === 'lessonDetail' ? undefined : null, 
        sessionType: null 
      }),
      
      startLesson: (lessonId) => set({ 
        selectedLessonId: lessonId, 
        activeTab: 'lessonDetail' 
      }),
      
      startSession: (type) => set({ 
        sessionType: type, 
        activeTab: 'session' 
      }),
      
      exitSession: () => set((state) => ({ 
        sessionType: null, 
        activeTab: state.selectedLessonId ? 'lessonDetail' : 'practice' 
      })),
      
      updateProgress: (module, value) => set((state) => ({
        progress: {
          ...state.progress,
          [module]: value
        }
      })),

      completeLesson: (lessonId) => set((state) => {
        if (state.completedLessons.includes(lessonId)) return {};
        return { completedLessons: [...state.completedLessons, lessonId] };
      }),

      incrementXP: (amount) => set((state) => ({ xp: state.xp + amount })),
    }),
    {
      name: 'scholarly-journey-storage',
      partialize: (state) => ({
        progress: state.progress,
        completedLessons: state.completedLessons,
        xp: state.xp,
        streak: state.streak,
      }),
    }
  )
);
