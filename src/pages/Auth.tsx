import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';

interface AuthPageProps {
  onSignIn: (email: string, password: string) => Promise<{ error: any }>;
  onSignUp: (email: string, password: string) => Promise<{ error: any }>;
}

export default function Auth({ onSignIn, onSignUp }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = isSignUp 
      ? await onSignUp(email, password)
      : await onSignIn(email, password);

    if (error) {
      setError(error.message);
    }
    setLoading(false);
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
              Kanji Journey Portal
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
