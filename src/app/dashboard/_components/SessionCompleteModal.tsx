'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { X, Clock, HelpCircle, Target, Sparkles } from 'lucide-react';
import type { LastSessionCompleteStats } from '@/lib/session-complete-storage';
import { formatSessionDuration, clearSessionCompleteStats } from '@/lib/session-complete-storage';
import type { RecommendationItem, WeakAreaItem } from './dashboard-types';

const AUTO_CLOSE_MS = 6500;

type Props = {
  open: boolean;
  stats: LastSessionCompleteStats | null;
  loadingDashboard: boolean;
  recommendationItems: RecommendationItem[];
  weakAreaItems: WeakAreaItem[];
  onClose: () => void;
};

export default function SessionCompleteModal({
  open,
  stats,
  loadingDashboard,
  recommendationItems,
  weakAreaItems,
  onClose,
}: Props) {
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    clearSessionCompleteStats();
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    closeTimerRef.current = setTimeout(handleClose, AUTO_CLOSE_MS);
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [open, handleClose]);

  if (!open || !stats) return null;

  const accuracyPct =
    stats.questionsAnswered > 0
      ? Math.round((stats.questionsCorrect / stats.questionsAnswered) * 100)
      : null;

  const continueItem = recommendationItems.find((i) => i.topicId);
  const continueHref = continueItem?.topicId ? `/topic/${continueItem.topicId}` : '/subjects';
  const continueLabel = continueItem ? `Next: ${continueItem.name}` : 'Browse subjects';

  const firstWeak = weakAreaItems[0];
  const weakHref = firstWeak ? `/topic/${firstWeak.topicId}` : '/dashboard#dashboard-weak-areas';
  const weakLabel = firstWeak ? `Practice: ${firstWeak.name}` : 'View weak areas below';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-complete-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm motion-safe-transition"
        aria-label="Close"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-emerald-200/80 bg-white shadow-2xl shadow-emerald-900/10 overflow-hidden motion-safe-transition">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 z-10"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-600 px-6 pt-8 pb-6 text-white text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur mb-3">
            <Sparkles className="w-8 h-8 text-white" aria-hidden />
          </div>
          <h2 id="session-complete-title" className="text-2xl sm:text-3xl font-bold tracking-tight">
            Great job! 🎉
          </h2>
          {stats.topicName && (
            <p className="text-sm text-white/90 mt-2 font-medium line-clamp-2">{stats.topicName}</p>
          )}
        </div>

        <div className="px-6 py-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-3 text-center">
              <Clock className="w-5 h-5 text-sky-600 mx-auto mb-1" aria-hidden />
              <div className="text-lg font-bold text-slate-900">{formatSessionDuration(stats.timeSpentSeconds)}</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Time spent</div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-3 text-center">
              <HelpCircle className="w-5 h-5 text-violet-600 mx-auto mb-1" aria-hidden />
              <div className="text-lg font-bold text-slate-900">{stats.questionsAnswered}</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Answered</div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-3 text-center">
              <Target className="w-5 h-5 text-emerald-600 mx-auto mb-1" aria-hidden />
              <div className="text-lg font-bold text-slate-900">{accuracyPct === null ? '—' : `${accuracyPct}%`}</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Accuracy</div>
            </div>
          </div>
          {stats.questionsAnswered > 0 && (
            <p className="text-xs text-slate-500 text-center">
              {stats.questionsCorrect} of {stats.questionsAnswered} correct
            </p>
          )}
        </div>

        <div className="px-6 pb-6 flex flex-col gap-2">
          <Link
            href={continueHref}
            onClick={handleClose}
            className="btn-primary w-full flex flex-col items-center py-3 text-base font-semibold no-underline shadow-md shadow-sky-500/20 text-center"
          >
            <span>Continue learning</span>
            <span className="text-xs font-normal opacity-90 mt-0.5 max-w-full truncate px-1">
              {loadingDashboard ? 'Loading…' : continueLabel}
            </span>
          </Link>
          <Link
            href={weakHref}
            onClick={handleClose}
            className="btn-secondary w-full flex flex-col items-center py-3 text-base font-semibold no-underline text-center"
          >
            <span>Practice weak areas</span>
            <span className="text-xs font-normal text-slate-500 mt-0.5 max-w-full truncate px-1">
              {loadingDashboard ? 'Loading…' : weakLabel}
            </span>
          </Link>
          <p className="text-center text-[11px] text-slate-400 pt-1">This message closes in a few seconds</p>
        </div>
      </div>
    </div>
  );
}
