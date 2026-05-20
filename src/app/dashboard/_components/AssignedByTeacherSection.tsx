'use client';

import Link from 'next/link';
import { ChevronRight, GraduationCap } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import type { AssignedTopicListItem } from '@/lib/assigned-topic-types';
import { assignmentStatusLabelForStudent } from '@/lib/assignment-status-ui';

export default function AssignedByTeacherSection({
  loading,
  items,
}: {
  loading: boolean;
  items: AssignedTopicListItem[];
}) {
  if (loading) {
    return (
      <section>
        <div className="h-8 w-56 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-full max-w-lg bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="isit-app-panel h-28 rounded-2xl animate-pulse shadow-sm"
            />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mb-2 sm:mb-3 dark:text-slate-100 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-sky-600 shrink-0" />
          Assigned by your teacher
        </h2>
        <EmptyState
          icon={GraduationCap}
          title="No assigned topics yet"
          description="When your teacher assigns topics to your class, they will show up here. You can still explore subjects and start learning on your own."
          primaryAction={{ label: 'Explore subjects', href: '/subjects' }}
          secondaryAction={{ label: 'Start learning', href: '/dashboard' }}
        />
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mb-2 sm:mb-3 dark:text-slate-100 flex items-center gap-2">
        <GraduationCap className="w-6 h-6 text-sky-600 shrink-0" />
        Assigned by your teacher
      </h2>
      <p className="text-sm text-slate-600 mb-4 dark:text-slate-400">
        Work through these topics in the order that fits your class. Your teacher chose them for you.
      </p>
      <ul className="space-y-3">
        {items.map((row) => (
          <li key={row.assignment_id}>
            <Link
              href={`/topic/${row.topic_id}`}
              className="block no-underline rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 sm:p-5 shadow-sm hover:border-sky-300 hover:shadow-md transition dark:from-sky-950/30 dark:to-slate-900 dark:border-sky-900"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
                    {row.subject_name}
                    {row.source === 'class' ? ' · Class assignment' : null}
                  </p>
                  <h3 className="mt-1 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                    {row.topic_name}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <span className="inline-flex rounded-full bg-white/80 dark:bg-slate-800 px-2.5 py-0.5 font-medium ring-1 ring-slate-200 dark:ring-slate-600">
                      {assignmentStatusLabelForStudent(row.status)}
                    </span>
                    {row.due_date ? (
                      <span>Due {new Date(row.due_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    ) : null}
                    {row.mastery_score != null ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Mastery {row.mastery_score}%
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center justify-end sm:justify-center shrink-0">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 dark:text-sky-400">
                    Open <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
