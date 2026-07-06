import React, { useState, lazy, Suspense } from 'react';
import { Navigation } from '@/components/Navigation';
import { Onboarding } from "@/components/Onboarding";
import { useAuth } from '@/hooks/useAuth';
import { Outlet, useLocation } from 'react-router-dom';

const AIChatBubble = lazy(() => import("@/components/AIChatBubble").then(m => ({ default: m.AIChatBubble })));

export default function Index() {
  const { user, profile, refreshProfile } = useAuth();
  const location = useLocation();
  const [onboardingDone, setOnboardingDone] = useState(false);

  // Onboarding Gate: wait until profile is resolved, then gate on onboarding_completed.
  // Skip if localStorage flag is already set (survives reloads when MongoDB isn't connected).
  const localOnboardingDone = localStorage.getItem('kairo_onboarding_done') === '1';
  if (user && profile && !profile.onboarding_completed && !onboardingDone && !localOnboardingDone) {
    return (
      <Onboarding
        userId={user.id}
        onComplete={async () => {
          setOnboardingDone(true);
          await refreshProfile(); // sync AuthContext with the DB-updated profile immediately
        }}
      />
    );
  }

  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';


  return (
    <div className="flex h-screen w-full bg-[var(--bg-base)] overflow-hidden selection:bg-white/20 selection:text-white font-sans">
      {/* Hand-Drawn Atmospheric Layer */}
      <div className="scholar-bg" />
      
      {/* Navigation (Transparent/Luminous) */}
      <Navigation />
      
      {/* Scrollable Content Area */}
      <main className="flex-1 h-screen overflow-y-auto relative z-10 custom-scrollbar">
        <div
          className={`min-h-full relative ${
            isDashboard
              ? 'w-full px-10 xl:px-14 py-10'
              : 'max-w-[1600px] mx-auto px-10 xl:px-14 py-14'
          }`}
        >
          <div key={location.pathname} className="h-full animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Global AI Oracle — lazy loaded; doesn't block first paint */}
      <Suspense fallback={null}>
        <AIChatBubble />
      </Suspense>
    </div>
  );
}
