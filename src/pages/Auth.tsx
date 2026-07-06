import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';

interface AuthPageProps {
  onSignIn: (email: string, password: string) => Promise<{ error: any }>;
  onSignUp: (email: string, password: string) => Promise<{ error: any }>;
  onGoogleSignIn?: () => Promise<{ data: any; error: any }>;
}

export default function Auth({ onSignIn, onSignUp, onGoogleSignIn }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    if (!onGoogleSignIn) return;
    setGoogleLoading(true);
    setError(null);
    const { error } = await onGoogleSignIn();
    if (error) setError('Google sign-in failed. Please try again.');
    setGoogleLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isSignUp) {
      const { error } = await onSignUp(email, password);
      if (error) {
        setError(error.message);
        setLoading(false);
      }
      // On success: if email confirmation is on, stay on page (Supabase won't fire SIGNED_IN yet).
      // If confirmation is off, onAuthStateChange fires SIGNED_IN and App.tsx redirects automatically.
      // Either way we just clear the loading state and let auth state drive navigation.
      else {
        setLoading(false);
        setError(null);
        // Show a soft success hint in case email confirmation is required
        setEmail('');
        setPassword('');
      }
    } else {
      const { error } = await onSignIn(email, password);
      if (error) {
        setError(error.message);
      }
      // On success: onAuthStateChange fires SIGNED_IN → App.tsx redirects to /dashboard.
      setLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-[#FFF5F7]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/pink_drawn_bg.png" 
          alt="Sanctuary Mountains"
          className="w-full h-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFF5F7]/30 via-transparent to-[#FFF5F7]/80" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative z-10 w-full max-w-sm space-y-12 px-6"
      >
        {/* Header */}
        <div className="text-center space-y-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-[28px] bg-white border-2 border-pink-100 flex items-center justify-center text-accent font-serif font-black text-4xl shadow-xl shadow-pink-200/50">
            栞
          </div>
          <div className="space-y-2 flex flex-col items-center">
            <h1 className="text-4xl font-serif font-bold text-primary tracking-tight leading-tight">
              {isSignUp ? 'Begin your Journey' : 'Enter the Sanctuary'}
            </h1>
            <div className="w-10 h-1 bg-accent/20 rounded-full" />
            <p className="text-pink-700/60 text-[11px] font-black uppercase tracking-[0.4em] mt-2">
              Kairo Portal
            </p>
          </div>
        </div>

        {/* Form Container */}
        <GlassCard className="p-10 space-y-8 relative overflow-hidden backdrop-blur-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2 flex flex-col items-start">
                <label className="text-[10px] font-black uppercase tracking-widest text-pink-700/60 ml-1">Email Address</label>
                <div className="relative group w-full">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400 group-focus-within:text-accent transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="scholar@nexus.com"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/40 border border-pink-100 text-primary placeholder:text-pink-300 focus:outline-none focus:border-accent transition-all font-serif font-medium text-sm shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2 flex flex-col items-start text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-pink-700/60 ml-1 text-left">Secret Key</label>
                <div className="relative group w-full">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400 group-focus-within:text-accent transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/40 border border-pink-100 text-primary placeholder:text-pink-300 focus:outline-none focus:border-accent transition-all font-serif font-medium text-sm shadow-sm"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-[10px] text-red-500 font-bold text-center tracking-widest uppercase italic">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-pink w-full !py-5 shadow-xl flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="text-[11px] font-black">{isSignUp ? 'CREATE PROFILE' : 'AUTHENTICATE'}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-pink-100" />
            <span className="text-[9px] font-black uppercase tracking-widest text-pink-300">or</span>
            <div className="flex-1 h-px bg-pink-100" />
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-white border border-pink-100 hover:bg-pink-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span className="text-[11px] font-black uppercase tracking-widest text-pink-700/70">
              Continue with Google
            </span>
          </button>

          {/* Toggle Button */}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="w-full text-center text-[10px] font-black uppercase tracking-[0.1em] text-pink-700/60 hover:text-accent transition-colors"
          >
            {isSignUp ? 'Already authenticated? Sign In' : 'New initiate? Create profile'}
          </button>
        </GlassCard>

        {/* Footer Japanese text */}
        <div className="text-center space-y-3 pt-6 flex flex-col items-center">
          <p className="font-serif italic text-3xl text-pink-200 font-bold tracking-tight">始めましょう</p>
          <div className="w-12 h-px bg-pink-100" />
          <p className="text-[8px] font-black uppercase tracking-[0.6em] text-pink-300">Initiate Sequence</p>
        </div>
      </motion.div>
    </div>
  );
}
