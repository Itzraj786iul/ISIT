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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-slate-800">Your subjects</h2>
        <Link href="/subjects" className="text-sky-600 text-sm font-medium hover:underline inline-flex items-center gap-1">
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      {subjects.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {subjects.map((subject, i) => {
            const color = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
            return (
              <Link
                key={subject._id}
                href={`/subject/${subject._id}`}
                className={`group block bg-white rounded-xl border border-slate-200 p-5 shadow-sm ${color.hover} hover:shadow-md transition no-underline`}
              >
                <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center mb-3`}>
                  <BookOpen className={`w-5 h-5 ${color.icon}`} />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm group-hover:text-sky-700 truncate">{subject.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {subject.grade} · {subject.board}
                </p>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="w-10 h-10" />}
          title="No subjects yet"
          description="When your organization adds subjects, they will show up here. Open the full catalog to start your first session."
          action={
            <Link href="/subjects" className="btn-primary no-underline px-5 py-2.5">
              Browse all subjects
            </Link>
          }
        />
      )}
    </section>
  );
}
