'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  className?: string;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className = '',
}: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-14 px-4 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm ${className}`}
      role="status"
    >
      <Icon className="w-12 h-12 text-slate-600 dark:text-slate-300 dark:text-slate-600 mb-4" aria-hidden />
      <p className="text-slate-800 dark:text-slate-100 font-semibold text-base">{title}</p>
      {description ? (
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-md leading-relaxed">{description}</p>
      ) : null}
      <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full sm:w-auto sm:justify-center">
        {primaryAction ? (
          <Link href={primaryAction.href} className="btn-primary min-h-11 px-6 no-underline">
            {primaryAction.label}
          </Link>
        ) : null}
        {secondaryAction ? (
          <Link href={secondaryAction.href} className="btn-secondary min-h-11 px-6 no-underline">
            {secondaryAction.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
