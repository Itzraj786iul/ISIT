'use client';

import { ChevronRight, Flag } from 'lucide-react';

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
    <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4 border-t border-slate-200 bg-white shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600 mr-2">Confidence</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onConfidence(star)}
              className={`text-xl leading-none p-1 rounded transition ${
                confidence != null && star <= confidence ? 'text-amber-400 scale-110' : 'text-slate-300 hover:text-amber-200'
              }`}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 justify-end">
        {showNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onEndSession}
          disabled={ending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-rose-200 text-rose-700 text-sm font-medium hover:bg-rose-50 disabled:opacity-50"
        >
          <Flag className="w-4 h-4" />
          End session
        </button>
      </div>
    </footer>
  );
}
