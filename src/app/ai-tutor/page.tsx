'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import ParentNav from '@/components/ParentNav';
import TeacherShell from '@/app/teacher/_components/TeacherShell';
import { Bot, Brain, Lightbulb, SendHorizonal, Sparkles, Wand2, Gauge, Clock3, BookMarked, ShieldCheck, AlertTriangle, RotateCcw } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  error?: boolean;
};

const STARTER_PROMPTS = [
  'Explain quadratic equations with a real-life example.',
  'Make a 20-minute revision plan for tomorrow.',
  'Quiz me on today\'s chapter with 5 MCQs.',
  'Teach this concept in very simple Hindi + English.',
];

function TutorContent() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      role: 'assistant',
      content: 'Hi! I am your AI Tutor. Tell me what you are learning and I will explain it step-by-step.',
      createdAt: Date.now(),
    },
  ]);
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
            content: `${fallbackAnswer(clean)}\n\nTip: Open a learning session to get adaptive tutor responses.`,
            createdAt: Date.now(),
          },
        ]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong while contacting tutor.';
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
    () => [
      ['Tutor Mode', 'Adaptive'],
      ['Session Focus', 'Concept clarity'],
      ['Confidence', 'Growing'],
    ],
    []
  );

  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">AI Learning Assistant</p>
          <h1 className="mt-1 text-3xl font-black sm:text-4xl">AI Tutor</h1>
          <p className="mt-2 max-w-2xl text-sm text-cyan-100/70">
            Ask doubts, get step-by-step explanations, switch between simple and advanced mode, and practice instantly.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="isit-chip"><Sparkles className="h-3.5 w-3.5" />24/7 Guidance</span>
          <span className="isit-chip"><Brain className="h-3.5 w-3.5" />Personalized</span>
          <span className="isit-chip">{sessionId ? 'Adaptive connected' : 'General mode'}</span>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <div className="isit-glass rounded-2xl p-3"><p className="text-[11px] uppercase text-cyan-300">Readiness</p><p className="mt-1 flex items-center gap-2 text-sm font-semibold text-cyan-100"><Gauge className="h-4 w-4" />High</p></div>
        <div className="isit-glass rounded-2xl p-3"><p className="text-[11px] uppercase text-cyan-300">Focus Time</p><p className="mt-1 flex items-center gap-2 text-sm font-semibold text-cyan-100"><Clock3 className="h-4 w-4" />25 min plan</p></div>
        <div className="isit-glass rounded-2xl p-3"><p className="text-[11px] uppercase text-cyan-300">Practice Pack</p><p className="mt-1 flex items-center gap-2 text-sm font-semibold text-cyan-100"><BookMarked className="h-4 w-4" />5 quick MCQs</p></div>
        <div className="isit-glass rounded-2xl p-3"><p className="text-[11px] uppercase text-cyan-300">Safety</p><p className="mt-1 flex items-center gap-2 text-sm font-semibold text-cyan-100"><ShieldCheck className="h-4 w-4" />Classroom-safe</p></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px,1fr,280px]">
        <aside className="isit-glass rounded-2xl p-4">
          <p className="mb-3 text-sm font-semibold text-cyan-100">Quick Prompts</p>
          <div className="mb-3 grid grid-cols-3 gap-1 rounded-lg border border-cyan-300/20 bg-slate-900/70 p-1 text-[11px]">
            {(['explain', 'hint', 'quiz'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-2 py-1.5 uppercase tracking-wide ${activeTab === tab ? 'bg-cyan-400/20 text-cyan-100' : 'text-cyan-100/70'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {STARTER_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => sendMessage(p)}
                className="w-full rounded-xl border border-cyan-300/20 bg-slate-900/70 p-3 text-left text-xs text-cyan-100/85 hover:bg-cyan-400/10"
              >
                {p}
              </button>
            ))}
          </div>
        </aside>

        <section className="isit-glass flex min-h-[560px] flex-col rounded-2xl">
          <div className="border-b border-cyan-300/20 px-4 py-3 text-sm font-semibold text-cyan-100">
            Conversation
          </div>
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
                Thinking...
              </div>
            )}
            {networkError && lastPrompt && (
              <button
                type="button"
                onClick={() => sendMessage(lastPrompt, true)}
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/25 bg-slate-900/70 px-3 py-2 text-xs text-cyan-100"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Retry last message
              </button>
            )}
          </div>
          <div className="border-t border-cyan-300/20 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-cyan-300/25 bg-slate-900/75 p-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canSend) sendMessage(input);
                }}
                placeholder="Ask anything..."
                className="flex-1 border-0 bg-transparent px-2 py-2 text-sm text-cyan-100 outline-none placeholder:text-cyan-100/50"
              />
              <button
                type="button"
                onClick={() => sendMessage(input)}
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
            <p className="mb-2 text-sm font-semibold text-cyan-100">Session Assist</p>
            <div className="space-y-2">
              <button className="flex w-full items-center gap-2 rounded-xl border border-cyan-300/20 bg-slate-900/70 px-3 py-2 text-sm text-cyan-100/85">
                <Lightbulb className="h-4 w-4 text-cyan-300" />
                Explain in simpler way
              </button>
              <button className="flex w-full items-center gap-2 rounded-xl border border-cyan-300/20 bg-slate-900/70 px-3 py-2 text-sm text-cyan-100/85">
                <Wand2 className="h-4 w-4 text-cyan-300" />
                Generate quick quiz
              </button>
            </div>
          </div>
          <div className="isit-glass rounded-2xl p-4">
            <p className="mb-2 text-sm font-semibold text-cyan-100">Tutor Signals</p>
            <div className="space-y-2 text-xs text-cyan-100/75">
              {stats.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between rounded-lg border border-cyan-300/20 bg-slate-900/70 px-3 py-2">
                  <span>{k}</span>
                  <span className="font-semibold text-cyan-200">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-cyan-300/20 bg-slate-900/70 px-3 py-2 text-[11px] text-cyan-100/75">
              <AlertTriangle className="mr-1 inline h-3.5 w-3.5 text-cyan-300" />
              For best adaptive guidance, start a topic session first.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function AITutorPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?returnUrl=%2Fai-tutor');
    }
  }, [loading, user, router]);

  if (loading) {
    return <div className="isit-cosmic-bg min-h-screen" />;
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
    <div className="isit-cosmic-bg min-h-screen text-cyan-50">
      <Sidebar />
      <main className="px-2 sm:px-4 md:ml-[220px]">
        <TutorContent />
      </main>
    </div>
  );
}
