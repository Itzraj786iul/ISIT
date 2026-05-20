'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ParentNav from '@/components/ParentNav';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const check = async () => {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        router.replace('/login');
        return;
      }
      const data = await res.json();
      const role = data.user?.role?.toLowerCase();
      if (role === 'teacher') {
        router.replace('/teacher/dashboard');
        return;
      }
      if (role !== 'parent') {
        router.replace('/dashboard');
        return;
      }
      setAllowed(true);
    };
    check();
  }, [router]);

  if (!allowed) {
    return (
      <div className="isit-app-bg min-h-screen flex items-center justify-center">
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="isit-app-bg relative flex min-h-screen overflow-x-hidden">
      <ParentNav />
      <main className="isit-app-main isit-app-main--with-nav-toggle">{children}</main>
    </div>
  );
}
