'use client';

/** Logged-in student/teacher subject list — links to /subject/[id] for learning. */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/LazySidebar';
import EmptyState from '@/components/EmptyState';
import ApiErrorState from '@/components/ApiErrorState';
import { fetchWithAuth } from '@/lib/api-client';
import { isLikelyNetworkError } from '@/lib/api-error-messages';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useT } from '@/lib/t';
import type { PublicSubject } from './types';

type User = { _id: string; name?: string; email?: string; role?: string; organization_id?: string };

type ErrState =
  | { kind: 'network' }
  | { kind: 'http'; status: number; detail?: string | null }
  | null;

type Props = {
  user: User;
};

export default function StudentSubjectsCatalog({ user }: Props) {
  const tr = useT();
  const router = useRouter();
  const [subjects, setSubjects] = useState<PublicSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<ErrState>(null);
  const [teacherScoped, setTeacherScoped] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setErr(null);
      try {
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
          { redirectOn401: true, returnUrl: '/learn/subjects' }
        );
        const json = (await res.json()) as { success?: boolean; data?: PublicSubject[]; error?: string };

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

    void fetchSubjects();
  }, [user, router]);

  return (
    <div className="isit-cosmic-bg relative flex min-h-screen overflow-x-hidden font-sans">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="isit-app-header shrink-0">
          <div className="px-4 py-3 sm:px-6 md:px-8">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
              <Link href="/dashboard" className="isit-app-breadcrumb-link font-medium">
                {tr('dashboard')}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              <span className="isit-app-breadcrumb-current font-medium">{tr('subjects')}</span>
            </nav>
          </div>
        </header>
        <main className="isit-app-main isit-app-main--with-nav-toggle">
          <div className="mx-auto max-w-6xl">
            <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{tr('subjects')}</h1>
            <p className={`text-sm text-slate-600 dark:text-slate-400 ${teacherScoped ? 'mb-2' : 'mb-8'}`}>
              {tr('learningFlowSubjectsLead')}
            </p>
            {teacherScoped && (
              <p className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200/90">
                Showing only subjects assigned to you in this organization.
              </p>
            )}

            {loading && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3" data-testid="subjects-loading">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="isit-app-panel min-h-[140px] animate-pulse rounded-2xl p-6 shadow-sm"
                    aria-hidden
                  >
                    <div className="mb-3 h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="mb-3 flex gap-2">
                      <div className="h-5 w-16 rounded bg-slate-100 dark:bg-slate-800" />
                      <div className="h-5 w-20 rounded bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <div className="mb-2 h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
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
                  title={tr('subjectsEmptyTitle')}
                  description={tr('subjectsEmptyDescription')}
                  primaryAction={{ label: tr('goToDashboard'), href: '/dashboard' }}
                  secondaryAction={{ label: tr('footerHowItWorksLink'), href: '/how-it-works' }}
                />
              </div>
            )}

            {!loading && !err && subjects.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {subjects.map((subject) => (
                  <Link
                    key={subject._id}
                    href={`/subject/${subject._id}`}
                    className="group block min-h-[44px] rounded-2xl isit-app-panel p-6 text-inherit no-underline shadow-sm transition hover:border-sky-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-lg font-semibold text-slate-900 group-hover:text-sky-700 dark:text-slate-100 dark:group-hover:text-sky-400">
                          {subject.name}
                        </h2>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {subject.grade}
                          </span>
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {subject.board}
                          </span>
                        </div>
                        {subject.description && (
                          <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">{subject.description}</p>
                        )}
                      </div>
                      <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-sky-500 dark:text-slate-300" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
