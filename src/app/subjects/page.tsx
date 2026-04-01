'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { BookOpen, ChevronRight, AlertCircle } from 'lucide-react';

type Subject = {
  _id: string;
  name: string;
  grade: string;
  board: string;
  description?: string;
  [key: string]: unknown;
};

type User = { _id: string; name?: string; email?: string; role?: string; organization_id?: string };

export default function SubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (!meRes.ok) {
          router.push('/login');
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
          setError('Failed to load subjects.');
          setLoading(false);
          return;
        }

        const res = await fetch(
          `/api/subjects?organizationId=${encodeURIComponent(organizationId)}`,
          { credentials: 'include' }
        );
        const json = (await res.json()) as { success?: boolean; data?: Subject[]; error?: string };

        if (!res.ok || !json.success) {
          setError(json.error ?? 'Failed to load subjects.');
          setSubjects([]);
          setLoading(false);
          return;
        }

        setSubjects(Array.isArray(json.data) ? json.data : []);
      } catch {
        setError('Failed to load subjects.');
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-auto">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sky-600 text-sm font-medium hover:underline mb-4"
          >
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Subjects</h1>
          <p className="text-slate-600 text-sm mb-8">
            Choose a subject to explore topics and start learning.
          </p>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" data-testid="subjects-loading">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"
                  aria-hidden
                >
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-3" />
                  <div className="flex gap-2 mb-3">
                    <div className="h-5 bg-slate-100 rounded w-16" />
                    <div className="h-5 bg-slate-100 rounded w-20" />
                  </div>
                  <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div
              className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl border border-slate-200"
              role="alert"
            >
              <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
              <p className="text-slate-800 font-medium">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 text-sky-600 font-medium hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && subjects.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl border border-slate-200"
              data-testid="subjects-empty"
            >
              <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-600 font-medium">No subjects available yet.</p>
              <p className="text-slate-500 text-sm mt-1">
                Subjects will appear here when they are added to your organization.
              </p>
            </div>
          )}

          {!loading && !error && subjects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {subjects.map((subject) => (
                <Link
                  key={subject._id}
                  href={`/subject/${subject._id}`}
                  className="group block bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-sky-300 hover:shadow-md transition no-underline text-inherit"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-semibold text-slate-900 truncate group-hover:text-sky-700">
                        {subject.name}
                      </h2>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                          {subject.grade}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                          {subject.board}
                        </span>
                      </div>
                      {subject.description && (
                        <p className="mt-3 text-slate-600 text-sm line-clamp-3">
                          {subject.description}
                        </p>
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
