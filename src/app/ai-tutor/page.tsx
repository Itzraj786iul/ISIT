'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import ParentNav from '@/components/ParentNav';
import TeacherShell from '@/app/teacher/_components/TeacherShell';
import {
  Bot,
  Brain,
  Lightbulb,
  SendHorizonal,
  Sparkles,
  Wand2,
  Gauge,
  Clock3,
  BookMarked,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { useT, type I18nKey } from '@/lib/t';
import { useLanguage } from '@/lib/language-context';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  error?: boolean;
};

const STARTER_KEYS = ['aiTutorStarter1', 'aiTutorStarter2', 'aiTutorStarter3', 'aiTutorStarter4'] as const satisfies readonly I18nKey[];

function TutorContent() {
  const tr = useT();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
    },
  ]);

  useLayoutEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'm1' && prev[0].role === 'assistant') {
        return [{ ...prev[0], content: tr('aiTutorWelcomeMessage') }];
      }
      return prev;
    });
  }, [language, tr]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'explain' | 'hint' | 'quiz'>('explain');
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const canSend = input.trim().length > 0 && !thinking;

  useEffect(() => {
    const role = user?.role?.toLowerCase();
    if (role !== 'student') return;
    let mounted = true;
    fetch('/api/last-session', { credentials: 'include', cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        return data?.data?.session_id ?? null;
      })
      .then((sid) => {
        if (mounted && typeof sid === 'string' && sid.length > 0) setSessionId(sid);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const fallbackAnswer = (clean: string): string => {
    return `I can help with that.\n\n- Core idea: break the topic into small steps.\n- Apply: solve one simple example first.\n- Practice: attempt 3 focused questions.\n\nYour question was: "${clean.slice(0, 120)}${clean.length > 120 ? '...' : ''}"`;
  };

  const sendMessage = async (content: string, forceRetry = false) => {
    const clean = content.trim();
    if (!clean) return;
    setNetworkError(null);
    if (!forceRetry) {
      const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: clean, createdAt: Date.now() };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
    }
    setThinking(true);
    setLastPrompt(clean);

    try {
      const role = user?.role?.toLowerCase();
      const canUseAdaptive = role === 'student' && !!sessionId;
      if (canUseAdaptive) {
        const res = await fetch('/api/sessions/ask', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            message: clean,
            tab: activeTab,
          }),
        });
        if (!res.ok) {
          const errorText = res.status === 503 ? 'AI service is not configured yet.' : 'AI service temporarily unavailable.';
          throw new Error(errorText);
        }
        const data = await res.json();
        const answerText: string = data?.data?.answer || data?.answer || 'I could not generate an answer.';
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: 'assistant', content: answerText, createdAt: Date.now() },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: `${fallbackAnswer(clean)}\n\n${tr('aiTutorOfflineTip')}`,
            createdAt: Date.now(),
          },
        ]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : tr('aiTutorErrorGeneric');
      setNetworkError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-err-${Date.now()}`,
          role: 'assistant',
          content: msg,
          createdAt: Date.now(),
          error: true,
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const stats = useMemo(
    () =>
      [
        { label: tr('aiTutorStatTutorMode'), value: tr('aiTutorStatTutorModeValue') },
        { label: tr('aiTutorStatSessionFocus'), value: tr('aiTutorStatSessionFocusValue') },
        { label: tr('aiTutorStatConfidence'), value: tr('aiTutorStatConfidenceValue') },
      ] as const,
    [tr]
  );

  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{tr('aiTutorPageEyebrow')}</p>
          <h1 className="mt-1 text-3xl font-black sm:text-4xl">{tr('aiTutor')}</h1>
          <p className="mt-2 max-w-2xl text-sm text-cyan-100/70">{tr('aiTutorPageLead')}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="isit-chip">
            <Sparkles className="h-3.5 w-3.5" />
            {tr('aiTutorChip247')}
          </span>
          <span className="isit-chip">
            <Brain className="h-3.5 w-3.5" />
            {tr('aiTutorChipPersonalized')}
          </span>
          <span className="isit-chip">{sessionId ? tr('aiTutorChipAdaptiveConnected') : tr('aiTutorChipGeneralMode')}</span>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <div className="isit-glass rounded-2xl p-3">
          <p className="text-[11px] uppercase text-cyan-300">{tr('aiTutorReadiness')}</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-cyan-100">
            <Gauge className="h-4 w-4" />
            {tr('aiTutorReadinessHigh')}
          </p>
        </div>
        <div className="isit-glass rounded-2xl p-3">
          <p className="text-[11px] uppercase text-cyan-300">{tr('aiTutorFocusTime')}</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-cyan-100">
            <Clock3 className="h-4 w-4" />
            {tr('aiTutorFocusTimeValue')}
          </p>
        </div>
        <div className="isit-glass rounded-2xl p-3">
          <p className="text-[11px] uppercase text-cyan-300">{tr('aiTutorPracticePack')}</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-cyan-100">
            <BookMarked className="h-4 w-4" />
            {tr('aiTutorPracticePackValue')}
          </p>
        </div>
        <div className="isit-glass rounded-2xl p-3">
          <p className="text-[11px] uppercase text-cyan-300">{tr('aiTutorSafety')}</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-cyan-100">
            <ShieldCheck className="h-4 w-4" />
            {tr('aiTutorSafetyValue')}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px,1fr,280px]">
        <aside className="isit-glass rounded-2xl p-4">
          <p className="mb-3 text-sm font-semibold text-cyan-100">{tr('aiTutorQuickPrompts')}</p>
          <div className="mb-3 grid grid-cols-3 gap-1 rounded-lg border border-cyan-300/20 bg-slate-900/70 p-1 text-[11px]">
            {(
              [
                { id: 'explain' as const, labelKey: 'aiTutorTabExplain' as const },
                { id: 'hint' as const, labelKey: 'aiTutorTabHint' as const },
                { id: 'quiz' as const, labelKey: 'aiTutorTabQuiz' as const },
              ] as const
            ).map(({ id, labelKey }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`rounded-md px-2 py-1.5 uppercase tracking-wide ${activeTab === id ? 'bg-cyan-400/20 text-cyan-100' : 'text-cyan-100/70'}`}
              >
                {tr(labelKey)}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {STARTER_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => void sendMessage(tr(key))}
                className="w-full rounded-xl border border-cyan-300/20 bg-slate-900/70 p-3 text-left text-xs text-cyan-100/85 hover:bg-cyan-400/10"
              >
                {tr(key)}
              </button>
            ))}
          </div>
        </aside>

        <section className="isit-glass flex min-h-[560px] flex-col rounded-2xl">
          <div className="border-b border-cyan-300/20 px-4 py-3 text-sm font-semibold text-cyan-100">{tr('aiTutorConversation')}</div>
          <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
                    m.role === 'user'
                      ? 'bg-cyan-400/20 border border-cyan-300/30 text-cyan-100'
                      : m.error
                        ? 'bg-red-500/10 border border-red-300/30 text-red-200'
                        : 'bg-slate-900/75 border border-cyan-300/20 text-cyan-50'
                  }`}
                >
                  {m.content}
                  <p className="mt-2 text-[10px] opacity-60">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {thinking && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-slate-900/70 px-3 py-2 text-xs text-cyan-200">
                <Bot className="h-4 w-4" />
                {tr('aiTutorThinking')}
              </div>
            )}
            {networkError && lastPrompt && (
              <button
                type="button"
                onClick={() => void sendMessage(lastPrompt, true)}
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/25 bg-slate-900/70 px-3 py-2 text-xs text-cyan-100"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {tr('aiTutorRetryLast')}
              </button>
            )}
          </div>
          <div className="border-t border-cyan-300/20 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-cyan-300/25 bg-slate-900/75 p-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canSend) void sendMessage(input);
                }}
                placeholder={tr('aiTutorPlaceholderAsk')}
                className="flex-1 border-0 bg-transparent px-2 py-2 text-sm text-cyan-100 outline-none placeholder:text-cyan-100/50"
              />
              <button
                type="button"
                onClick={() => void sendMessage(input)}
                disabled={!canSend}
                className="isit-btn-primary px-4 py-2 disabled:opacity-60"
              >
                <SendHorizonal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-3">
          <div className="isit-glass rounded-2xl p-4">
            <p className="mb-2 text-sm font-semibold text-cyan-100">{tr('aiTutorSessionAssist')}</p>
            <div className="space-y-2">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-xl border border-cyan-300/20 bg-slate-900/70 px-3 py-2 text-sm text-cyan-100/85"
              >
                <Lightbulb className="h-4 w-4 text-cyan-300" />
                {tr('aiTutorExplainSimpler')}
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-xl border border-cyan-300/20 bg-slate-900/70 px-3 py-2 text-sm text-cyan-100/85"
              >
                <Wand2 className="h-4 w-4 text-cyan-300" />
                {tr('aiTutorGenQuiz')}
              </button>
            </div>
          </div>
          <div className="isit-glass rounded-2xl p-4">
            <p className="mb-2 text-sm font-semibold text-cyan-100">{tr('aiTutorSignals')}</p>
            <div className="space-y-2 text-xs text-cyan-100/75">
              {stats.map((row) => (
                <div key={row.label} className="flex items-center justify-between rounded-lg border border-cyan-300/20 bg-slate-900/70 px-3 py-2">
                  <span>{row.label}</span>
                  <span className="font-semibold text-cyan-200">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-cyan-300/20 bg-slate-900/70 px-3 py-2 text-[11px] text-cyan-100/75">
              <AlertTriangle className="mr-1 inline h-3.5 w-3.5 text-cyan-300" />
              {tr('aiTutorHintSessionFirst')}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function AITutorPage() {
  const tr = useT();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?returnUrl=%2Fai-tutor');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="isit-cosmic-bg flex min-h-screen items-center justify-center text-cyan-200">
        <p className="text-sm">{tr('courseLoading')}</p>
      </div>
    );
  }

  const role = user?.role?.toLowerCase();

  if (!user) {
    return <div className="isit-cosmic-bg min-h-screen" />;
  }

  if (role === 'teacher' || role === 'admin') {
    return (
      <TeacherShell user={user}>
        <TutorContent />
      </TeacherShell>
    );
  }

  if (role === 'parent') {
    return (
      <div className="isit-cosmic-bg min-h-screen text-cyan-50">
        <ParentNav />
        <main className="ml-[250px]">
          <TutorContent />
        </main>
      </div>
    );
  }

  return (
    <div className="isit-cosmic-bg flex min-h-screen text-cyan-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950/95">
          <div className="px-4 py-3 sm:px-6">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
              <Link href="/dashboard" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
                {tr('dashboard')}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              <span className="font-medium text-slate-700 dark:text-slate-200">{tr('aiTutor')}</span>
            </nav>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden px-2 py-4 sm:px-4">
          <TutorContent />
        </main>
      </div>
    </div>
  );
}
