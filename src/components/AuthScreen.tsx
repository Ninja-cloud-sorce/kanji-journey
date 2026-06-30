import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { GlassCard } from './ui/GlassCard';
import { ArrowRight, Mail, Lock, User, Terminal } from 'lucide-react';

export function AuthScreen() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: authError } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (authError) {
        setError(authError.message);
      } else if (!isLogin) {
        setSuccess("Identity registered. Please check your email to verify and establish connection.");
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen w-full flex items-center justify-center bg-[#8B8CE6] overflow-hidden selection:bg-white/20 selection:text-white font-sans">
      {/* Ambient Depth Background with Cinematic Overlay */}
      <div className="absolute inset-0 z-0 bg-[#8B8CE6]">
         <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-black/20 z-[1]" />
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-[2]" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[480px] px-6 relative z-10"
      >
        <div className="flex flex-col items-center gap-8 mb-12">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-2xl">
            <Terminal size={32} strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-3">
             <h1 className="text-4xl font-display font-bold text-white tracking-tight uppercase">
               {isLogin ? 'Establish Connection' : 'Register Identity'}
             </h1>
             <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">
               Authentication Terminal — Sec-Lvl 4
             </p>
          </div>
        </div>

        <GlassCard className="p-10 border-white/10 bg-white/5 shadow-2xl space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1 font-sans">Scholarly ID (Email)</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all font-medium font-sans"
                    placeholder="name@sanctuary.org"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1 font-sans">Encryption Key (Password)</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all font-medium font-sans"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center py-2"
              >
                Access Refused: {error}
              </motion.p>
            )}

            {success && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] font-black text-green-400 uppercase tracking-widest text-center py-2"
              >
                Ritual Initiated: {success}
              </motion.p>
            )}

            <button
              disabled={loading}
              className="btn-pink w-full flex items-center justify-center gap-3 h-14 !py-0 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all group"
            >
              <span className="text-[11px] font-black">{loading ? 'PROCESSING...' : isLogin ? 'INITIATE' : 'ESTABLISH'}</span>
              {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="flex items-center gap-4 py-2">
            <div className="h-[1px] flex-1 bg-white/5" />
            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">OR</span>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              const { error: googleError } = await signInWithGoogle();
              if (googleError) {
                setError(googleError.message);
                setLoading(false);
              }
            }}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/60 hover:text-white"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.22-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sanctify with Google</span>
          </button>

          <div className="pt-4 border-t border-white/5 flex flex-col items-center gap-4">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-black text-white/30 hover:text-white transition-colors uppercase tracking-[0.2em] font-sans"
            >
              {isLogin ? "No identity found? Register now" : "Existing scholar? Establish connection"}
            </button>
          </div>
        </GlassCard>

        {/* Global Branding Footer */}
        <footer className="mt-16 text-center opacity-10 font-sans pointer-events-none">
          <p className="text-[9px] font-black uppercase tracking-[0.8em]">System Integrity Verified</p>
        </footer>
      </motion.div>
    </div>
  );
}
