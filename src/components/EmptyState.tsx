import type { ReactNode } from 'react';

type Props = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

/** Shared empty / zero-data pattern for dashboards and lists. */
export default function EmptyState({ icon, title, description, action, className = '' }: Props) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 sm:px-6 sm:py-10 text-center overflow-x-hidden ${className}`}
    >
      {icon && <div className="flex justify-center mb-3 text-slate-400">{icon}</div>}
      <p className="font-semibold text-slate-800">{title}</p>
      {description && <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
