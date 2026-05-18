'use client';

/**
 * @legacy MARKETPLACE_LMS — Enrolled courses (GET /api/student/enrolled-courses).
 * AI-first hub: dashboard + /subjects + /session/[id] resume links.
 * Migration: docs/AI_FIRST_MIGRATION.md
 */
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import { BookOpen, ChevronRight, Search } from 'lucide-react';
import LegacyMarketplaceBanner from '@/components/LegacyMarketplaceBanner';
import { useT } from '@/lib/t';

type EnrolledItem = {
  course: { _id: string; title: string; description?: string; teacherId?: { name?: string }; image?: string };
  lessonCount: number;
  completedCount: number;
  progressPercent: number;
  nextLessonId: string | null;
  nextLessonTitle: string | null;
};

type Filter = 'all' | 'in_progress' | 'completed';

export default function MyCoursesPage() {
  const tr = useT();
  const router = useRouter();
  const [enrolled, setEnrolled] = useState<EnrolledItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    const run = async () => {
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      const userData = meData.user as { _id?: string; id?: string; role?: string };
      if (!userData || userData.role?.toLowerCase() === 'teacher') {
        router.push('/teacher/dashboard');
        return;
      }

      try {
        const res = await fetch('/api/student/enrolled-courses', { credentials: 'include' });
        if (res.ok) setEnrolled(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [router]);

  const filtered = useMemo(() => {
    let list = enrolled;
    if (filter === 'in_progress') list = list.filter((e) => e.progressPercent > 0 && e.progressPercent < 100);
    if (filter === 'completed') list = list.filter((e) => e.progressPercent >= 100);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.course.title.toLowerCase().includes(q) ||
          (e.course.description?.toLowerCase().includes(q) ?? false)
      );
    }
    return list;
  }, [enrolled, filter, search]);

  const estimateTimeLeft = (item: EnrolledItem) => {
    const remaining = item.lessonCount - item.completedCount;
    if (remaining <= 0) return tr('myCoursesCompleteLabel');
    if (remaining === 1) return tr('myCoursesOneLessonLeft');
    return tr('myCoursesLessonsLeft').replace(/\{count\}/g, String(remaining));
  };

  return (
    <div className="isit-cosmic-bg relative flex min-h-screen font-sans ">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-white dark:bg-slate-950/95">
          <div className="px-4 py-3 sm:px-6 md:px-8">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
              <Link href="/dashboard" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
                {tr('dashboard')}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              <span className="font-medium text-slate-700 dark:text-slate-200">{tr('myCourses')}</span>
            </nav>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8">
        {/* Search */}
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={tr('catalogSearchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{tr('myCourses')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tr('myCoursesTrackProgress')}</p>
        </div>

        <LegacyMarketplaceBanner />

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'in_progress', 'completed'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filter === f
                  ? 'bg-sky-500 text-white'
                  : 'bg-white text-slate-600 dark:text-slate-300 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? tr('myCoursesFilterAll') : f === 'in_progress' ? tr('myCoursesFilterInProgress') : tr('myCoursesFilterCompleted')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            {tr('myCoursesLoading')}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-600 dark:text-slate-300" />
            <h2 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
              {enrolled.length === 0 ? tr('myCoursesEmptyEnrolled') : tr('myCoursesEmptyFiltered')}
            </h2>
            <p className="mx-auto mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              {enrolled.length === 0 ? tr('myCoursesEmptyEnrolledLead') : tr('myCoursesEmptyFilteredLead')}
            </p>
            {enrolled.length === 0 && (
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/subjects"
                  className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 no-underline"
                >
                  {tr('myCoursesStartFirstSession')} <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/courses"
                  className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 no-underline"
                >
                  {tr('browseAll')}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => {
              const instructor =
                typeof item.course.teacherId === 'object' && item.course.teacherId?.name
                  ? item.course.teacherId.name.toUpperCase()
                  : tr('instructorFallback').toUpperCase();
              return (
                <div
                  key={item.course._id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow hover:border-slate-300 transition"
                >
                  <Link href={`/course/${item.course._id}`} className="block">
                    <div className="aspect-video bg-slate-100 relative">
                      {item.course.image ? (
                        <Image
                          src={item.course.image}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-slate-600 dark:text-slate-300" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">{instructor}</p>
                    <Link href={`/course/${item.course._id}`} className="no-underline">
                      <h3 className="font-bold text-slate-800 mt-0.5 hover:text-sky-600">{item.course.title}</h3>
                    </Link>
                    <p className="mt-0.5 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
                      {item.course.description || tr('continueLearning')}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {tr('myCoursesPercentComplete').replace(/\{percent\}/g, String(item.progressPercent))}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{estimateTimeLeft(item)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-sky-500 rounded-full transition-all"
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                    {item.progressPercent >= 100 ? (
                      <div className="mt-4 flex flex-col gap-2">
                        <Link
                          href={`/certificate/${item.course._id}`}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-slate-900 dark:text-white transition hover:bg-amber-600"
                        >
                          {tr('myCoursesViewCertificate')}
                        </Link>
                        <Link
                          href={`/course/${item.course._id}`}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          {tr('myCoursesReviewCourse')}
                        </Link>
                      </div>
                    ) : (
                      <Link
                        href={item.nextLessonId ? `/lesson/${item.nextLessonId}` : `/course/${item.course._id}`}
                        className="mt-4 flex items-center justify-center gap-2 w-full bg-sky-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-sky-600 transition"
                      >
                        {tr('myCoursesContinueCourse')} <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8">
          <Link href="/courses" className="text-sm font-medium text-sky-600 hover:underline dark:text-sky-400">
            {tr('myCoursesBrowseAllLink')}
          </Link>
        </div>
      </main>
      </div>
    </div>
  );
}
