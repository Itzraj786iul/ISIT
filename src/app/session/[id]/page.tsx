'use client';

/**
 * AI-first session player — Subject → Topic → Session, with practice questions + AI tutor.
 * Session/events/tutor/end: internal `/api/*` or FastAPI via `session-api` + `NEXT_PUBLIC_USE_EXTERNAL_API`.
 */
import dynamic from 'next/dynamic';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Bot } from 'lucide-react';
import SessionHeader from './_components/SessionHeader';
import LearningPanel, { type PlayerQuestion } from './_components/LearningPanel';
import type { TutorTab } from './_components/AITutorPanel';
import BottomControls from './_components/BottomControls';

const AITutorPanel = dynamic(() => import('./_components/AITutorPanel'), {
  loading: () => <div className="animate-pulse h-44 bg-slate-100 rounded-xl border border-slate-200/80" aria-hidden />,
  ssr: false,
});
import { sendEvent } from '@/lib/send-session-event';
import { fetchWithAuth } from '@/lib/api-client';
import { writeSessionCompleteStats } from '@/lib/session-complete-storage';
import { fetchSessionById, postSessionEnd } from '@/lib/session-api';

type SessionPayload = {
  _id?: string;
  topic_id?: string | { toString(): string };
  completion_status?: string;
  topic_name?: string;
  session_mode?: string;
  session_source?: string;
};

const MOCK_QUESTIONS: PlayerQuestion[] = [
  {
    _id: 'mock-1',
    question_text: 'What is the main goal of active learning?',
    options: [
      'To passively watch videos only',
      'To engage deeply with ideas and practice',
      'To avoid asking questions',
      'To skip difficult topics',
    ],
    correct_answer: 'To engage deeply with ideas and practice',
    explanation: 'Active learning means doing, reflecting, and applying — not only consuming content.',
  },
  {
    _id: 'mock-2',
    question_text: 'When you are stuck, what is usually the best first step?',
    options: ['Give up immediately', 'Identify what you do not understand and ask a focused question', 'Skip to the next chapter', 'Memorize without understanding'],
    correct_answer: 'Identify what you do not understand and ask a focused question',
    explanation: 'Naming the gap helps you and your tutor target the real issue.',
  },
];

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function normalizeApiQuestion(raw: Record<string, unknown>, index: number): PlayerQuestion | null {
  const text = typeof raw.question_text === 'string' ? raw.question_text : null;
  if (!text) return null;
  const correct = typeof raw.correct_answer === 'string' ? raw.correct_answer : '';
  let options: string[] = Array.isArray(raw.options) ? raw.options.filter((o): o is string => typeof o === 'string') : [];
  if (options.length < 2 && correct) {
    const decoys = ['Not sure', 'None of the above', 'I need a hint', 'Skip this question'].filter((d) => d !== correct);
    options = [correct, ...decoys.slice(0, 3)];
    options = [...new Set(options)].slice(0, 4);
  }
  if (options.length < 2) return null;
  const id = typeof raw._id === 'string' ? raw._id : `q-${index}`;
  const explanation = typeof raw.explanation === 'string' ? raw.explanation : undefined;
  return { _id: id, question_text: text, options, correct_answer: correct || options[0], explanation };
}

export default function SessionPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<SessionPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  const [questions, setQuestions] = useState<PlayerQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [practiceComplete, setPracticeComplete] = useState(false);

  const [elapsedSec, setElapsedSec] = useState(0);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [ending, setEnding] = useState(false);
  const [advancingQuestion, setAdvancingQuestion] = useState(false);
  const [mobileTutorOpen, setMobileTutorOpen] = useState(false);
  const [tutorDifficultyLabel, setTutorDifficultyLabel] = useState<string | null>(null);

  const questionShownAtRef = useRef<number>(0);
  const sessionIdRef = useRef<string>('');
  const sessionStatsRef = useRef({ answered: 0, correct: 0 });

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    sessionStatsRef.current = { answered: 0, correct: 0 };
  }, [sessionId]);

  useEffect(() => {
    setTutorDifficultyLabel(null);
    setMobileTutorOpen(false);
  }, [sessionId]);

  useEffect(() => {
    const t = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    const run = async () => {
      setLoadingSession(true);
      setLoadError(null);
      setAccessDenied(false);
      try {
        const returnPath = `/session/${sessionId}`;
        const me = await fetchWithAuth('/api/auth/me', { returnUrl: returnPath });
        if (!me.ok) {
          if (me.status === 401) return;
          router.replace(`/login?returnUrl=${encodeURIComponent(returnPath)}`);
          return;
        }
        const returnUrl = `/session/${sessionId}`;
        const r = await fetchSessionById(sessionId, returnUrl);
        if (cancelled) return;
        if (r.kind === 'unauthorized') return;
        if (r.kind === 'forbidden') {
          setAccessDenied(true);
          setSession(null);
          return;
        }
        if (!r.ok || !r.session) {
          setLoadError(r.error ?? 'Could not load session');
          setSession(null);
          return;
        }
        setSession(r.session as unknown as SessionPayload);
      } catch {
        if (!cancelled) setLoadError('Could not load session');
      } finally {
        if (!cancelled) setLoadingSession(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [sessionId, router]);

  const topicIdStr =
    session?.topic_id != null
      ? typeof session.topic_id === 'string'
        ? session.topic_id
        : session.topic_id.toString()
      : null;

  useEffect(() => {
    if (!topicIdStr) {
      setQuestions([]);
      setLoadingQuestions(false);
      return;
    }
    let cancelled = false;
    const loadQs = async () => {
      setLoadingQuestions(true);
      try {
        const res = await fetchWithAuth(`/api/questions?topicId=${encodeURIComponent(topicIdStr)}`);
        const json = (await res.json()) as { success?: boolean; data?: Record<string, unknown>[] };
        if (cancelled) return;
        if (res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const normalized = json.data
            .map((q, i) => normalizeApiQuestion(q, i))
            .filter((q): q is PlayerQuestion => q != null);
          setQuestions(normalized.length > 0 ? normalized : MOCK_QUESTIONS);
        } else {
          setQuestions(MOCK_QUESTIONS);
        }
      } catch {
        if (!cancelled) setQuestions(MOCK_QUESTIONS);
      } finally {
        if (!cancelled) setLoadingQuestions(false);
      }
    };
    loadQs();
    return () => {
      cancelled = true;
    };
  }, [topicIdStr]);

  const totalQuestions = questions.length;
  const currentQuestion = !practiceComplete && totalQuestions > 0 ? questions[currentStep] ?? null : null;

  useEffect(() => {
    const sid = sessionIdRef.current;
    if (!sid || !currentQuestion || practiceComplete) return;
    questionShownAtRef.current = Date.now();
    void sendEvent({
      session_id: sid,
      event_type: 'question',
      content: currentQuestion._id,
    });
  }, [currentQuestion?._id, practiceComplete]);

  const handleSelectOption = useCallback(
    (idx: number) => {
      if (!currentQuestion || revealed || !sessionId) return;
      const choice = currentQuestion.options[idx];
      const correct = choice === currentQuestion.correct_answer;
      const rt = Math.max(0, Date.now() - questionShownAtRef.current);
      setSelectedIndex(idx);
      setRevealed(true);
      setIsCorrect(correct);
      sessionStatsRef.current.answered += 1;
      if (correct) sessionStatsRef.current.correct += 1;
      void sendEvent({
        session_id: sessionId,
        event_type: 'answer',
        content: String(idx),
        is_correct: correct,
        response_time_ms: rt,
      });
    },
    [currentQuestion, revealed, sessionId]
  );

  const handleNext = useCallback(() => {
    if (totalQuestions === 0) return;
    if (!revealed) return;
    if (currentStep >= totalQuestions - 1) {
      setPracticeComplete(true);
      return;
    }
    setAdvancingQuestion(true);
    setCurrentStep((s) => s + 1);
    setSelectedIndex(null);
    setRevealed(false);
    setIsCorrect(null);
  }, [totalQuestions, revealed, currentStep]);

  useEffect(() => {
    if (!advancingQuestion) return;
    const t = window.setTimeout(() => setAdvancingQuestion(false), 240);
    return () => window.clearTimeout(t);
  }, [currentStep, advancingQuestion]);

  const handleTutorQuestionSent = useCallback(
    (message: string, tab: TutorTab) => {
      if (!sessionId) return;
      const type = tab === 'hint' ? 'hint_request' : 'question';
      void sendEvent({
        session_id: sessionId,
        event_type: type,
        content: `tutor:${tab}:${message.slice(0, 500)}`,
      });
    },
    [sessionId]
  );

  const handleAdaptiveMeta = useCallback(
    (meta: { difficulty?: string; mode?: string; mastery_score?: number } | null) => {
      const d = meta?.difficulty?.trim();
      if (!d) return;
      setTutorDifficultyLabel(d.charAt(0).toUpperCase() + d.slice(1).toLowerCase());
    },
    []
  );

  const finishSession = useCallback(async () => {
    if (!sessionId || ending) return;
    setEnding(true);
    try {
      await sendEvent({
        session_id: sessionId,
        event_type: 'session_end',
        content: 'session_end',
        metadata: { confidence_rating: confidence, elapsed_seconds: elapsedSec },
      });
      const end = await postSessionEnd(sessionId);
      if (!end.ok) {
        /* session still ends locally; API sync can be retried from history */
      }
    } catch {
      /* ignore */
    } finally {
      writeSessionCompleteStats({
        timeSpentSeconds: elapsedSec,
        questionsAnswered: sessionStatsRef.current.answered,
        questionsCorrect: sessionStatsRef.current.correct,
        topicName: session?.topic_name,
        topicId: topicIdStr ?? undefined,
      });
      router.push('/dashboard?sessionComplete=1');
    }
  }, [sessionId, ending, confidence, elapsedSec, router, session?.topic_name, topicIdStr]);

  if (loadingSession) {
    return (
      <div className="min-h-[100dvh] flex flex-col isit-cosmic-bg overflow-x-hidden relative">
        <div className="h-14 sm:h-16 border-b border-cyan-400/15 bg-slate-950/50 animate-pulse shrink-0" />
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-0 p-3 sm:p-4">
          <div className="flex-1 min-h-[240px] rounded-2xl border border-cyan-400/15 bg-slate-950/40 animate-pulse" />
          <div className="hidden lg:block w-[min(100%,320px)] rounded-2xl bg-cyan-950/30 animate-pulse shrink-0" />
        </div>
        <div className="h-20 border-t border-cyan-400/15 bg-slate-950/50 animate-pulse shrink-0" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="isit-cosmic-bg min-h-screen text-cyan-50 flex flex-col items-center justify-center px-4 py-10 relative">
        <p className="text-cyan-50 font-semibold text-center">Access denied</p>
        <p className="text-cyan-100/75 text-sm text-center mt-2 max-w-md leading-relaxed">
          You do not have permission to open this session.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link href="/dashboard" className="btn-primary min-h-11 px-6 no-underline text-sm">
            Back to dashboard
          </Link>
          <Link href="/subjects" className="btn-secondary min-h-11 px-6 no-underline text-sm">
            Explore subjects
          </Link>
        </div>
      </div>
    );
  }

  if (loadError || !session) {
    return (
      <div className="isit-cosmic-bg min-h-screen text-cyan-50 flex flex-col items-center justify-center px-4 relative">
        <p className="text-cyan-100 font-medium text-center">{loadError || 'Session unavailable'}</p>
        <Link href="/subjects" className="mt-4 text-cyan-300 text-sm font-medium hover:underline">
          Browse subjects
        </Link>
      </div>
    );
  }

  const topicTitle = session.topic_name || 'Learning session';
  const teacherAssignedSession =
    session.session_mode === 'teacher_assigned' || session.session_source === 'assigned';
  const alreadyEnded = session.completion_status === 'completed';

  if (alreadyEnded) {
    return (
      <div className="isit-cosmic-bg min-h-screen text-cyan-50 flex flex-col items-center justify-center px-4 relative">
        <p className="text-cyan-50 font-semibold">This session has already ended.</p>
        <Link href="/dashboard" className="mt-4 text-cyan-300 font-medium hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const showNext = totalQuestions > 0 && !practiceComplete;
  const canGoNext = revealed;

  return (
    <div className="h-[100dvh] min-h-0 flex flex-col isit-cosmic-bg overflow-hidden overflow-x-hidden relative">
      <SessionHeader
        topicName={topicTitle}
        timerLabel={formatTimer(elapsedSec)}
        onExit={finishSession}
        exiting={ending}
        progress={
          !practiceComplete && totalQuestions > 0 ? { current: currentStep + 1, total: totalQuestions } : null
        }
        difficultyLabel={tutorDifficultyLabel}
        teacherAssigned={teacherAssignedSession}
      />

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Learning ~70% */}
        <section className="flex-1 lg:flex-[7] min-h-0 min-w-0 flex flex-col border-slate-200/90 lg:border-r lg:border-slate-200 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5)]">
          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 lg:p-6">
            {practiceComplete ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-10 text-center shadow-md max-w-lg mx-auto">
                <p className="text-xl font-bold text-slate-900">Nice work!</p>
                <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                  You&apos;ve finished this practice set. Keep going with the AI Tutor or end the session when you&apos;re ready.
                </p>
              </div>
            ) : (
              <LearningPanel
                loading={loadingQuestions}
                advancing={advancingQuestion}
                question={currentQuestion}
                questionIndex={currentStep}
                totalQuestions={totalQuestions}
                selectedIndex={selectedIndex}
                revealed={revealed}
                isCorrect={isCorrect}
                onSelectOption={handleSelectOption}
              />
            )}
          </div>
        </section>

        {/* Tutor ~30% — collapsible on small screens */}
        <aside className="flex flex-col lg:flex-[3] min-h-0 min-w-0 lg:min-w-[280px] xl:min-w-[320px] bg-slate-100 border-t lg:border-t-0 lg:border-l border-slate-200/90 shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.12)] lg:shadow-none">
          <button
            type="button"
            className="lg:hidden flex items-center justify-between gap-3 w-full min-h-[44px] px-4 py-3 bg-white border-b border-slate-200 text-left shrink-0 transition-colors motion-safe-transition"
            onClick={() => setMobileTutorOpen((o) => !o)}
            aria-expanded={mobileTutorOpen}
            aria-controls="session-ai-tutor-panel"
          >
            <span className="flex items-center gap-2 font-bold text-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <Bot className="w-5 h-5" aria-hidden />
              </span>
              AI Tutor
            </span>
            {mobileTutorOpen ? (
              <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" aria-hidden />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" aria-hidden />
            )}
          </button>
          <div
            id="session-ai-tutor-panel"
            className={`flex-1 min-h-0 flex flex-col p-3 sm:p-4 overflow-y-auto transition-[max-height,opacity] duration-300 ease-out motion-reduce:transition-none ${
              mobileTutorOpen ? 'flex max-h-[min(56vh,520px)] opacity-100' : 'max-h-0 opacity-0 overflow-hidden lg:opacity-100'
            } lg:flex lg:max-h-none lg:overflow-visible`}
          >
            <AITutorPanel
              sessionId={sessionId}
              onTutorQuestionSent={handleTutorQuestionSent}
              onAdaptiveMeta={handleAdaptiveMeta}
            />
          </div>
        </aside>
      </div>

      <BottomControls
        showNext={showNext}
        canGoNext={canGoNext}
        onNext={handleNext}
        confidence={confidence}
        onConfidence={setConfidence}
        onEndSession={finishSession}
        ending={ending}
      />
    </div>
  );
}
