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
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <ParentNav />
      <main className="flex-1 ml-[250px] min-w-0 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
