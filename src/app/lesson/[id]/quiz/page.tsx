'use client';

/**
 * @legacy MARKETPLACE_LMS URL — quiz currently loads topic questions opportunistically.
 * Target: /topic/[id]/quiz or session-scoped quiz only (docs/AI_FIRST_MIGRATION.md).
 */
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';

type Question = {
  _id: string;
  question_text: string;
  options: { text: string; is_correct: boolean }[];
  explanation?: string;
};

export default function LessonQuizPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;
  const [lessonTitle, setLessonTitle] = useState<string>('Lesson Quiz');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [lessonRes, meRes] = await Promise.all([
          fetch(`/api/lesson/${lessonId}`),
          fetch('/api/auth/me', { credentials: 'include' }),
        ]);

        if (lessonRes.ok) {
          const data = await lessonRes.json();
          setLessonTitle(data.title || 'Lesson Quiz');
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
              setQuestions(qJson.data.slice(0, 5));
              return;
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
  }, [lessonId]);

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q) => {
      const selected = answers[q._id];
      if (selected !== undefined && q.options[selected]?.is_correct) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  const passed = score !== null && questions.length > 0 && score >= Math.ceil(questions.length * 0.6);
  const allAnswered = questions.every((q) => answers[q._id] !== undefined);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading quiz...</span>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Link href={`/lesson/${lessonId}`} className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-medium mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to lesson
          </Link>
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-600 font-medium">No quiz questions available for this lesson yet.</p>
            <Link href={`/lesson/${lessonId}`} className="mt-4 inline-block text-sky-600 hover:underline text-sm font-medium">
              Return to lesson
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link href={`/lesson/${lessonId}`} className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-medium mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to lesson
        </Link>

        <h1 className="text-2xl font-bold text-slate-800 mb-1">Quiz: {lessonTitle}</h1>
        <p className="text-slate-500 text-sm mb-8">Answer the questions below. You need 60% to pass.</p>

        {!submitted ? (
          <>
            <div className="space-y-8">
              {questions.map((q, qIndex) => (
                <div key={q._id} className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
                  <p className="font-semibold text-slate-800 mb-4">
                    {qIndex + 1}. {q.question_text}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => (
                      <label
                        key={optIndex}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                          answers[q._id] === optIndex
                            ? 'border-sky-500 bg-sky-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q._id}
                          checked={answers[q._id] === optIndex}
                          onChange={() => setAnswers((prev) => ({ ...prev, [q._id]: optIndex }))}
                          className="text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-slate-700">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="px-6 py-3 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Submit quiz
              </button>
              <Link href={`/lesson/${lessonId}`} className="px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition">
                Cancel
              </Link>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center">
            {passed ? (
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            )}
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {passed ? 'Quiz passed!' : 'Keep learning'}
            </h2>
            <p className="text-slate-600 mb-2">
              You got <strong>{score}</strong> out of {questions.length} correct ({score != null ? Math.round((score / questions.length) * 100) : 0}%).
            </p>
            <p className="text-slate-500 text-sm mb-6">
              {passed ? 'Great job! You can continue to the next lesson.' : 'Review the lesson and try again when ready.'}
            </p>

            {submitted && (
              <div className="text-left space-y-4 mb-6">
                {questions.map((q, idx) => {
                  const selected = answers[q._id];
                  const isCorrect = selected !== undefined && q.options[selected]?.is_correct;
                  const correctIdx = q.options.findIndex((o) => o.is_correct);
                  return (
                    <div key={q._id} className={`p-4 rounded-lg border ${isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                      <p className="font-medium text-slate-800 text-sm">{idx + 1}. {q.question_text}</p>
                      <p className="text-xs mt-1">
                        Your answer: <strong className={isCorrect ? 'text-emerald-700' : 'text-red-700'}>{q.options[selected]?.text}</strong>
                        {!isCorrect && correctIdx >= 0 && (
                          <span className="text-emerald-700"> | Correct: <strong>{q.options[correctIdx].text}</strong></span>
                        )}
                      </p>
                      {q.explanation && <p className="text-xs text-slate-600 mt-1">{q.explanation}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3">
              <Link href={`/lesson/${lessonId}`} className="px-5 py-2.5 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600 transition">
                Back to lesson
              </Link>
              {!passed && (
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setScore(null); setAnswers({}); }}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition"
                >
                  Retry quiz
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
