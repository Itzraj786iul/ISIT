'use client';

import Link from 'next/link';
import { Play, Sparkles } from 'lucide-react';
import type { LastSessionPayload } from './dashboard-types';

type Props = {
  loading: boolean;
  lastSession: LastSessionPayload | null;
  lastTopicName: string | null;
  lastTopicProgress: number | null;
};

export function ContinueLearningCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-pulse">
      <div className="h-4 bg-slate-100 rounded w-32 mb-4" />
      <div className="h-6 bg-slate-100 rounded w-2/3 mb-3" />
      <div className="h-2 bg-slate-100 rounded-full w-full mb-2" />
      <div className="flex gap-2 mt-4">
        <div className="h-10 bg-slate-100 rounded-lg w-36" />
        <div className="h-10 bg-slate-100 rounded-lg w-28" />
      </div>
    </div>
  );
}

export default function ContinueLearningCard({ loading, lastSession, lastTopicName, lastTopicProgress }: Props) {
  if (loading) {
    return <ContinueLearningCardSkeleton />;
  }

  if (!lastSession) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center">
        <Sparkles className="w-10 h-10 text-violet-400 mx-auto mb-2" />
        <p className="text-slate-700 font-medium">Start your next learning session</p>
        <p className="text-slate-500 text-sm mt-1">Pick a subject and topic to build mastery.</p>
        <Link
          href="/subjects"
          className="inline-flex items-center justify-center gap-2 mt-4 bg-sky-600 hover:bg-sky-700 text-white font-medium px-5 py-2.5 rounded-lg transition no-underline"
        >
          Browse subjects
        </Link>
      </div>
    );
  }

  const progress = lastTopicProgress ?? 0;
  const mastered = progress >= 80;

  return (
    <div className="bg-gradient-to-br from-white to-sky-50/80 rounded-xl border border-sky-100 p-6 shadow-sm ring-1 ring-sky-100/60">
      <h3 className="text-lg font-bold text-slate-900 truncate">{lastTopicName ?? 'Your topic'}</h3>
      <p className="text-xs text-slate-500 mt-0.5">Pick up where you left off in your topic → session path.</p>

      <div className="mt-4">
        {mastered ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
            Strong mastery — keep practicing or explore the next topic.
          </span>
        ) : (
          <>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Mastery</span>
              <span className="font-semibold text-slate-700">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all" style={{ width: `${Math.min(100, progress)}%` }} />
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mt-5">
        <Link
          href={`/topic/${lastSession.topic_id}`}
          className="inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-medium px-5 py-2.5 rounded-lg transition no-underline shadow-sm"
        >
          <Play className="w-4 h-4 shrink-0" />
          Resume learning
        </Link>
        {lastSession.session_id ? (
          <Link
            href={`/session/${lastSession.session_id}`}
            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-800 font-medium px-5 py-2.5 rounded-lg hover:bg-slate-50 transition no-underline"
          >
            Open session
          </Link>
        ) : null}
      </div>
    </div>
  );
}
