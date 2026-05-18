'use client';

import { ChevronRight, Flag, Sparkles } from 'lucide-react';

type BottomControlsProps = {
  canGoNext: boolean;
  showNext: boolean;
  onNext: () => void;
  confidence: number | null;
  onConfidence: (value: number) => void;
  onEndSession: () => void;
  ending: boolean;
};

export default function BottomControls({
  canGoNext,
  showNext,
  onNext,
  confidence,
  onConfidence,
  onEndSession,
  ending,
}: BottomControlsProps) {
  return (
    <footer className="shrink-0 border-t border-slate-200/90 bg-white/95 backdrop-blur-sm shadow-[0_-4px_24px_-8px_rgba(15,23,42,0.12)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4 max-w-[1920px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" aria-hidden />
            <span className="text-sm font-medium text-slate-700">How confident do you feel?</span>
          </div>
          <div className="flex gap-1" role="group" aria-label="Confidence 1 to 5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onConfidence(star)}
                className={`text-2xl leading-none p-1.5 rounded-lg transition-all duration-200 ${
                  confidence != null && star <= confidence
                    ? 'text-amber-400 scale-110 drop-shadow-sm'
                    : 'text-slate-600 dark:text-slate-200 hover:text-amber-200 hover:scale-105'
                }`}
                aria-label={`${star} of 5 stars`}
                aria-pressed={confidence != null && star <= confidence}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end">
          {showNext && (
            <button
              type="button"
              onClick={onNext}
              disabled={!canGoNext}
              title={!canGoNext ? 'Answer the question to continue' : undefined}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white text-sm font-semibold hover:from-slate-800 hover:to-slate-700 disabled:opacity-35 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400 shadow-md transition-all"
            >
              Next question
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onEndSession}
            disabled={ending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-rose-200 bg-rose-50/50 text-rose-800 text-sm font-semibold hover:bg-rose-100 hover:border-rose-300 disabled:opacity-50 transition-colors"
          >
            <Flag className="w-4 h-4" />
            End session
          </button>
        </div>
      </div>
    </footer>
  );
}
