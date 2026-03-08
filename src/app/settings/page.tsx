'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { User, ChevronRight, Bell, HelpCircle } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
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

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">Notifications</h2>
              <p className="text-sm text-slate-500 mt-0.5">Reminders for live classes, quizzes, and assignments</p>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-500" />
                <span className="font-medium text-slate-800">Email & in-app reminders</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notificationsEnabled}
                onClick={() => setNotificationsEnabled((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition ${notificationsEnabled ? 'bg-sky-500' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition left-1 ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <Link
            href="/help"
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-sky-200 hover:shadow transition no-underline text-slate-800"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-sky-500" />
              <span className="font-medium">Help & support</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>

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
