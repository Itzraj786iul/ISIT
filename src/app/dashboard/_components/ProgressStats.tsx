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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 animate-pulse dark:bg-slate-900 dark:border-slate-700">
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
      href: '/analytics',
    },
    {
      label: 'Mastery',
      value: `${Math.round(masteryPercent)}%`,
      sub: 'Average across your topics',
      icon: Percent,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      href: '/analytics',
    },
  ] as const;

  return (
    <section>
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mb-3 sm:mb-4 dark:text-slate-100">Progress overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="group block no-underline min-h-[44px] active:scale-[0.99] rounded-2xl">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm h-full hover:border-sky-200 hover:shadow-md transition flex flex-col dark:bg-slate-900 dark:border-slate-700">
              <div className="flex items-start justify-between gap-2">
                <div className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
                  <c.icon className={`w-5 h-5 ${c.iconColor}`} />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-sky-500 transition shrink-0" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-3 sm:mt-4 dark:text-slate-400">{c.label}</p>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5 dark:text-slate-100">{c.value}</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">{c.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
