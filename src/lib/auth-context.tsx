'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { clearClientAuth } from '@/lib/client-auth';

type AuthUser = {
  _id?: string;
  name: string;
  email: string;
  role: string;
  organization_id?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => null,
  logout: async () => {},
});

let cachedPromise: Promise<AuthUser | null> | null = null;

async function fetchMe(): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.status === 401) {
      clearClientAuth();
      return null;
    }
    if (!res.ok) return null;
    const data = await res.json();
    return data.user ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!cachedPromise) {
      cachedPromise = fetchMe();
    }
    const u = await cachedPromise;
    cachedPromise = null;
    setUser(u);
    setLoading(false);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    clearClientAuth();
    setUser(null);
    cachedPromise = null;
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
