import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, LogIn, X, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (email: string, pass: string) => Promise<{ error: any }>;
  onSignInWithGoogle: () => Promise<{ error: any }>;
  onContinueAsGuest?: () => Promise<{ error: any }>;
}

export function AuthModal({ isOpen, onClose, onSignIn, onSignInWithGoogle, onContinueAsGuest }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await onSignIn(email, password);
    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    const result = await onSignInWithGoogle();
    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    }
  };
  const handleGuest = async () => {
    setLoading(true);
    setError(null);
    if (onContinueAsGuest) {
      const result = await onContinueAsGuest();
      if (result.error) {
        setError(result.error.message);
        setLoading(false);
      } else {
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-md glass-panel p-10 rounded-[2rem] relative z-10"
          >
            <button 
               onClick={onClose}
               className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3 mb-12">
              <h2 className="text-3xl font-light tracking-[0.2em] font-heading">Save your journey</h2>
              <p className="text-muted-foreground font-light px-6">Continue your progress effortlessly across all devices.</p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-4 h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-light tracking-widest uppercase text-xs"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Continue with Google</span>}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <div className="relative flex justify-center"><span className="bg-transparent px-4 text-[10px] uppercase tracking-[0.4em] text-white/20">or</span></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                  type="email" 
                  placeholder="EMAIL"
                  className="w-full bg-white/5 border border-white/10 h-14 rounded-2xl px-6 focus:outline-none focus:border-primary/40 transition-colors uppercase tracking-[0.3em] text-[11px] font-light"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input 
                  type="password" 
                  placeholder="PASSWORD"
                  className="w-full bg-white/5 border border-white/10 h-14 rounded-2xl px-6 focus:outline-none focus:border-primary/40 transition-colors uppercase tracking-[0.3em] text-[11px] font-light"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
                {error && <p className="text-red-400 text-[10px] text-center uppercase tracking-widest">{error}</p>}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-primary text-black font-medium tracking-[0.3em] uppercase text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_-5px_rgba(255,200,100,0.4)]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue with Email'}
                </button>
              </form>

              <div className="pt-4">
                 <button 
                   onClick={handleGuest}
                   disabled={loading}
                   className="w-full h-12 rounded-2xl border border-white/5 hover:bg-white/5 text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-all"
                 >
                   Explore as Guest
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
