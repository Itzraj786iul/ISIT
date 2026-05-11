'use client';

/**
 * @legacy MARKETPLACE_LMS URL — quiz currently loads topic questions opportunistically.
 * Target: /topic/[id]/quiz or session-scoped quiz only (docs/AI_FIRST_MIGRATION.md).
 */
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useT } from '@/lib/t';

/** Normalized for UI — API (`TopicQuestionBank`) uses `options: string[]` + `correct_answer`. */
type Question = {
  _id: string;
  question_text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
};

type QuestionApiRow = {
  _id?: string;
  question_text?: string;
  options?: unknown;
  correct_answer?: string;
  explanation?: string;
};

function normalizeQuestion(raw: QuestionApiRow): Question | null {
  const _id = String(raw._id ?? '');
  const question_text = String(raw.question_text ?? '').trim();
  const rawOpts = raw.options;
  const labels: string[] = [];
  if (Array.isArray(rawOpts)) {
    for (const o of rawOpts) {
      if (typeof o === 'string') labels.push(o);
      else if (o && typeof o === 'object' && 'text' in o) labels.push(String((o as { text: unknown }).text ?? ''));
    }
  }
  if (!_id || !question_text || labels.length === 0) return null;

  let correctAnswer = String(raw.correct_answer ?? '').trim();
  if (!correctAnswer && Array.isArray(rawOpts)) {
    const idx = rawOpts.findIndex(
      (o) => o && typeof o === 'object' && Boolean((o as { is_correct?: boolean }).is_correct)
    );
    if (idx >= 0 && labels[idx]) correctAnswer = labels[idx].trim();
  }

  return {
    _id,
    question_text,
    options: labels,
    correctAnswer,
    explanation: raw.explanation ? String(raw.explanation) : undefined,
  };
}

function answerIsCorrect(q: Question, selectedIndex: number): boolean {
  const picked = q.options[selectedIndex]?.trim() ?? '';
  const want = q.correctAnswer.trim();
  if (!picked || !want) return false;
  return picked === want || picked.toLowerCase() === want.toLowerCase();
}

export default function LessonQuizPage() {
  const tr = useT();
  const params = useParams();
  const lessonId = params.id as string;
  const [lessonTitle, setLessonTitle] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setLessonTitle(tr('lessonQuizDefaultTitle'));
      try {
        const [lessonRes, meRes] = await Promise.all([
          fetch(`/api/lesson/${lessonId}`),
          fetch('/api/auth/me', { credentials: 'include' }),
        ]);

        if (lessonRes.ok) {
          const data = await lessonRes.json();
          if (typeof data.title === 'string' && data.title.trim()) setLessonTitle(data.title);
        }

        if (!meRes.ok) return;
        const meData = await meRes.json();
        const orgId = meData.user?.organization_id;
        if (!orgId) return;

        const subjRes = await fetch(`/api/subjects?organizationId=${encodeURIComponent(orgId)}`);
        const subjJson = await subjRes.json();
        if (!subjJson.success || !Array.isArray(subjJson.data)) return;

        for (const subject of subjJson.data) {
          const topicsRes = await fetch(`/api/topics?subjectId=${encodeURIComponent(subject._id)}`);
          const topicsJson = await topicsRes.json();
          if (!topicsJson.success || !Array.isArray(topicsJson.data)) continue;

          for (const topic of topicsJson.data) {
            const qRes = await fetch(`/api/questions?topicId=${encodeURIComponent(topic._id)}`);
            const qJson = await qRes.json();
            if (qJson.success && Array.isArray(qJson.data) && qJson.data.length > 0) {
              const normalized = (qJson.data as QuestionApiRow[])
                .slice(0, 5)
                .map(normalizeQuestion)
                .filter((q): q is Question => q !== null);
              if (normalized.length > 0) {
                setQuestions(normalized);
                return;
              }
            }
          }
        }
      } catch (err) {
        console.error('Quiz load error:', err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [lessonId, tr]);

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q) => {
      const selected = answers[q._id];
      if (selected !== undefined && answerIsCorrect(q, selected)) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  const passed = score !== null && questions.length > 0 && score >= Math.ceil(questions.length * 0.6);
  const allAnswered = questions.every((q) => answers[q._id] !== undefined);

  if (loading) {
    return (
      <div className="isit-cosmic-bg min-h-screen text-cyan-50 flex items-center justify-center relative z-[1]">
        <div className="flex items-center gap-3 text-cyan-200/90">
          <Loader2 className="w-5 h-5 animate-spin text-cyan-400" aria-hidden />
          <span className="text-sm">{tr('lessonQuizLoading')}</span>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="isit-cosmic-bg min-h-screen text-cyan-50 p-4 sm:p-6 md:p-8 relative">
        <div className="max-w-2xl mx-auto relative z-[1]">
          <Link
            href={`/lesson/${lessonId}`}
            className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-100 text-sm font-medium mb-6 no-underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> {tr('lessonQuizBack')}
          </Link>
          <div className="isit-glass rounded-2xl p-8 text-center">
            <p className="font-medium text-cyan-100/90">{tr('lessonQuizEmptyTitle')}</p>
            <p className="mt-2 text-sm text-cyan-200/60">{tr('lessonQuizEmptyLead')}</p>
            <Link
              href={`/lesson/${lessonId}`}
              className="isit-btn-primary mt-6 inline-flex min-h-11 items-center justify-center px-6 text-sm no-underline"
            >
              {tr('lessonQuizReturn')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="isit-cosmic-bg min-h-screen text-cyan-50 p-4 sm:p-6 md:p-8 relative">
      <div className="max-w-2xl mx-auto relative z-[1]">
        <Link
          href={`/lesson/${lessonId}`}
          className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-100 text-sm font-medium mb-6 no-underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> {tr('lessonQuizBack')}
        </Link>

        <div className="mb-8">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-cyan-400/80">{tr('lessonQuizEyebrow')}</p>
          <h1 className="mb-1 text-2xl font-bold text-cyan-50">{lessonTitle}</h1>
          <p className="text-sm text-cyan-100/70">{tr('lessonQuizInstructions')}</p>
        </div>

        {!submitted ? (
          <>
            <div className="space-y-6">
              {questions.map((q, qIndex) => (
                <div key={q._id} className="isit-glass rounded-2xl p-5 sm:p-6">
                  <p className="font-semibold text-cyan-50 mb-4 leading-snug">
                    <span className="text-cyan-400/90 tabular-nums">{qIndex + 1}.</span> {q.question_text}
                  </p>
                  <div className="space-y-3">
                    {q.options.map((optionLabel, optIndex) => {
                      const selected = answers[q._id] === optIndex;
                      return (
                        <label
                          key={optIndex}
                          className={`flex w-full items-start gap-3 p-4 rounded-xl cursor-pointer transition motion-safe-transition border-2 ${
                            selected
                              ? 'border-cyan-400 bg-cyan-500/20 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)]'
                              : 'border-cyan-400/25 bg-[rgb(15,23,42)]/95 hover:border-cyan-300/50 hover:bg-[rgb(15,23,42)]'
                          }`}
                        >
                          <input
                            type="radio"
                            name={q._id}
                            checked={selected}
                            onChange={() => setAnswers((prev) => ({ ...prev, [q._id]: optIndex }))}
                            className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded-full border-2 border-cyan-300/80 bg-slate-950 accent-cyan-400 text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(15,23,42)]"
                          />
                          <span
                            className="flex-1 min-w-0 text-sm font-medium leading-relaxed text-pretty"
                            style={{ color: '#ecfeff' }}
                          >
                            {optionLabel}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="isit-btn-primary px-6 min-h-11 text-sm font-semibold disabled:opacity-45 disabled:cursor-not-allowed border-0"
              >
                {tr('lessonQuizSubmit')}
              </button>
              <Link
                href={`/lesson/${lessonId}`}
                className="isit-btn-secondary inline-flex min-h-11 items-center justify-center px-6 text-sm no-underline"
              >
                {tr('lessonQuizCancel')}
              </Link>
            </div>
          </>
        ) : (
          <div className="isit-glass rounded-2xl p-6 sm:p-8 text-center">
            {passed ? (
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" aria-hidden />
            ) : (
              <XCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" aria-hidden />
            )}
            <h2 className="mb-2 text-xl font-bold text-cyan-50">{passed ? tr('lessonQuizPassedTitle') : tr('lessonQuizRetryTitle')}</h2>
            <p className="mb-2 text-sm text-cyan-100/85">
              {tr('lessonQuizScoreSummary')
                .replace(/\{score\}/g, String(score ?? 0))
                .replace(/\{total\}/g, String(questions.length))
                .replace(
                  /\{percent\}/g,
                  String(score != null && questions.length > 0 ? Math.round((score / questions.length) * 100) : 0)
                )}
            </p>
            <p className="mb-6 text-sm text-cyan-200/65">{passed ? tr('lessonQuizPassedLead') : tr('lessonQuizFailedLead')}</p>

            {submitted && (
              <div className="text-left space-y-3 mb-6">
                {questions.map((q, idx) => {
                  const selected = answers[q._id];
                  const isCorrect = selected !== undefined && answerIsCorrect(q, selected);
                  const yourLabel = selected !== undefined ? q.options[selected] : '';
                  return (
                    <div
                      key={q._id}
                      className={`p-4 rounded-xl border text-sm ${
                        isCorrect
                          ? 'border-emerald-400/30 bg-emerald-500/10'
                          : 'border-red-400/25 bg-red-500/10'
                      }`}
                    >
                      <p className="font-medium text-cyan-50">
                        {idx + 1}. {q.question_text}
                      </p>
                      <p className="text-xs mt-2 text-cyan-100/80">
                        {tr('lessonQuizYourAnswer')}{' '}
                        <strong className={isCorrect ? 'text-emerald-300' : 'text-red-300'}>{yourLabel}</strong>
                        {!isCorrect && q.correctAnswer ? (
                          <span className="text-emerald-300">
                            {' '}
                            · {tr('lessonQuizCorrectLabel')} <strong>{q.correctAnswer}</strong>
                          </span>
                        ) : null}
                      </p>
                      {q.explanation ? <p className="text-xs text-cyan-200/70 mt-2">{q.explanation}</p> : null}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href={`/lesson/${lessonId}`}
                className="isit-btn-primary inline-flex min-h-11 items-center justify-center px-5 text-sm no-underline"
              >
                {tr('lessonQuizBack')}
              </Link>
              {!passed && (
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setScore(null);
                    setAnswers({});
                  }}
                  className="isit-btn-secondary min-h-11 cursor-pointer border-0 px-5 text-sm"
                >
                  {tr('lessonQuizRetryButton')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
