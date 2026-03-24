'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthSession, getSession, setSession, clearSession, initDB } from '@/lib';
import { Toaster } from 'sonner';

interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  logout: () => void;
  setAuthSession: (session: AuthSession) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession_] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize DB
        await initDB();

        // Get existing session
        const existingSession = getSession();
        setSession_(existingSession);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const logout = () => {
    clearSession();
    setSession_(null);
  };

  const setAuthSession = (newSession: AuthSession) => {
    setSession(newSession);
    setSession_(newSession);
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, logout, setAuthSession }}>
      {children}
      <Toaster />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
