'use client';

/**
 * @legacy MARKETPLACE_LMS — Certificate keyed by `courseId`. Future: /certificate/topic/[topicId] from mastery.
 * Migration: docs/AI_FIRST_MIGRATION.md
 */
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { Award, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useT } from '@/lib/t';
import { useLanguage } from '@/lib/language-context';

export default function CertificatePage() {
  const tr = useT();
  const { language } = useLanguage();
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!meRes.ok) { router.push('/login'); return; }
      const meData = await meRes.json();
      setUserName(meData.user?.name || tr('settingsStudentFallback'));

      let title = tr('certificateCourseFallback');
      if (courseId) {
        try {
          const res = await fetch(`/api/course/${courseId}`);
          if (res.ok) {
            const data = await res.json();
            title = data.course?.title || tr('certificateCourseFallback');
          }
        } catch {
          // keep fallback
        }
      }
      setCourseTitle(title);
      setLoading(false);
    };
    run();
  }, [courseId, router, language, tr]);

  const dateStr = new Date().toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="isit-cosmic-bg min-h-screen flex font-sans text-cyan-50 relative">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" aria-hidden />
        </main>
      </div>
    );
  }

  return (
    <div className="isit-cosmic-bg min-h-screen flex font-sans text-cyan-50 relative">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950/95">
          <div className="px-4 py-3 sm:px-6 md:px-8">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
              <Link href="/dashboard" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
                {tr('dashboard')}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              <Link href="/my-courses" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
                {tr('myCourses')}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              <span className="font-medium text-slate-700 dark:text-slate-200">{tr('certificateBreadcrumbCurrent')}</span>
            </nav>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
          <Link href="/my-courses" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-medium mb-6 dark:text-sky-400 dark:hover:text-sky-300">
            <ChevronLeft className="w-4 h-4" aria-hidden /> {tr('certificateBackMyCourses')}
          </Link>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-lg overflow-hidden p-8 sm:p-12 text-center dark:border-amber-800/60 dark:bg-slate-900">
              <Award className="w-16 h-16 text-amber-500 mx-auto mb-4" aria-hidden />
              <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-2 dark:text-amber-400">{tr('certificateEyebrow')}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 dark:text-slate-100">{tr('certificateTitleIntro')}</h1>
              <p className="text-xl font-semibold text-slate-700 mb-6 dark:text-slate-200">{userName}</p>
              <p className="text-slate-600 mb-1 dark:text-slate-400">{tr('certificateHasCompleted')}</p>
              <p className="text-lg font-bold text-slate-800 mb-8 dark:text-slate-100">{courseTitle}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{tr('certificateOrgLine')}</p>
              <p className="text-xs text-slate-400 mt-2 dark:text-slate-500">{tr('certificateDateLabel')}: {dateStr}</p>
              <button
                type="button"
                onClick={() => window.print()}
                className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600 transition"
              >
                <Download className="w-4 h-4" aria-hidden /> {tr('certificatePrint')}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
