'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { User, ChevronRight, Bell, HelpCircle } from 'lucide-react';
import { useT } from '@/lib/t';

export default function SettingsPage() {
  const tr = useT();
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) {
          router.push('/login');
          return;
        }
        const data = await r.json();
        const u = data.user;
        if (!u) {
          router.push('/login');
          return;
        }
        if (u.role?.toLowerCase() === 'teacher') {
          router.push('/teacher/dashboard');
          return;
        }
        setUser({ name: u.name, email: u.email, role: u.role });
      })
      .catch(() => router.push('/login'));
  }, [router]);

  return (
    <div className="isit-cosmic-bg relative flex min-h-screen font-sans ">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative z-[1] shrink-0 border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-white dark:bg-slate-950/95">
          <div className="px-4 py-3 sm:px-6 md:px-8">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
              <Link href="/dashboard" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
                {tr('dashboard')}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              <span className="font-medium text-slate-700 dark:text-slate-200">{tr('settings')}</span>
            </nav>
          </div>
        </header>

        <main className="relative z-[1] min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight isit-text-primary">{tr('settings')}</h1>
            <p className="mt-1 text-sm /70">{tr('settingsPageLead')}</p>
          </div>

          <div className="max-w-xl space-y-4">
            <div className="isit-glass overflow-hidden rounded-xl">
              <div className="border-b border-cyan-400/15 p-5">
                <h2 className="text-base font-bold isit-text-primary">{tr('settingsProfileTitle')}</h2>
                <p className="mt-0.5 text-sm isit-body/65">{tr('settingsProfileDesc')}</p>
              </div>
              <div className="flex items-center gap-4 p-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-cyan-400/25 bg-cyan-400/15 text-sky-600 dark:text-cyan-300">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-semibold isit-text-primary">{user?.name || tr('settingsStudentFallback')}</p>
                  <p className="text-sm isit-body/70">{user?.email || ''}</p>
                </div>
              </div>
            </div>

            <div className="isit-glass overflow-hidden rounded-xl">
              <div className="border-b border-cyan-400/15 p-5">
                <h2 className="text-base font-bold isit-text-primary">{tr('settingsNotificationsTitle')}</h2>
                <p className="mt-0.5 text-sm isit-body/65">{tr('settingsNotificationsDesc')}</p>
              </div>
              <div className="flex items-center justify-between gap-4 p-5">
                <div className="flex min-w-0 items-center gap-3">
                  <Bell className="h-5 w-5 shrink-0 text-sky-600 dark:text-cyan-300/80" />
                  <span className="font-medium isit-text-primary">{tr('settingsRemindersToggle')}</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notificationsEnabled}
                  onClick={() => setNotificationsEnabled((v) => !v)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${notificationsEnabled ? 'bg-cyan-500' : 'bg-slate-600'}`}
                >
                  <span
                    className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            </div>

            <Link
              href="/help"
              className="isit-card motion-safe-transition flex items-center justify-between rounded-xl p-4 isit-text-primary no-underline hover:border-cyan-300/40"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-cyan-400" />
                <span className="font-medium">{tr('settingsHelpLinkLabel')}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-sky-600 dark:text-cyan-300/50" />
            </Link>

            <Link
              href="/dashboard"
              className="isit-card motion-safe-transition flex items-center justify-between rounded-xl p-4 isit-text-primary no-underline hover:border-cyan-300/40"
            >
              <span className="font-medium">{tr('settingsBackDashboard')}</span>
              <ChevronRight className="h-5 w-5 text-sky-600 dark:text-cyan-300/50" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
