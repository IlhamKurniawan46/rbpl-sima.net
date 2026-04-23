'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, UserRole } from '@/lib/types/database';
import { mockUsers, DEMO_CREDENTIALS } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('sima-user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));

    // Check demo credentials
    const validCreds = Object.values(DEMO_CREDENTIALS).find(
      (cred) => cred.email === email && cred.password === password
    );

    if (!validCreds) {
      setIsLoading(false);
      return { success: false, error: 'Email atau password salah' };
    }

    const foundUser = mockUsers.find((u) => u.email === email);
    if (!foundUser) {
      setIsLoading(false);
      return { success: false, error: 'User tidak ditemukan' };
    }

    setUser(foundUser);
    localStorage.setItem('sima-user', JSON.stringify(foundUser));
    setIsLoading(false);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sima-user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Helper to get the dashboard path for a given role
 */
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'technician': return '/technician/dashboard';
    case 'customer': return '/customer/dashboard';
  }
}
