'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { User, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    try {
      const u = JSON.parse(userStr);
      if (u?.role?.toLowerCase() === 'teacher') {
        router.push('/teacher/dashboard');
        return;
      }
      setUser(u);
    } catch {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your account and preferences</p>
        </div>

        <div className="max-w-xl space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">Profile</h2>
              <p className="text-sm text-slate-500 mt-0.5">Your account information</p>
            </div>
            <div className="p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{user?.name || 'Student'}</p>
                <p className="text-sm text-slate-500">{user?.email || ''}</p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-sky-200 hover:shadow transition no-underline text-slate-800"
          >
            <span className="font-medium">Back to Dashboard</span>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>
        </div>
      </main>
    </div>
  );
}
