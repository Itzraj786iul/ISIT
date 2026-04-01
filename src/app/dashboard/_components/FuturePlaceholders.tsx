'use client';

import { Brain, Flame } from 'lucide-react';

export default function FuturePlaceholders() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start overflow-hidden dark:border-slate-700 dark:bg-slate-900/40">
        <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
          <Brain className="w-5 h-5 text-violet-600" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-800 text-base sm:text-lg dark:text-slate-100">AI insights</h3>
          <p className="text-sm sm:text-base text-slate-500 mt-1 dark:text-slate-400">Personalized summaries and next steps from your tutor will appear here.</p>
          <span className="inline-block mt-3 text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-1 rounded-full">Coming soon</span>
        </div>
      </div>
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start overflow-hidden dark:border-slate-700 dark:bg-slate-900/40">
        <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5 text-orange-600" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-800 text-base sm:text-lg dark:text-slate-100">Learning streak</h3>
          <p className="text-sm sm:text-base text-slate-500 mt-1 dark:text-slate-400">Track daily learning habits and streak rewards.</p>
          <span className="inline-block mt-3 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Coming soon</span>
        </div>
      </div>
    </div>
  );
}
