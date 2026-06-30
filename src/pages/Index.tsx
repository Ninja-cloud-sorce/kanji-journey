import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { AIChatBubble } from "@/components/AIChatBubble";
import { Onboarding } from "@/components/Onboarding";
import { useAuth } from '@/hooks/useAuth';
import { Outlet, useLocation } from 'react-router-dom';

export default function Index() {
  const { isAuthenticated, isLoading, user, profile } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-base)]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin" />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] animate-pulse">Establishing Connection</span>
        </div>
      </div>
    );
  }

  // Onboarding Gate: if authenticated but onboarding is not completed, enforce Onboarding walkthrough
  if (profile && !profile.onboarding_completed) {
    return (
      <Onboarding 
        userId={user!.id} 
        onComplete={() => {
          // Reload page to re-fetch authenticated session and state
          window.location.reload();
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
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Global AI Oracle */}
      <AIChatBubble />
    </div>
  );
}
