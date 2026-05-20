'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Loader2, ChevronDown, Sparkles } from 'lucide-react';

export type PlayerQuestion = {
  _id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
};

type LearningPanelProps = {
  loading: boolean;
  /** True briefly while advancing to the next question (UX polish). */
  advancing?: boolean;
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
  advancing,
  question,
  questionIndex,
  totalQuestions,
  selectedIndex,
  revealed,
  isCorrect,
  onSelectOption,
}: LearningPanelProps) {
  const [aiExplanationOpen, setAiExplanationOpen] = useState(true);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[min(360px,50vh)] isit-app-stat-card rounded-2xl/90 shadow-md">
        <Loader2 className="w-11 h-11 text-sky-500 animate-spin mb-3" />
        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">Loading questions…</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[min(360px,50vh)] bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center shadow-sm">
        <p className="text-slate-800 font-semibold">No practice questions for this topic yet.</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-sm">Use the AI Tutor to keep learning — ask for hints, explanations, or a quick test.</p>
      </div>
    );
  }

  const showAiBlock = revealed && (question.explanation || !isCorrect);

  return (
    <div className="relative isit-app-stat-card rounded-2xl/90 shadow-md overflow-hidden flex flex-col min-h-[min(360px,50vh)] transition-shadow duration-300 hover:shadow-lg">
      {advancing ? (
        <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-2xl">
          <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-2" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading next question…</p>
        </div>
      ) : null}

      {totalQuestions > 0 && (
        <div className="px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-sky-50/30">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 tracking-wide">
            Question <span className="text-sky-600 tabular-nums">{questionIndex + 1}</span>
            <span className="text-slate-400 mx-1">/</span>
            <span className="tabular-nums">{totalQuestions}</span>
          </p>
        </div>
      )}

      <div key={question._id} className="p-5 sm:p-7 flex-1 flex flex-col motion-safe:animate-session-question-in">
        <p className="text-slate-900 text-base sm:text-lg font-semibold leading-relaxed">{question.question_text}</p>

        <ul className="mt-6 space-y-2.5">
          {question.options.map((opt, idx) => {
            const selected = selectedIndex === idx;
            const isThisCorrect = opt === question.correct_answer;
            let ring =
              'border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 active:scale-[0.99] transition-all duration-200';
            if (revealed) {
              if (isThisCorrect) ring = 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200/80';
              else if (selected && !isThisCorrect) ring = 'border-rose-400 bg-rose-50 ring-2 ring-rose-200/80';
              else ring = 'border-slate-100 bg-slate-50/50 opacity-75';
            } else if (selected) {
              ring = 'border-sky-500 bg-sky-50 ring-2 ring-sky-200/80';
            }
            return (
              <li key={idx}>
                <button
                  type="button"
                  disabled={revealed}
                  onClick={() => onSelectOption(idx)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium ${ring} disabled:cursor-default disabled:active:scale-100`}
                >
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/80 border border-slate-200/80 text-slate-600 dark:text-slate-300 text-xs font-bold mr-3 align-middle">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>

        {revealed && (
          <div
            className={`mt-6 flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 ${
              isCorrect
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/90 border-rose-200 text-rose-950'
            }`}
          >
            {isCorrect ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" /> : <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />}
            <div className="min-w-0">
              <p className="font-bold text-sm">{isCorrect ? 'Correct' : 'Not quite'}</p>
              {!isCorrect && (
                <p className="text-sm mt-1.5 opacity-95">
                  <span className="font-medium">Correct answer:</span> {question.correct_answer}
                </p>
              )}
            </div>
          </div>
        )}

        {showAiBlock && (
          <div className="mt-5 rounded-xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-indigo-50/50 overflow-hidden transition-all duration-300">
            <button
              type="button"
              onClick={() => setAiExplanationOpen((o) => !o)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-violet-100/40 transition-colors"
              aria-expanded={aiExplanationOpen}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-violet-900">
                <Sparkles className="w-4 h-4 text-violet-500 shrink-0" />
                Explained by AI
              </span>
              <ChevronDown className={`w-4 h-4 text-violet-600 transition-transform duration-200 ${aiExplanationOpen ? 'rotate-180' : ''}`} />
            </button>
            {aiExplanationOpen && (
              <div className="px-4 pb-4 pt-0 text-sm text-violet-950/90 leading-relaxed border-t border-violet-100/80">
                {question.explanation ? (
                  <div className="pt-3 whitespace-pre-wrap">{question.explanation}</div>
                ) : (
                  <p className="pt-3 text-violet-800/90">Review the correct answer above, or ask the tutor for a deeper explanation.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
