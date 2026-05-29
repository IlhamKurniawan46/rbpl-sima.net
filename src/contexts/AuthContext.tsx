'use client';

// ============================================================
// AuthContext — Real Supabase Auth (replaces mock auth)
// ============================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { Profile, UserRole } from '@/lib/types/database';

// ---- Shape of the context ----
interface AuthContextType {
  /** Raw Supabase auth user (contains email, id, etc.) */
  user: SupabaseUser | null;
  /** Extended profile row from public.profiles */
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();

  const [session, setSession]   = useState<Session | null>(null);
  const [user, setUser]         = useState<SupabaseUser | null>(null);
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true while we wait for initial session

  // ------------------------------------------------------------------
  // Fetch the extended profile row from public.profiles
  // ------------------------------------------------------------------
  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role, created_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthContext] Failed to fetch profile:', error.message);
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }
    },
    [supabase]
  );

  // ------------------------------------------------------------------
  // Bootstrap: restore session on first render and subscribe to changes
  // ------------------------------------------------------------------
  useEffect(() => {
    // 1. Restore current session synchronously if already stored in cookies
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // 2. Listen for future auth state changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  // ------------------------------------------------------------------
  // login
  // ------------------------------------------------------------------
  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setIsLoading(false);

      if (error) {
        return { success: false, error: 'Email atau password salah' };
      }
      return { success: true };
    },
    [supabase]
  );

  // ------------------------------------------------------------------
  // logout
  // ------------------------------------------------------------------
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---- Hook ----
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ---- Helper ----
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'admin':      return '/admin/dashboard';
    case 'technician': return '/technician/dashboard';
    case 'customer':   return '/customer/dashboard';
  }
}
