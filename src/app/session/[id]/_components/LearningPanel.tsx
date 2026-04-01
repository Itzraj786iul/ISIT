'use client';

import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export type PlayerQuestion = {
  _id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
};

type LearningPanelProps = {
  loading: boolean;
  question: PlayerQuestion | null;
  questionIndex: number;
  totalQuestions: number;
  selectedIndex: number | null;
  revealed: boolean;
  isCorrect: boolean | null;
  onSelectOption: (index: number) => void;
};

export default function LearningPanel({
  loading,
  question,
  questionIndex,
  totalQuestions,
  selectedIndex,
  revealed,
  isCorrect,
  onSelectOption,
}: LearningPanelProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] bg-white rounded-xl border border-slate-200">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-3" />
        <p className="text-slate-600 text-sm">Loading questions…</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center">
        <p className="text-slate-700 font-medium">No practice questions for this topic yet.</p>
        <p className="text-slate-500 text-sm mt-2">Use the AI tutor on the right to keep learning.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[320px]">
      {totalQuestions > 0 && (
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <p className="text-xs font-medium text-slate-500">
            Question {questionIndex + 1} of {totalQuestions}
          </p>
        </div>
      )}
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        <p className="text-slate-900 text-base sm:text-lg font-medium leading-relaxed">{question.question_text}</p>
        <ul className="mt-6 space-y-2">
          {question.options.map((opt, idx) => {
            const selected = selectedIndex === idx;
            const isThisCorrect = opt === question.correct_answer;
            let ring = 'border-slate-200 hover:border-sky-300 hover:bg-sky-50/50';
            if (revealed) {
              if (isThisCorrect) ring = 'border-emerald-500 bg-emerald-50';
              else if (selected && !isThisCorrect) ring = 'border-rose-400 bg-rose-50';
              else ring = 'border-slate-100 opacity-70';
            } else if (selected) {
              ring = 'border-sky-500 bg-sky-50';
            }
            return (
              <li key={idx}>
                <button
                  type="button"
                  disabled={revealed}
                  onClick={() => onSelectOption(idx)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${ring} disabled:cursor-default`}
                >
                  <span className="text-slate-500 mr-2">{String.fromCharCode(65 + idx)}.</span>
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>

        {revealed && (
          <div
            className={`mt-6 flex items-start gap-3 p-4 rounded-lg ${
              isCorrect ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'
            }`}
          >
            {isCorrect ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <div>
              <p className="font-semibold text-sm">{isCorrect ? 'Correct' : 'Incorrect'}</p>
              {question.explanation ? (
                <p className="text-sm mt-1 opacity-90">{question.explanation}</p>
              ) : !isCorrect ? (
                <p className="text-sm mt-1 opacity-90">Correct answer: {question.correct_answer}</p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
