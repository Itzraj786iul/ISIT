'use client';

/** AI-first subject catalog — entry to /subject/[id] → /topic/[id]. See docs/AI_FIRST_MIGRATION.md */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import EmptyState from '@/components/EmptyState';
import ApiErrorState from '@/components/ApiErrorState';
import { fetchWithAuth } from '@/lib/api-client';
import { isLikelyNetworkError } from '@/lib/api-error-messages';
import { BookOpen, ChevronRight } from 'lucide-react';

type Subject = {
  _id: string;
  name: string;
  grade: string;
  board: string;
  description?: string;
  [key: string]: unknown;
};

type User = { _id: string; name?: string; email?: string; role?: string; organization_id?: string };

type ErrState =
  | { kind: 'network' }
  | { kind: 'http'; status: number; detail?: string | null }
  | null;

export default function SubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<ErrState>(null);
  const [teacherScoped, setTeacherScoped] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setErr(null);
      try {
        const meRes = await fetchWithAuth('/api/auth/me', { redirectOn401: true, returnUrl: '/subjects' });
        if (!meRes.ok) {
          if (meRes.status === 401) return;
          const meJson = (await meRes.json().catch(() => ({}))) as { error?: string; message?: string };
          const detail = meJson.error ?? meJson.message;
          setErr({ kind: 'http', status: meRes.status, detail });
          setLoading(false);
          return;
        }
        const meData = await meRes.json();
        const user = meData?.user as User | undefined;
        const organizationId =
          user?.organization_id ??
          (typeof process.env.NEXT_PUBLIC_ORGANIZATION_ID === 'string'
            ? process.env.NEXT_PUBLIC_ORGANIZATION_ID
            : null);

        if (!organizationId) {
          setErr({ kind: 'http', status: 400, detail: 'Your account is not linked to an organization yet.' });
          setLoading(false);
          return;
        }

        setTeacherScoped(user?.role?.toLowerCase() === 'teacher');

        const res = await fetchWithAuth(
          `/api/subjects?organizationId=${encodeURIComponent(organizationId)}`,
          { redirectOn401: true, returnUrl: '/subjects' }
        );
        const json = (await res.json()) as { success?: boolean; data?: Subject[]; error?: string };

        if (!res.ok || !json.success) {
          setErr({ kind: 'http', status: res.status, detail: json.error });
          setSubjects([]);
          setLoading(false);
          return;
        }

        setSubjects(Array.isArray(json.data) ? json.data : []);
      } catch (e: unknown) {
        setSubjects([]);
        setErr(isLikelyNetworkError(e) ? { kind: 'network' } : { kind: 'http', status: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [router]);

  return (
    <div className="isit-cosmic-bg min-h-screen flex font-sans text-cyan-50 overflow-x-hidden relative">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 min-h-11 text-sky-600 text-sm font-medium hover:underline mb-4 rounded-lg px-1 -ml-1"
          >
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Subjects</h1>
          <p className={`text-slate-600 dark:text-slate-400 text-sm ${teacherScoped ? 'mb-2' : 'mb-8'}`}>
            Choose a subject to explore topics and start learning.
          </p>
          {teacherScoped && (
            <p className="text-amber-800 dark:text-amber-200/90 text-sm mb-8 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl px-3 py-2">
              Showing only subjects assigned to you in this organization.
            </p>
          )}

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" data-testid="subjects-loading">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm animate-pulse min-h-[140px]"
                  aria-hidden
                >
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-3" />
                  <div className="flex gap-2 mb-3">
                    <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-16" />
                    <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-20" />
                  </div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full mb-2" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {!loading && err && (
            <ApiErrorState
              error={err.kind === 'network' ? new TypeError('Failed to fetch') : null}
              status={err.kind === 'http' ? err.status : undefined}
              serverMessage={err.kind === 'http' ? err.detail : null}
              onRetry={() => window.location.reload()}
            />
          )}

          {!loading && !err && subjects.length === 0 && (
            <div data-testid="subjects-empty">
              <EmptyState
                icon={BookOpen}
                title="No subjects yet"
                description="Subjects will show up when your organization adds them. If you are a student, ask your teacher or admin — or go to your dashboard to continue learning."
                primaryAction={{ label: 'Go to dashboard', href: '/dashboard' }}
                secondaryAction={{ label: 'Explore learning path', href: '/learning-path' }}
              />
            </div>
          )}

          {!loading && !err && subjects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {subjects.map((subject) => (
                <Link
                  key={subject._id}
                  href={`/subject/${subject._id}`}
                  className="group block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:border-sky-300 hover:shadow-md transition no-underline text-inherit min-h-[44px]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-sky-700 dark:group-hover:text-sky-400">
                        {subject.name}
                      </h2>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                          {subject.grade}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                          {subject.board}
                        </span>
                      </div>
                      {subject.description && (
                        <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm line-clamp-3">{subject.description}</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0 group-hover:text-sky-500 group-hover:translate-x-0.5 transition" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
