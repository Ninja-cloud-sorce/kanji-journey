import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Tables } from '@/integrations/supabase/types';

// Profile type from Supabase schema
type Profile = Tables<'profiles'>;

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean; // True while checking session or loading profile
  isAuthenticated: boolean;
}

/**
 * useAuth - Central auth hook for the app
 * 
 * Architecture:
 *   Frontend → Supabase Client → Postgres DB
 *   RLS ensures users only see their own data.
 *   No custom backend required for MVP.
 * 
 * Session is persisted in localStorage by the Supabase client.
 * onAuthStateChange fires on login, logout, token refresh, and page load,
 * so the UI always reflects the true auth state without flicker.
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true, // Start loading until session is resolved
    isAuthenticated: false,
  });

  // Fetch the user's profile from the profiles table
  // RLS policy: "Users can view own profile" ensures we only get our own data
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle to handle missing profile gracefully

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  }, []);

  useEffect(() => {
    // 1. Set up the auth state listener FIRST (before getSession)
    //    This ensures we never miss an auth event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;

        if (user) {
          // Fetch profile after auth state resolves
          // Use setTimeout to avoid Supabase auth deadlock
          setTimeout(async () => {
            const profile = await fetchProfile(user.id);
            setState({
              user,
              session,
              profile,
              isLoading: false,
              isAuthenticated: true,
            });
          }, 0);
        } else {
          setState({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    );

    // 2. Then check for existing session (page refresh scenario)
    //    The onAuthStateChange callback above will handle the result.
    supabase.auth.getSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  // Sign up with email and password
  // The handle_new_user trigger auto-creates a profile row on signup
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  // Sign out and clear session
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // Update user profile in Supabase
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!state.user) return { error: new Error('Not authenticated') };
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', state.user.id);

    if (!error) {
      // Refresh profile data after update
      const profile = await fetchProfile(state.user.id);
      setState(prev => ({ ...prev, profile }));
    }
    return { error };
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
}
