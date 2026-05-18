'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import TeacherShell from '../../_components/TeacherShell';
import { BarChart3, ChevronLeft } from 'lucide-react';
import type { AssignmentProgressPayload } from '@/lib/teacher-assignment-progress-types';
import { assignmentStatusLabelForStudent } from '@/lib/assignment-status-ui';

type User = { _id?: string; name: string; role: string; organization_id?: string };

function statusPillClass(status: string): string {
  if (status === 'completed') {
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 ring-emerald-200/80 dark:ring-emerald-800';
  }
  if (status === 'in_progress') {
    return 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200 ring-amber-200/80 dark:ring-amber-800';
  }
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ring-slate-200 dark:ring-slate-600';
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return '—';
  }
}

export default function TeacherAssignmentProgressPage() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.topic_id as string;

  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<AssignmentProgressPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!topicId) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      const userData = meData.user as User;
      const role = userData?.role?.toLowerCase();
      if (!userData || (role !== 'teacher' && role !== 'admin')) {
        router.push('/dashboard');
        return;
      }
      if (cancelled) return;
      setUser(userData);

      try {
        const res = await fetch(
          `/api/teacher/assignment-progress?topic_id=${encodeURIComponent(topicId)}`,
          { credentials: 'include' }
        );
        const json = (await res.json()) as { success?: boolean; data?: AssignmentProgressPayload; error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error ?? 'Failed to load progress');
          setData(null);
          return;
        }
        if (json.success && json.data) setData(json.data);
        else setError('Invalid response');
      } catch {
        if (!cancelled) {
          setError('Failed to load progress');
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [router, topicId]);

  return (
    <TeacherShell user={user}>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Link
            href="/teacher/assigned-topics"
            className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to assigned topics
          </Link>

          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6 text-violet-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{data?.subject_name ?? '…'}</p>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
                {loading ? 'Loading…' : data?.topic_name ?? 'Assignment progress'}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Per-student status from sessions and mastery (class + direct assignments).
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm dark:bg-red-950/40 dark:border-red-900 dark:text-red-200">
            {error}
          </div>
        ) : null}

        {!loading && data ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Not started
                </p>
                <p className="text-3xl font-bold text-slate-700 dark:text-slate-200 mt-1">{data.not_started}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">of {data.total_students} students</p>
              </div>
              <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/20 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200/90">
                  In progress
                </p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">{data.in_progress}</p>
                <p className="text-xs text-amber-800/80 dark:text-amber-200/70 mt-2">of {data.total_students} students</p>
              </div>
              <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/20 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200/90">
                  Completed
                </p>
                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">{data.completed}</p>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-200/70 mt-2">of {data.total_students} students</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Students</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-left text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Mastery</th>
                      <th className="px-4 py-3 font-semibold">Started</th>
                      <th className="px-4 py-3 font-semibold">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.students.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                          No students match this assignment yet (add class roster or direct assignees).
                        </td>
                      </tr>
                    ) : (
                      data.students.map((s) => (
                        <tr key={s.student_id} className="text-slate-800 dark:text-slate-200">
                          <td className="px-4 py-3 font-medium">{s.name}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${statusPillClass(s.status)}`}
                            >
                              {assignmentStatusLabelForStudent(s.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 tabular-nums">
                            {s.mastery_score != null ? `${s.mastery_score}%` : '—'}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {fmtDate(s.started_at)}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {fmtDate(s.completed_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
            <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
          </div>
        ) : null}
      </div>
    </TeacherShell>
  );
}
