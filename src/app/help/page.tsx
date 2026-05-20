'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { ChevronRight, BookOpen, Video, Mail } from 'lucide-react';
import { useT } from '@/lib/t';

export default function HelpPage() {
  const tr = useT();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) {
          router.push('/login');
          return;
        }
        const data = await r.json();
        if (data.user?.role?.toLowerCase() === 'teacher') router.push('/teacher/dashboard');
      })
      .catch(() => router.push('/login'));
  }, [router]);

  return (
    <div className="isit-cosmic-bg relative flex min-h-screen font-sans ">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative z-[1] isit-app-header shrink-0">
          <div className="px-4 py-3 sm:px-6 md:px-8">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
              <Link href="/dashboard" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
                {tr('dashboard')}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              <span className="font-medium text-slate-700 dark:text-slate-200">{tr('help')}</span>
            </nav>
          </div>
        </header>

        <main className="isit-app-main isit-app-main--with-nav-toggle">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight isit-text-primary">{tr('settingsHelpLinkLabel')}</h1>
            <p className="mt-1 text-sm /70">{tr('helpPageLead')}</p>
          </div>

          <div className="max-w-2xl space-y-4">
            <Link
              href="/schedule"
              className="isit-card motion-safe-transition flex items-center justify-between rounded-xl p-4 isit-text-primary no-underline hover:border-cyan-300/40"
            >
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-cyan-400" />
                <span className="font-medium">{tr('helpLiveClass')}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-sky-600 dark:text-cyan-300/50" />
            </Link>
            <Link
              href="/my-courses"
              className="isit-card motion-safe-transition flex items-center justify-between rounded-xl p-4 isit-text-primary no-underline hover:border-cyan-300/40"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-cyan-400" />
                <span className="font-medium">{tr('helpCoursesLessons')}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-sky-600 dark:text-cyan-300/50" />
            </Link>
            <div className="isit-glass rounded-xl p-4">
              <div className="mb-2 flex items-center gap-3">
                <Mail className="h-5 w-5 text-cyan-400" />
                <span className="font-medium isit-text-primary">{tr('helpContactTitle')}</span>
              </div>
              <p className="text-sm isit-body">{tr('helpContactBody')}</p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 dark:text-cyan-300 hover:underline"
            >
              <ChevronRight className="h-4 w-4 rotate-180" /> {tr('helpBackDashboard')}
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
