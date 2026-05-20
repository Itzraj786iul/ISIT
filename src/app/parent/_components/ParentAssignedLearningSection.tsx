'use client';

import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { assignmentStatusLabelForStudent } from '@/lib/assignment-status-ui';

export type ParentAssignedTopicInsight = {
  topic_id: string;
  topic_name: string;
  subject_name: string;
  status: string;
  mastery_score: number | null;
  started_at: string | null;
  completed_at: string | null;
};

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

export default function ParentAssignedLearningSection({
  title = 'Assigned learning',
  topics,
  variant,
  linkedAccount,
}: {
  title?: string;
  topics: ParentAssignedTopicInsight[];
  variant: 'compact' | 'detailed';
  linkedAccount: boolean;
}) {
  if (!linkedAccount) {
    return (
      <div className="isit-app-stat-card rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold text-sm mb-2">
          <GraduationCap className="w-4 h-4 text-violet-600" />
          {title}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Teacher assignments will show here once your child signs in with the linked email.
        </p>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="isit-app-stat-card rounded-2xl p-5 sm:p-6 shadow-sm dark:bg-slate-900 dark:border-slate-700">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold text-sm mb-2">
          <GraduationCap className="w-4 h-4 text-violet-600" />
          {title}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">No topics assigned by teacher yet.</p>
      </div>
    );
  }

  return (
    <div className="isit-app-stat-card rounded-2xl p-5 sm:p-6 shadow-sm dark:bg-slate-900 dark:border-slate-700">
      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold text-sm mb-4">
        <GraduationCap className="w-4 h-4 text-violet-600" />
        {title}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Topics your child&apos;s teacher assigned—progress updates when they learn on the platform.
      </p>
      <ul className="space-y-4">
        {topics.map((t) => (
          <li
            key={t.topic_id}
            className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                  {t.subject_name}
                </p>
                <Link
                  href={`/topic/${t.topic_id}`}
                  className="font-semibold text-slate-900 dark:text-slate-100 hover:text-violet-600 no-underline mt-0.5 block truncate"
                >
                  {t.topic_name}
                </Link>
              </div>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 shrink-0 ${statusPillClass(t.status)}`}
              >
                {assignmentStatusLabelForStudent(t.status)}
              </span>
            </div>
            {variant === 'compact' ? (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {t.mastery_score != null ? `Mastery ${t.mastery_score}%` : 'Mastery —'}
              </p>
            ) : (
              <dl className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-slate-500 dark:text-slate-400">Mastery</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                    {t.mastery_score != null ? `${t.mastery_score}%` : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 dark:text-slate-400">Started</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">{fmtDate(t.started_at)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 dark:text-slate-400">Completed</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">{fmtDate(t.completed_at)}</dd>
                </div>
              </dl>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
