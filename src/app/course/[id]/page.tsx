'use client';

/**
 * @legacy MARKETPLACE_LMS — Paid course detail + checkout handoff. AI path: /subject/[id] → /topic/[id].
 * Migration: docs/AI_FIRST_MIGRATION.md
 */
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ArrowRight, ChevronRight } from 'lucide-react';
import Footer from '@/components/Footer';
import PublicNav from '@/components/PublicNav';
import Sidebar from '@/components/Sidebar';
import LegacyMarketplaceBanner from '@/components/LegacyMarketplaceBanner';
import { useT } from '@/lib/t';

type Course = {
  _id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  level?: string;
  category?: string;
  lessons?: { _id: string; title?: string }[];
  createdAt?: string;
};

type EnrolledItem = {
  course: { _id: string };
  nextLessonId: string | null;
  nextLessonTitle: string | null;
  progressPercent: number;
};

export default function CourseDetailsPage() {
  const tr = useT();
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<EnrolledItem | null>(null);
  const [enrollmentCheckDone, setEnrollmentCheckDone] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [viewerResolved, setViewerResolved] = useState(false);
  const [useStudentChrome, setUseStudentChrome] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/course/${courseId}`);
        const data = await res.json();
        if (data.course) {
          setCourse({ ...data.course, lessons: data.lessons || [] });
        } else {
          setCourse(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;
    setEnrollmentCheckDone(false);
    setEnrollment(null);
    setViewerResolved(false);

    const checkEnrollment = async () => {
      try {
        const meRes = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' });
        setIsLoggedIn(meRes.ok);
        if (meRes.ok) {
          const meData = (await meRes.json()) as { user?: { role?: string } };
          const role = String(meData.user?.role || '').toLowerCase();
          setUseStudentChrome(role === 'student');
        } else {
          setUseStudentChrome(false);
        }
        if (!meRes.ok) {
          setEnrollment(null);
          setEnrollmentCheckDone(true);
          setViewerResolved(true);
          return;
        }
        const res = await fetch('/api/student/enrolled-courses', { credentials: 'include', cache: 'no-store' });
        if (!res.ok) {
          setEnrollment(null);
          setEnrollmentCheckDone(true);
          setViewerResolved(true);
          return;
        }
        const enrolled: EnrolledItem[] = await res.json();
        const found = enrolled.find((e) => e.course._id === courseId);
        setEnrollment(found ?? null);
      } catch {
        setEnrollment(null);
        setIsLoggedIn(false);
        setUseStudentChrome(false);
      } finally {
        setEnrollmentCheckDone(true);
        setViewerResolved(true);
      }
    };
    void checkEnrollment();
  }, [courseId]);

  if (loading || !viewerResolved) {
    return (
      <div className="isit-cosmic-bg flex min-h-screen items-center justify-center ">
        <p className="text-lg font-semibold text-slate-600 dark:text-cyan-200">{tr('courseLoading')}</p>
      </div>
    );
  }

  if (!course) {
    const notFoundBody = (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-lg font-semibold text-red-400">{tr('courseNotFound')}</p>
        <Link href="/courses" className="font-medium text-sky-400 hover:underline">
          {tr('catalogPageShortTitle')}
        </Link>
      </div>
    );
    if (useStudentChrome) {
      return (
        <div className="isit-cosmic-bg relative flex min-h-screen ">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="shrink-0 border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-white dark:bg-slate-950/95">
              <div className="px-4 py-3 sm:px-6">
                <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
                  <Link href="/dashboard" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
                    {tr('dashboard')}
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                  <Link href="/courses" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
                    {tr('catalogPageShortTitle')}
                  </Link>
                </nav>
              </div>
            </header>
            {notFoundBody}
          </div>
        </div>
      );
    }
    return (
      <div className="isit-cosmic-bg flex min-h-screen flex-col ">
        <PublicNav active="courses" />
        {notFoundBody}
        <Footer />
      </div>
    );
  }

  const handleEnroll = async () => {
    if (!course.lessons || course.lessons.length === 0) {
      alert(tr('catalogNoLessonsAlert'));
      return;
    }
    if (enrolling) return;
    setEnrolling(true);
    try {
      const meRes = await fetch(`/api/auth/me?t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store',
        headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' },
      });
      if (!meRes.ok) {
        const returnUrl = `/checkout?id=${course._id}`;
        window.location.href = `/login?returnUrl=${encodeURIComponent(returnUrl)}`;
        return;
      }
      router.push(`/checkout?id=${course._id}`);
    } finally {
      setEnrolling(false);
    }
  };

  const firstLessonId = course?.lessons?.[0]?._id;
  const continueHref = enrollment?.nextLessonId
    ? `/lesson/${enrollment.nextLessonId}`
    : firstLessonId
      ? `/lesson/${firstLessonId}`
      : null;

  const lessonCount = course.lessons?.length ?? 0;

  const breadcrumbNav = useStudentChrome ? (
    <header className="shrink-0 border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-white dark:bg-slate-950/95">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/dashboard" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
            {tr('dashboard')}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
          <Link href="/courses" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
            {tr('catalogPageShortTitle')}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
          <span className="max-w-[min(100%,12rem)] truncate font-medium text-slate-700 dark:text-slate-200 sm:max-w-md">
            {course.title}
          </span>
        </nav>
      </div>
    </header>
  ) : null;

  const mainSection = (
    <section className="bg-white py-12 dark:bg-white dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {useStudentChrome ? (
            <div className="mb-8">
              <LegacyMarketplaceBanner />
            </div>
          ) : null}

          <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-slate-100 md:text-5xl">{course.title}</h1>

          <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-slate-400">
            {course.level && (
              <span className="text-xs font-bold uppercase text-sky-600 dark:text-sky-400">{course.level}</span>
            )}
            {course.category && (
              <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {course.category}
              </span>
            )}
            <span className="flex items-center gap-1">
              <BookOpen size={16} />
              {tr('catalogLessonsCount').replace(/\{count\}/g, String(lessonCount))}
            </span>
          </div>

          {course.image && (
            <div className="mb-10 aspect-video overflow-hidden rounded-2xl bg-slate-200 shadow-lg">
              <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
            </div>
          )}

          <div className="space-y-6 leading-relaxed text-gray-700 dark:text-slate-300">
            <p>{course.description}</p>
          </div>

          {course.lessons && course.lessons.length > 0 && (
            <div className="mt-10">
              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-slate-100">
                {tr('courseContentHeading').replace(/\{count\}/g, String(lessonCount))}
              </h3>
              <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-slate-50 dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900/50">
                {course.lessons.map((lesson, idx) => (
                  <div key={lesson._id} className="flex items-center gap-3 px-5 py-3 text-sm text-slate-700 dark:text-slate-300">
                    <span className="w-6 text-right font-medium text-slate-400">{idx + 1}.</span>
                    <span>
                      {lesson.title || tr('courseLessonDefault').replace(/\{n\}/g, String(idx + 1))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900 lg:top-28">
            {enrollmentCheckDone && isLoggedIn && enrollment ? (
              <>
                <h2 className="mb-2 text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  {tr('courseYoureEnrolled')}
                </h2>
                <p className="mb-4 text-sm text-gray-500 dark:text-slate-400">
                  {enrollment.progressPercent > 0
                    ? tr('myCoursesPercentComplete').replace(/\{percent\}/g, String(enrollment.progressPercent))
                    : tr('courseStartWatchingLessons')}
                </p>
                {continueHref ? (
                  <Link
                    href={continueHref}
                    className="block w-full rounded-xl bg-emerald-500 py-4 text-center font-bold text-white shadow-lg transition hover:bg-emerald-600"
                  >
                    {enrollment.nextLessonId ? tr('continueLearning') : tr('courseGoToCourse')}
                  </Link>
                ) : (
                  <Link
                    href="/my-courses"
                    className="block w-full rounded-xl bg-emerald-500 py-4 text-center font-bold text-white shadow-lg transition hover:bg-emerald-600"
                  >
                    {tr('courseViewInMyCourses')}
                  </Link>
                )}
              </>
            ) : (
              <>
                <h2 className="mb-2 text-xs font-bold uppercase text-sky-500 dark:text-sky-400">
                  {tr('courseEnrollNowEyebrow')}
                </h2>
                <p className="mb-4 text-sm text-gray-500 dark:text-slate-400">{tr('courseEnrollLead')}</p>
                <div className="mb-6 text-4xl font-bold text-gray-900 dark:text-slate-100">
                  {course.price === 0 ? tr('catalogFreePrice') : `\u20B9${course.price}`}
                </div>
                <button
                  type="button"
                  onClick={() => void handleEnroll()}
                  disabled={enrolling}
                  className="w-full rounded-xl bg-sky-600 py-4 font-bold text-white shadow-lg transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {enrolling ? tr('courseChecking') : tr('startLearning')}
                </button>
              </>
            )}

            <div className="mt-6 space-y-2 text-sm text-gray-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-sky-600 dark:text-sky-400" />
                {tr('courseOnDemandLessons')}
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight size={16} className="text-sky-600 dark:text-sky-400" />
                {tr('courseLifetimeAccess')}
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight size={16} className="text-sky-600 dark:text-sky-400" />
                {tr('courseCertificateBlurb')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="isit-app-bg min-h-screen ">
      {useStudentChrome ? (
        <div className="relative flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            {breadcrumbNav}
            {mainSection}
            <Footer />
          </div>
        </div>
      ) : (
        <>
          <PublicNav active="courses" />
          {mainSection}
          <Footer />
        </>
      )}
    </div>
  );
}
