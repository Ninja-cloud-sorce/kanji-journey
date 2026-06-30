import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

/**
 * useAuth - Central auth hook wrapper
 * 
 * Simply calls useContext(AuthContext) to access the centralized subscription state.
 * Maintains complete backwards compatibility with all callers.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
