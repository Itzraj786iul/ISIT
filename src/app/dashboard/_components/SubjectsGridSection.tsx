'use client';

import Link from 'next/link';
import { BookOpen, ChevronRight } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import type { SubjectItem } from './dashboard-types';

const SUBJECT_COLORS = [
  { bg: 'bg-sky-100', text: 'text-sky-700', hover: 'hover:border-sky-300', icon: 'text-sky-600' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', hover: 'hover:border-emerald-300', icon: 'text-emerald-600' },
  { bg: 'bg-violet-100', text: 'text-violet-700', hover: 'hover:border-violet-300', icon: 'text-violet-600' },
  { bg: 'bg-amber-100', text: 'text-amber-700', hover: 'hover:border-amber-300', icon: 'text-amber-600' },
  { bg: 'bg-rose-100', text: 'text-rose-700', hover: 'hover:border-rose-300', icon: 'text-rose-600' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', hover: 'hover:border-indigo-300', icon: 'text-indigo-600' },
];

export function SubjectsGridSkeleton() {
  return (
    <section>
      <div className="flex justify-between mb-3">
        <div className="h-5 bg-slate-100 rounded w-32 animate-pulse" />
        <div className="h-4 bg-slate-100 rounded w-16 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="isit-app-stat-card rounded-2xl p-4 sm:p-5 animate-pulse dark:bg-slate-900 dark:border-slate-700">
            <div className="h-10 w-10 bg-slate-100 rounded-xl mb-3" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
          </div>
        ))}
      </div>
    </section>
  );
}

type Props = {
  loading: boolean;
  subjects: SubjectItem[];
};

export default function SubjectsGridSection({ loading, subjects }: Props) {
  if (loading) {
    return <SubjectsGridSkeleton />;
  }

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4 min-w-0">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">Your subjects</h2>
        <Link
          href="/subjects"
          className="text-sky-600 text-sm sm:text-base font-semibold hover:underline inline-flex items-center gap-1 min-h-[44px] sm:min-h-0 rounded-xl px-1 -ml-1 sm:ml-0 active:scale-[0.98] w-fit"
        >
          View all <ChevronRight className="w-4 h-4 shrink-0" />
        </Link>
      </div>
      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {subjects.map((subject, i) => {
            const color = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
            return (
              <Link
                key={subject._id}
                href={`/subject/${subject._id}`}
                className={`group block isit-app-stat-card rounded-2xl p-4 sm:p-5 shadow-sm ${color.hover} hover:shadow-md transition no-underline min-h-[44px] active:scale-[0.99] overflow-hidden dark:bg-slate-900 dark:border-slate-700`}
              >
                <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center mb-3`}>
                  <BookOpen className={`w-5 h-5 ${color.icon}`} />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base group-hover:text-sky-700 dark:text-slate-100 dark:group-hover:text-sky-400 break-words">
                  {subject.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 dark:text-slate-400">
                  {subject.grade} · {subject.board}
                </p>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No subjects yet"
          description="When your organization adds subjects, they will show up here. Open the full catalog to explore topics and start a session."
          primaryAction={{ label: 'Explore subjects', href: '/subjects' }}
        />
      )}
    </section>
  );
}
