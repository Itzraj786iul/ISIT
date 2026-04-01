'use client';

import Link from 'next/link';
import { Target, ArrowRight } from 'lucide-react';
import { useT } from '@/lib/t';
import type { WeakAreaItem } from './dashboard-types';

export function WeakAreasSectionSkeleton() {
  return (
    <section id="dashboard-weak-areas">
      <div className="h-5 bg-slate-100 rounded w-40 mb-4 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse flex justify-between items-center">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-100 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded w-16" />
            </div>
            <div className="h-9 w-28 bg-slate-100 rounded-lg" />
          </div>
        ))}
      </div>
    </section>
  );
}

type Props = {
  loading: boolean;
  items: WeakAreaItem[];
};

export default function WeakAreasSection({ loading, items }: Props) {
  const tr = useT();

  if (loading) {
    return <WeakAreasSectionSkeleton />;
  }

  return (
    <section id="dashboard-weak-areas">
      <div className="flex items-center gap-2 mb-1">
        <Target className="w-5 h-5 text-rose-500 shrink-0" />
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">{tr('weakAreas')}</h2>
      </div>
      <p className="text-sm sm:text-base text-slate-500 mb-4 dark:text-slate-400 leading-relaxed">
        Topics with mastery under 50% — extra practice builds confidence.
      </p>
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-5 sm:p-8 text-center dark:bg-slate-900 dark:border-slate-700">
          <p className="text-slate-600 text-sm sm:text-base dark:text-slate-300">No weak spots detected yet. Keep learning — we will highlight topics that need work.</p>
          <Link
            href="/subjects"
            className="inline-flex items-center justify-center mt-4 min-h-[44px] px-4 rounded-xl text-sky-600 text-sm font-semibold hover:bg-sky-50 dark:hover:bg-sky-950/40 active:scale-[0.98] w-full sm:w-auto"
          >
            Explore topics
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <div
              key={item.topicId}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-rose-200 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 overflow-hidden dark:bg-slate-900 dark:border-slate-700"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base break-words dark:text-slate-100">{item.name}</h3>
                <p className="text-sm text-rose-600 font-medium mt-0.5">Score: {item.score}%</p>
              </div>
              <Link
                href={`/topic/${item.topicId}`}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 min-h-[44px] px-4 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition no-underline active:scale-[0.98] motion-safe-transition"
              >
                {tr('practiceNow')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
