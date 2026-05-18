'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { Video, ArrowLeft, ChevronRight } from 'lucide-react';
import { useT } from '@/lib/t';

export default function LiveSessionPage() {
  const tr = useT();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) router.push('/login');
      })
      .catch(() => router.push('/login'));
  }, [router]);

  return (
    <div className="isit-app-bg min-h-screen flex font-sans relative">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-white dark:bg-slate-950/95">
          <div className="px-4 py-3 sm:px-6 md:px-8">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
              <Link href="/dashboard" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
                {tr('dashboard')}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              <Link href="/schedule" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
                {tr('schedule')}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              <span className="font-medium text-slate-700 dark:text-slate-200">{tr('liveBreadcrumbCurrent')}</span>
            </nav>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
          <Link href="/schedule" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-medium mb-6 dark:text-sky-400 dark:hover:text-sky-300">
            <ArrowLeft className="w-4 h-4" aria-hidden /> {tr('liveBackSchedule')}
          </Link>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-900">
              <div className="bg-sky-500 text-white px-6 py-4 flex items-center gap-3">
                <Video className="w-8 h-8 shrink-0" aria-hidden />
                <div>
                  <p className="text-sky-100 text-xs font-semibold uppercase tracking-wide">{tr('liveSessionEyebrow')}</p>
                  <h1 className="text-xl font-bold">{tr('liveSessionTitle')}</h1>
                  <p className="text-sky-100 text-sm">{tr('liveSessionSubtitle')}</p>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <div className="aspect-video bg-slate-100 rounded-xl flex flex-col items-center justify-center gap-4 p-6 text-center dark:bg-slate-800">
                  <Video className="w-16 h-16 text-slate-400" aria-hidden />
                  <p className="text-slate-600 font-medium dark:text-slate-300">{tr('liveSessionPlaceholderTitle')}</p>
                  <p className="text-slate-500 text-sm max-w-md dark:text-slate-400">
                    {tr('liveSessionPlaceholderLead')}
                  </p>
                </div>
                <p className="mt-6 text-slate-500 text-sm dark:text-slate-400">
                  {tr('liveSessionReminder')}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
