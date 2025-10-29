// /contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

type AuthState = {
  session: Session | null;
  loading: boolean;
};

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  session: Session | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Batch related values into a single state object to avoid intermediate renders
  const [state, setState] = useState<AuthState>({ session: null, loading: true });

  useEffect(() => {
    console.debug('[AuthProvider] mounted');
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      // update both session and loading together to avoid an intermediate render
      console.debug('[AuthProvider] getSession resolved, session:', session);
      setState({ session, loading: false });
    });

    // Subscribe to auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.debug('[AuthProvider] onAuthStateChange event, session:', session);
      setState(prev => ({ ...prev, session }));
    });

    return () => {
      console.debug('[AuthProvider] unmounted, unsubscribing');
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    isAuthenticated: !!state.session,
    loading: state.loading,
    session: state.session,
  }), [state.session, state.loading]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
