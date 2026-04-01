'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Sparkles, Lightbulb, RotateCcw, Brain, GraduationCap } from 'lucide-react';
import { postSessionAsk, type TutorAskPhase } from '@/lib/session-api';
import type { QuickAction } from '@/lib/tutor-adaptive';

export type TutorTab = 'explain' | 'hint' | 'quiz';

type BubbleVariant = 'ai' | 'student' | 'hint' | 'explanation' | 'teachback' | 'error';

type ChatLine = {
  role: 'user' | 'assistant';
  text: string;
  meta?: string;
  variant?: BubbleVariant;
  showRetry?: boolean;
};

type RunAskOpts = {
  message?: string;
  tabOverride?: TutorTab;
  phase?: TutorAskPhase;
  quickAction?: QuickAction;
  logUserText?: string;
  /** If true, do not append a user bubble (e.g. retry). */
  skipUserEcho?: boolean;
};

type AITutorPanelProps = {
  sessionId: string;
  onTutorQuestionSent: (message: string, tab: TutorTab) => void;
  onAdaptiveMeta?: (meta: { difficulty?: string; mode?: string; mastery_score?: number } | null) => void;
};

function stripSimpleMarkdown(s: string): string {
  return s.replace(/\*\*(.+?)\*\*/g, '$1');
}

function assistantVariantForQuickAction(action?: QuickAction): BubbleVariant {
  if (action === 'hint') return 'hint';
  if (action === 'explain_again') return 'explanation';
  return 'ai';
}

export default function AITutorPanel({ sessionId, onTutorQuestionSent, onAdaptiveMeta }: AITutorPanelProps) {
  const [tab, setTab] = useState<TutorTab>('explain');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatLine[]>([
    {
      role: 'assistant',
      text: "I'm your AI tutor for this session. Ask anything, request a hint, or use the tools below — I'll guide you with questions and clear explanations.",
      variant: 'ai',
    },
  ]);
  const [sending, setSending] = useState(false);
  const [teachbackAwaiting, setTeachbackAwaiting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastFailedOptsRef = useRef<RunAskOpts | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const runAsk = useCallback(
    async (opts: RunAskOpts): Promise<boolean> => {
      const text = (opts.message ?? '').trim();
      const effectiveTab = opts.tabOverride ?? tab;
      if (!opts.quickAction && !opts.phase && !text) return false;

      const displayUser = opts.logUserText ?? text;
      if (displayUser && !opts.skipUserEcho) {
        const userVariant: BubbleVariant =
          displayUser.includes('[Teachback') || displayUser.includes('Teachback')
            ? 'teachback'
            : displayUser.includes('[Hint]')
              ? 'hint'
              : 'student';
        setMessages((m) => [...m, { role: 'user', text: displayUser, variant: userVariant }]);
        onTutorQuestionSent(displayUser, effectiveTab);
      }

      setSending(true);
      lastFailedOptsRef.current = null;
      let success = false;
      try {
        const r = await postSessionAsk({
          sessionId,
          message: text,
          tab: effectiveTab,
          phase: opts.phase,
          quickAction: opts.quickAction,
        });
        let out: string;
        let variant: BubbleVariant = opts.quickAction ? assistantVariantForQuickAction(opts.quickAction) : 'ai';
        if (r.ok && r.reply) {
          out = stripSimpleMarkdown(r.reply);
          success = true;
          if (opts.phase === 'teachback_submit') variant = 'teachback';
          if (onAdaptiveMeta) onAdaptiveMeta(r.adaptive);
        } else if (r.kind === 'network') {
          out = r.error ?? 'Network error. Check your connection and try again.';
          variant = 'error';
          lastFailedOptsRef.current = opts;
        } else if (r.kind === 'forbidden') {
          out = r.error ?? 'You do not have access to the tutor for this session.';
          variant = 'error';
        } else if (r.status === 503) {
          out = 'AI is not configured. Add OPENAI_API_KEY to use the tutor.';
          variant = 'error';
        } else {
          out = r.error ?? 'Something went wrong. Please try again.';
          variant = 'error';
          lastFailedOptsRef.current = opts;
        }
        const metaParts: string[] = [];
        if (r.adaptive?.difficulty) metaParts.push(`Level: ${r.adaptive.difficulty}`);
        if (r.adaptive?.mode) metaParts.push(`Mode: ${r.adaptive.mode}`);
        if (typeof r.adaptive?.mastery_score === 'number') metaParts.push(`Mastery ~${r.adaptive.mastery_score}%`);
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            text: out,
            meta: metaParts.length ? metaParts.join(' · ') : undefined,
            variant,
            showRetry: variant === 'error' && !!lastFailedOptsRef.current,
          },
        ]);
      } catch {
        lastFailedOptsRef.current = opts;
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            text: 'Network error. Check your connection and try again.',
            variant: 'error',
            showRetry: true,
          },
        ]);
      } finally {
        setSending(false);
      }
      return success;
    },
    [sessionId, tab, onTutorQuestionSent, onAdaptiveMeta]
  );

  const handleRetry = async () => {
    const failed = lastFailedOptsRef.current;
    if (!failed || sending) return;
    await runAsk({ ...failed, skipUserEcho: true });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    const wasTeachback = teachbackAwaiting;
    const phase: TutorAskPhase | undefined = wasTeachback ? 'teachback_submit' : undefined;
    const ok = await runAsk({ message: text, phase });
    if (wasTeachback && ok) setTeachbackAwaiting(false);
  };

  const handleQuick = async (action: QuickAction) => {
    if (sending) return;
    const labels: Record<QuickAction, string> = {
      hint: '[Hint]',
      explain_again: '[Explain again]',
      test_me: '[Test me]',
    };
    const tabForQuick: Record<QuickAction, TutorTab> = {
      hint: 'hint',
      explain_again: 'explain',
      test_me: 'quiz',
    };
    setTab(tabForQuick[action]);
    await runAsk({ quickAction: action, logUserText: labels[action], tabOverride: tabForQuick[action] });
  };

  const handleTeachbackInvite = async () => {
    if (sending) return;
    setMessages((m) => [...m, { role: 'user', text: '[Teachback — explain in my own words]', variant: 'teachback' }]);
    onTutorQuestionSent('[Teachback]', 'explain');
    setSending(true);
    lastFailedOptsRef.current = null;
    try {
      const r = await postSessionAsk({
        sessionId,
        message: '',
        tab: 'explain',
        phase: 'teachback_invite',
      });
      let out: string;
      let variant: BubbleVariant = 'explanation';
      if (r.ok && r.reply) {
        out = stripSimpleMarkdown(r.reply);
        setTeachbackAwaiting(true);
        if (onAdaptiveMeta) onAdaptiveMeta(r.adaptive);
      } else if (r.status === 503) {
        out = 'AI is not configured.';
        variant = 'error';
      } else {
        out = r.error ?? 'Could not start teachback.';
        variant = 'error';
        lastFailedOptsRef.current = {
          message: '',
          tabOverride: 'explain',
          phase: 'teachback_invite',
        };
      }
      setMessages((m) => [...m, { role: 'assistant', text: out, variant }]);
    } catch {
      lastFailedOptsRef.current = { message: '', tabOverride: 'explain', phase: 'teachback_invite' };
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: 'Network error. Try again.', variant: 'error', showRetry: true },
      ]);
    } finally {
      setSending(false);
    }
  };

  const bubbleClasses = (line: ChatLine) => {
    const v = line.variant ?? (line.role === 'user' ? 'student' : 'ai');
    switch (v) {
      case 'student':
        return 'bg-slate-800 text-white rounded-br-md shadow-md border border-slate-700/80';
      case 'hint':
        return 'bg-amber-50 text-amber-950 rounded-bl-md border border-amber-200/90 shadow-sm';
      case 'explanation':
        return 'bg-sky-50 text-sky-950 rounded-bl-md border border-sky-200/90 shadow-sm';
      case 'teachback':
        return 'bg-emerald-50 text-emerald-950 rounded-bl-md border-2 border-emerald-200/90 shadow-sm ring-1 ring-emerald-100';
      case 'error':
        return 'bg-rose-50 text-rose-950 rounded-bl-md border border-rose-200 shadow-sm';
      default:
        return 'bg-slate-100 text-slate-800 rounded-bl-md border border-slate-200/90 shadow-sm';
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white rounded-2xl border border-slate-200/90 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-violet-50/40">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <Sparkles className="w-4 h-4" aria-hidden />
              </span>
              AI Tutor
            </h2>
            <p className="text-xs text-slate-600 mt-1 pl-10 leading-snug">Ask anything or get help — hints, explanations, and quick checks.</p>
          </div>
        </div>
        {/* Mode chips — drive `tab` for free-text sends */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {(['explain', 'hint', 'quiz'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                tab === t
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-200 hover:text-violet-700'
              }`}
            >
              {t === 'quiz' ? 'Quiz help' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-[200px] bg-slate-50/40">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[min(100%,420px)] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${bubbleClasses(msg)}`}
            >
              {msg.role === 'assistant' && (msg.variant === 'ai' || !msg.variant) && (
                <Sparkles className="w-3.5 h-3.5 inline mr-1.5 text-violet-500 opacity-90 align-[-2px]" aria-hidden />
              )}
              {msg.role === 'assistant' && msg.variant === 'hint' && (
                <Lightbulb className="w-3.5 h-3.5 inline mr-1.5 text-amber-600 align-[-2px]" aria-hidden />
              )}
              {msg.role === 'assistant' && msg.variant === 'explanation' && (
                <RotateCcw className="w-3.5 h-3.5 inline mr-1.5 text-sky-600 align-[-2px]" aria-hidden />
              )}
              {msg.role === 'assistant' && msg.variant === 'teachback' && (
                <Brain className="w-3.5 h-3.5 inline mr-1.5 text-emerald-600 align-[-2px]" aria-hidden />
              )}
              {msg.variant === 'explanation' || msg.variant === 'teachback' ? (
                <div className="whitespace-pre-wrap">{msg.text}</div>
              ) : (
                msg.text
              )}
            </div>
            {msg.role === 'assistant' && msg.meta && (
              <span className="mt-1 text-[10px] text-slate-500 px-1 font-medium">{msg.meta}</span>
            )}
            {msg.role === 'assistant' && msg.showRetry && (
              <button
                type="button"
                onClick={() => void handleRetry()}
                disabled={sending}
                className="mt-2 text-xs font-semibold text-sky-600 hover:text-sky-800 disabled:opacity-50"
              >
                Retry
              </button>
            )}
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2.5 text-slate-600 text-sm border border-slate-200 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-violet-500 shrink-0" />
              <span className="font-medium">AI is thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {teachbackAwaiting && (
        <div className="shrink-0 px-3 py-2 text-xs font-medium text-emerald-900 bg-emerald-50 border-t border-emerald-100">
          Teachback mode — type your explanation in your own words below. I’ll give structured feedback.
        </div>
      )}

      {/* Toolbar */}
      <div className="shrink-0 px-3 pt-3 pb-2 border-t border-slate-100 bg-white">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Quick actions</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={sending}
            onClick={() => void handleQuick('hint')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-950 border border-amber-200 hover:bg-amber-100 disabled:opacity-45 transition-colors shadow-sm"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Hint
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={() => void handleQuick('explain_again')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sky-50 text-sky-950 border border-sky-200 hover:bg-sky-100 disabled:opacity-45 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Explain again
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={() => void handleQuick('test_me')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-violet-50 text-violet-950 border border-violet-200 hover:bg-violet-100 disabled:opacity-45 transition-colors shadow-sm"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Test me
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={() => void handleTeachbackInvite()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-950 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-45 transition-colors shadow-sm"
          >
            <Brain className="w-3.5 h-3.5" />
            Teachback
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100 bg-white shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), void handleSend())}
            placeholder={
              sending
                ? 'Wait for the tutor…'
                : teachbackAwaiting
                  ? 'Type your explanation in your own words…'
                  : tab === 'hint'
                    ? 'Ask for a hint…'
                    : tab === 'quiz'
                      ? 'Quiz or check question…'
                      : 'Ask a question…'
            }
            className="flex-1 min-w-0 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400 transition-shadow disabled:bg-slate-50 disabled:text-slate-500"
            disabled={sending}
            aria-label="Message to AI tutor"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={sending || !input.trim()}
            className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-colors"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
