'use client';

import Link from 'next/link';
import { Lightbulb, ArrowRight } from 'lucide-react';
import type { RecommendationItem } from './dashboard-types';

function difficultyStyles(d: RecommendationItem['difficulty']) {
  switch (d) {
    case 'Easy':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    case 'Hard':
      return 'bg-rose-50 text-rose-700 ring-rose-100';
    default:
      return 'bg-amber-50 text-amber-800 ring-amber-100';
  }
}

export function RecommendationsSectionSkeleton() {
  return (
    <section>
      <div className="h-5 bg-slate-100 rounded w-48 mb-4 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-3/4 mb-3" />
            <div className="h-5 bg-slate-100 rounded w-20 mb-4" />
            <div className="h-9 bg-slate-100 rounded-lg w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}

type Props = {
  loading: boolean;
  items: RecommendationItem[];
};

export default function RecommendationsSection({ loading, items }: Props) {
  if (loading) {
    return <RecommendationsSectionSkeleton />;
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-violet-500" />
        <h2 className="text-lg font-bold text-slate-800">Recommended for you</h2>
      </div>
      <p className="text-sm text-slate-500 -mt-2 mb-4">Topics that match your level and gaps — start when you are ready.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, idx) => {
          const href = item.topicId ? `/topic/${item.topicId}` : '/subjects';
          return (
            <div
              key={`${item.name}-${idx}`}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-violet-200 hover:shadow-md transition flex flex-col"
            >
              <h3 className="font-semibold text-slate-900 leading-snug">{item.name}</h3>
              <span className={`mt-2 inline-flex w-fit text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ${difficultyStyles(item.difficulty)}`}>
                {item.difficulty}
              </span>
              <div className="flex-1" />
              <Link
                href={href}
                className="mt-4 inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition no-underline"
              >
                Start
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
