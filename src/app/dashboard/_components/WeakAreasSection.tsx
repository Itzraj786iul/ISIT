'use client';

import Link from 'next/link';
import { Target, ArrowRight } from 'lucide-react';
import type { WeakAreaItem } from './dashboard-types';

export function WeakAreasSectionSkeleton() {
  return (
    <section id="dashboard-weak-areas">
      <div className="h-5 bg-slate-100 rounded w-40 mb-4 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2].map((i) => (
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
  if (loading) {
    return <WeakAreasSectionSkeleton />;
  }

  return (
    <section id="dashboard-weak-areas">
      <div className="flex items-center gap-2 mb-1">
        <Target className="w-5 h-5 text-rose-500" />
        <h2 className="text-lg font-bold text-slate-800">Weak areas</h2>
      </div>
      <p className="text-sm text-slate-500 mb-4">Topics with mastery under 50% — extra practice builds confidence.</p>
      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 border-dashed p-8 text-center">
          <p className="text-slate-600 text-sm">No weak spots detected yet. Keep learning — we will highlight topics that need work.</p>
          <Link href="/subjects" className="inline-block mt-3 text-sky-600 text-sm font-medium hover:underline">
            Explore topics
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item) => (
            <div
              key={item.topicId}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-rose-200 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{item.name}</h3>
                <p className="text-sm text-rose-600 font-medium mt-0.5">Score: {item.score}%</p>
              </div>
              <Link
                href={`/topic/${item.topicId}`}
                className="inline-flex items-center justify-center gap-2 shrink-0 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition no-underline"
              >
                Practice now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
