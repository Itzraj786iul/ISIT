'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { clearClientAuth } from '@/lib/client-auth';
import { fetchAuthMeCached, invalidateAuthMeCache } from '@/lib/auth-me-cache';

import type { LearningMode } from '@/lib/learning-mode';

export type { LearningMode };

type AuthUser = {
  _id?: string;
  name: string;
  email: string;
  role: string;
  organization_id?: string;
  class_id?: string;
  learning_mode?: LearningMode;
  email_verified?: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  refresh: (options?: { force?: boolean }) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => null,
  logout: async () => {},
});

/** Bumps on `refresh({ force: true })` so a slow pre-login `/api/auth/me` cannot overwrite state after login. */
let authFetchGeneration = 0;

async function fetchMe(force?: boolean): Promise<AuthUser | null> {
  const u = await fetchAuthMeCached({ force });
  if (u === null) {
    clearClientAuth();
  }
  return u as AuthUser | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (options?: { force?: boolean }) => {
    if (options?.force) {
      authFetchGeneration += 1;
    }
    const generation = authFetchGeneration;
    const u = await fetchMe(options?.force);
    if (generation !== authFetchGeneration) {
      return u;
    }
    setUser(u);
    setLoading(false);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    clearClientAuth();
    invalidateAuthMeCache();
    authFetchGeneration += 1;
    setUser(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
