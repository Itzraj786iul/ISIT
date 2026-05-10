'use client';

import { X, Clock } from 'lucide-react';

type SessionHeaderProps = {
  topicName: string;
  timerLabel: string;
  onExit: () => void;
  exiting?: boolean;
  /** 1-based current question index and total (hidden when null). */
  progress?: { current: number; total: number } | null;
  /** Optional badge, e.g. adaptive difficulty from tutor context. */
  difficultyLabel?: string | null;
  /** Teacher-assigned topic session. */
  teacherAssigned?: boolean;
};

export default function SessionHeader({
  topicName,
  timerLabel,
  onExit,
  exiting,
  progress,
  difficultyLabel,
  teacherAssigned,
}: SessionHeaderProps) {
  const progressPct =
    progress && progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : null;

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-200/90 bg-white/95 backdrop-blur-sm shadow-sm shrink-0 z-10">
      <div className="min-w-0 flex-1 basis-[min(100%,280px)]">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Topic</p>
          {teacherAssigned ? (
            <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200/80">
              Teacher Assigned Session
            </span>
          ) : null}
          {difficultyLabel ? (
            <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
              {difficultyLabel}
            </span>
          ) : null}
        </div>
        <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate leading-tight">{topicName || 'Learning session'}</h1>
        {progress && progress.total > 0 ? (
          <div className="mt-2 flex items-center gap-2 max-w-md">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-500 tabular-nums shrink-0">
              {progress.current}/{progress.total}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
          <Clock className="w-4 h-4 text-sky-600 shrink-0" aria-hidden />
          <div>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide leading-none">Session</p>
            <p className="font-mono text-lg font-bold text-sky-600 tabular-nums leading-tight">{timerLabel}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onExit}
          disabled={exiting}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 shadow-sm"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </header>
  );
}
