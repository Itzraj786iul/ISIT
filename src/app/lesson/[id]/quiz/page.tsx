'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

type Question = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
};

const MOCK_QUESTIONS: Question[] = [
  { id: '1', question: 'What is the main purpose of this lesson?', options: ['To introduce key concepts', 'To summarize only', 'To replace the video', 'None of the above'], correctIndex: 0 },
  { id: '2', question: 'Which of the following best describes a quiz?', options: ['A short assessment', 'A long essay', 'A video', 'A discussion'], correctIndex: 0 },
  { id: '3', question: 'How many questions are in this sample quiz?', options: ['One', 'Two', 'Three', 'Four'], correctIndex: 2 },
];

export default function LessonQuizPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;
  const [lessonTitle, setLessonTitle] = useState<string>('Lesson Quiz');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await fetch(`/api/lesson/${lessonId}`);
        if (res.ok) {
          const data = await res.json();
          setLessonTitle(data.title || 'Lesson Quiz');
        }
      } catch {
        // keep default title
      }
    };
    fetchLesson();
  }, [lessonId]);

  const handleSubmit = () => {
    let correct = 0;
    MOCK_QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  const passed = score !== null && score >= Math.ceil(MOCK_QUESTIONS.length * 0.6);
  const allAnswered = MOCK_QUESTIONS.every((q) => answers[q.id] !== undefined);

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
              {MOCK_QUESTIONS.map((q, qIndex) => (
                <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
                  <p className="font-semibold text-slate-800 mb-4">
                    {qIndex + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => (
                      <label
                        key={optIndex}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                          answers[q.id] === optIndex
                            ? 'border-sky-500 bg-sky-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[q.id] === optIndex}
                          onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: optIndex }))}
                          className="text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-slate-700">{opt}</span>
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
              You got <strong>{score}</strong> out of {MOCK_QUESTIONS.length} correct ({score != null ? Math.round((score / MOCK_QUESTIONS.length) * 100) : 0}%).
            </p>
            <p className="text-slate-500 text-sm mb-6">
              {passed ? 'Great job! You can continue to the next lesson.' : 'Review the lesson and try again when ready.'}
            </p>
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
