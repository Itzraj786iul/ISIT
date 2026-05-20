'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

type Role = 'student' | 'teacher' | 'parent' | 'admin';

type Options = {
  /** Allowed roles; redirects to the appropriate home if mismatch. */
  roles?: Role[];
  /** Where to send unauthenticated users (default /login). */
  loginPath?: string;
};

const ROLE_HOME: Record<Role, string> = {
  student: '/dashboard',
  teacher: '/teacher/dashboard',
  parent: '/parent/dashboard',
  admin: '/organization',
};

/**
 * Route guard using AuthProvider — no extra /api/auth/me round-trip per page.
 */
export function useRequireAuth(options: Options = {}) {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const loginPath = options.loginPath ?? '/login';

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(loginPath);
      return;
    }

    const role = (user.role ?? 'student').toLowerCase() as Role;
    const allowed = options.roles;

    if (!allowed?.length) return;

    if (!allowed.includes(role)) {
      router.replace(ROLE_HOME[role] ?? '/dashboard');
    }
  }, [user, loading, router, loginPath, options.roles]);

  return { user, loading, refresh, ready: !loading && !!user };
}
