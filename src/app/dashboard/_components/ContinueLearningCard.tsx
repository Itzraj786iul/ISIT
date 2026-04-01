'use client';

import Link from 'next/link';
import { Play, Sparkles } from 'lucide-react';
import { useT } from '@/lib/t';
import type { LastSessionPayload } from './dashboard-types';

type Props = {
  loading: boolean;
  lastSession: LastSessionPayload | null;
  lastTopicName: string | null;
  lastTopicProgress: number | null;
};

export function ContinueLearningCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm animate-pulse dark:bg-slate-900 dark:border-slate-700">
      <div className="h-4 bg-slate-100 rounded w-32 mb-4 dark:bg-slate-800" />
      <div className="h-6 bg-slate-100 rounded w-2/3 mb-3 dark:bg-slate-800" />
      <div className="h-2 bg-slate-100 rounded-full w-full mb-2 dark:bg-slate-800" />
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <div className="h-11 bg-slate-100 rounded-xl w-full sm:w-36 dark:bg-slate-800" />
        <div className="h-11 bg-slate-100 rounded-xl w-full sm:w-28 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export default function ContinueLearningCard({ loading, lastSession, lastTopicName, lastTopicProgress }: Props) {
  const tr = useT();

  if (loading) {
    return <ContinueLearningCardSkeleton />;
  }

  if (!lastSession) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm text-center dark:bg-slate-900 dark:border-slate-700">
        <Sparkles className="w-10 h-10 text-violet-400 mx-auto mb-2" />
        <p className="text-slate-700 font-medium text-sm sm:text-base dark:text-slate-200">Start your next learning session</p>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 dark:text-slate-400">Pick a subject and topic to build mastery.</p>
        <Link
          href="/subjects"
          className="inline-flex items-center justify-center gap-2 mt-4 w-full sm:w-auto min-h-[44px] px-5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition no-underline active:scale-[0.98] motion-safe-transition"
        >
          {tr('browseSubjects')}
        </Link>
      </div>
    );
  }

  const progress = lastTopicProgress ?? 0;
  const mastered = progress >= 80;

  return (
    <div className="bg-gradient-to-br from-white to-sky-50/80 rounded-2xl border border-sky-100 p-4 sm:p-6 shadow-sm ring-1 ring-sky-100/60 dark:from-slate-900 dark:to-slate-900 dark:border-sky-900/50 dark:ring-sky-900/30">
      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 break-words">{lastTopicName ?? 'Your topic'}</h3>
      <p className="text-xs sm:text-sm text-slate-500 mt-1 dark:text-slate-400">Pick up where you left off in your topic → session path.</p>

      <div className="mt-4">
        {mastered ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-600 text-sm sm:text-base font-medium">
            Strong mastery — keep practicing or explore the next topic.
          </span>
        ) : (
          <>
            <div className="flex justify-between text-xs sm:text-sm text-slate-500 mb-1 dark:text-slate-400">
              <span>Mastery</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
              <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all" style={{ width: `${Math.min(100, progress)}%` }} />
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-5">
        <Link
          href={`/topic/${lastSession.topic_id}`}
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition no-underline shadow-sm active:scale-[0.98] motion-safe-transition"
        >
          <Play className="w-4 h-4 shrink-0" />
          {tr('resumeLearning')}
        </Link>
        {lastSession.session_id ? (
          <Link
            href={`/session/${lastSession.session_id}`}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-5 bg-white border border-slate-200 text-slate-800 font-semibold rounded-xl hover:bg-slate-50 transition no-underline dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700 active:scale-[0.98] motion-safe-transition"
          >
            Open session
          </Link>
        ) : null}
      </div>
    </div>
  );
}
