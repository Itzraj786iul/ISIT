'use client';

/**
 * AI-first session player — Subject → Topic → Session, with practice questions + AI tutor.
 * Session/events/tutor/end: internal `/api/*` or FastAPI via `session-api` + `NEXT_PUBLIC_USE_EXTERNAL_API`.
 */
import dynamic from 'next/dynamic';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
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
    setCurrentStep((s) => s + 1);
    setSelectedIndex(null);
    setRevealed(false);
    setIsCorrect(null);
  }, [totalQuestions, revealed, currentStep]);

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
        console.error('End session API failed', end.error, end.status);
      }
    } catch (e) {
      console.error(e);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 px-4">
        <p className="text-slate-800 font-semibold text-center">Access denied</p>
        <p className="text-slate-600 text-sm text-center mt-2 max-w-md">
          You do not have permission to open this session.
        </p>
        <Link href="/dashboard" className="mt-4 text-sky-600 text-sm font-medium hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (loadError || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 px-4">
        <p className="text-slate-700 font-medium text-center">{loadError || 'Session unavailable'}</p>
        <Link href="/subjects" className="mt-4 text-sky-600 text-sm font-medium hover:underline">
          Browse subjects
        </Link>
      </div>
    );
  }

  const topicTitle = session.topic_name || 'Learning session';
  const alreadyEnded = session.completion_status === 'completed';

  if (alreadyEnded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 px-4">
        <p className="text-slate-800 font-semibold">This session has already ended.</p>
        <Link href="/dashboard" className="mt-4 text-sky-600 font-medium hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const showNext = totalQuestions > 0 && !practiceComplete;
  const canGoNext = revealed;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <SessionHeader topicName={topicTitle} timerLabel={formatTimer(elapsedSec)} onExit={finishSession} exiting={ending} />

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        <div className="flex-1 lg:w-[70%] p-4 sm:p-6 overflow-y-auto">
          {practiceComplete ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-900">Nice work!</p>
              <p className="text-slate-600 text-sm mt-2">You have finished this practice set. Keep exploring with the tutor or end the session.</p>
            </div>
          ) : (
            <LearningPanel
              loading={loadingQuestions}
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
        <div className="lg:w-[30%] border-t lg:border-t-0 lg:border-l border-slate-200 p-4 sm:p-6 bg-slate-50/80 overflow-y-auto min-h-[420px] lg:min-h-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">AI tutor</p>
          <AITutorPanel sessionId={sessionId} onTutorQuestionSent={handleTutorQuestionSent} />
        </div>
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
