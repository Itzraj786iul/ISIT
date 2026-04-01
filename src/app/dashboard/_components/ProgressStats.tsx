'use client';

import Link from 'next/link';
import { Clock, BookMarked, Percent, ChevronRight } from 'lucide-react';

function formatTime(minutes: number) {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function ProgressStatsSkeleton() {
  return (
    <section>
      <div className="h-5 bg-slate-100 rounded w-40 mb-4 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
            <div className="h-10 w-10 bg-slate-100 rounded-xl mb-3" />
            <div className="h-3 bg-slate-100 rounded w-24 mb-2" />
            <div className="h-8 bg-slate-100 rounded w-16" />
          </div>
        ))}
      </div>
    </section>
  );
}

type Props = {
  loading: boolean;
  timeMinutes: number;
  topicsCompleted: number;
  masteryPercent: number;
};

export default function ProgressStats({ loading, timeMinutes, topicsCompleted, masteryPercent }: Props) {
  if (loading) {
    return <ProgressStatsSkeleton />;
  }

  const cards = [
    {
      label: 'Time spent',
      value: formatTime(timeMinutes),
      sub: 'From your activity records',
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      href: '/analytics',
    },
    {
      label: 'Topics completed',
      value: String(topicsCompleted),
      sub: 'Counted in performance metrics',
      icon: BookMarked,
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
      href: '/progress',
    },
    {
      label: 'Mastery',
      value: `${Math.round(masteryPercent)}%`,
      sub: 'Average across your topics',
      icon: Percent,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      href: '/progress',
    },
  ] as const;

  return (
    <section>
      <h2 className="text-lg font-bold text-slate-800 mb-4">Progress overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="group block no-underline">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full hover:border-sky-200 hover:shadow-md transition flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
                  <c.icon className={`w-5 h-5 ${c.iconColor}`} />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-sky-500 transition shrink-0" />
              </div>
              <p className="text-xs font-medium text-slate-500 mt-4">{c.label}</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{c.value}</p>
              <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
