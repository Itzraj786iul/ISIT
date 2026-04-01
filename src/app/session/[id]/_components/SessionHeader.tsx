'use client';

import { X } from 'lucide-react';

type SessionHeaderProps = {
  topicName: string;
  timerLabel: string;
  onExit: () => void;
  exiting?: boolean;
};

export default function SessionHeader({ topicName, timerLabel, onExit, exiting }: SessionHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-slate-200 bg-white shrink-0">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Topic</p>
        <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">{topicName || 'Learning session'}</h1>
      </div>
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="text-right">
          <p className="text-xs text-slate-500">Session time</p>
          <p className="font-mono text-lg font-semibold text-sky-600 tabular-nums">{timerLabel}</p>
        </div>
        <button
          type="button"
          onClick={onExit}
          disabled={exiting}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Exit
        </button>
      </div>
    </header>
  );
}
