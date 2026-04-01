'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Lightbulb, RotateCcw, Brain, GraduationCap } from 'lucide-react';
import { postSessionAsk, type TutorAskPhase } from '@/lib/session-api';
import type { QuickAction } from '@/lib/tutor-adaptive';

export type TutorTab = 'explain' | 'hint' | 'quiz';

type ChatLine = {
  role: 'user' | 'assistant';
  text: string;
  meta?: string;
};

type AITutorPanelProps = {
  sessionId: string;
  onTutorQuestionSent: (message: string, tab: TutorTab) => void;
};

function stripSimpleMarkdown(s: string): string {
  return s.replace(/\*\*(.+?)\*\*/g, '$1');
}

export default function AITutorPanel({ sessionId, onTutorQuestionSent }: AITutorPanelProps) {
  const [tab, setTab] = useState<TutorTab>('explain');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatLine[]>([
    {
      role: 'assistant',
      text: 'I adapt to how you’re doing in this session—hints, explanations, and quick checks. Use the buttons below or type a question. I’ll guide with questions, not just answers.',
    },
  ]);
  const [sending, setSending] = useState(false);
  const [teachbackAwaiting, setTeachbackAwaiting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const runAsk = async (opts: {
    message?: string;
    tabOverride?: TutorTab;
    phase?: TutorAskPhase;
    quickAction?: QuickAction;
    logUserText?: string;
  }): Promise<boolean> => {
    const text = (opts.message ?? '').trim();
    const effectiveTab = opts.tabOverride ?? tab;
    if (!opts.quickAction && !opts.phase && !text) return false;

    const displayUser = opts.logUserText ?? text;
    if (displayUser) {
      setMessages((m) => [...m, { role: 'user', text: displayUser }]);
      onTutorQuestionSent(displayUser, effectiveTab);
    }

    setSending(true);
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
      if (r.ok && r.reply) {
        out = stripSimpleMarkdown(r.reply);
        success = true;
      } else if (r.kind === 'network') {
        out = r.error ?? 'Network error. Please try again.';
      } else if (r.kind === 'forbidden') {
        out = r.error ?? 'You do not have access to the tutor for this session.';
      } else if (r.status === 503) {
        out = 'AI is not configured. Add OPENAI_API_KEY to use the tutor.';
      } else {
        out = r.error ?? 'Sorry, something went wrong. Please try again.';
      }
      const metaParts: string[] = [];
      if (r.adaptive?.difficulty) metaParts.push(`Level: ${r.adaptive.difficulty}`);
      if (r.adaptive?.mode) metaParts.push(`Mode: ${r.adaptive.mode}`);
      if (typeof r.adaptive?.mastery_score === 'number') metaParts.push(`Topic mastery ~${r.adaptive.mastery_score}%`);
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: out,
          meta: metaParts.length ? metaParts.join(' · ') : undefined,
        },
      ]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: 'Network error. Please try again.' }]);
    } finally {
      setSending(false);
    }
    return success;
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
    await runAsk({ quickAction: action, logUserText: labels[action], tabOverride: tabForQuick[action] });
  };

  const handleTeachbackInvite = async () => {
    if (sending) return;
    setMessages((m) => [...m, { role: 'user', text: '[Teachback — explain in my own words]' }]);
    onTutorQuestionSent('[Teachback]', 'explain');
    setSending(true);
    try {
      const r = await postSessionAsk({
        sessionId,
        message: '',
        tab: 'explain',
        phase: 'teachback_invite',
      });
      let out: string;
      if (r.ok && r.reply) {
        out = stripSimpleMarkdown(r.reply);
        setMessages((m) => [...m, { role: 'assistant', text: out }]);
        setTeachbackAwaiting(true);
      } else if (r.status === 503) {
        out = 'AI is not configured.';
        setMessages((m) => [...m, { role: 'assistant', text: out }]);
      } else {
        out = r.error ?? 'Could not start teachback.';
        setMessages((m) => [...m, { role: 'assistant', text: out }]);
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: 'Network error.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[400px] max-h-[calc(100vh-12rem)] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex border-b border-slate-100 shrink-0">
        {(['explain', 'hint', 'quiz'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-medium capitalize transition ${
              tab === t ? 'text-sky-600 border-b-2 border-sky-500 bg-sky-50/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="px-2 pt-2 pb-1 flex flex-wrap gap-1.5 border-b border-slate-50 shrink-0">
        <button
          type="button"
          disabled={sending}
          onClick={() => void handleQuick('hint')}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-900 border border-amber-100 hover:bg-amber-100 disabled:opacity-50"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          Hint
        </button>
        <button
          type="button"
          disabled={sending}
          onClick={() => void handleQuick('explain_again')}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-sky-50 text-sky-900 border border-sky-100 hover:bg-sky-100 disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Explain again
        </button>
        <button
          type="button"
          disabled={sending}
          onClick={() => void handleQuick('test_me')}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-violet-50 text-violet-900 border border-violet-100 hover:bg-violet-100 disabled:opacity-50"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Test me
        </button>
        <button
          type="button"
          disabled={sending}
          onClick={() => void handleTeachbackInvite()}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-100 hover:bg-emerald-100 disabled:opacity-50"
        >
          <Brain className="w-3.5 h-3.5" />
          Teachback
        </button>
      </div>
      {teachbackAwaiting && (
        <p className="px-3 py-1.5 text-xs text-emerald-800 bg-emerald-50/80 border-b border-emerald-100">
          Now type your explanation in your own words — I’ll score it and give feedback.
        </p>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[95%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white rounded-br-sm'
                  : 'bg-slate-100 text-slate-800 rounded-bl-sm'
              }`}
            >
              {msg.role === 'assistant' && (
                <Sparkles className="w-3.5 h-3.5 inline mr-1 text-violet-500 opacity-80" />
              )}
              {msg.text}
            </div>
            {msg.role === 'assistant' && msg.meta && (
              <span className="mt-1 text-[10px] text-slate-400 px-1">{msg.meta}</span>
            )}
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-xl px-3 py-2 flex items-center gap-2 text-slate-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-slate-100 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), void handleSend())}
            placeholder={
              teachbackAwaiting
                ? 'Type your explanation in your own words…'
                : tab === 'hint'
                  ? 'Ask for a hint…'
                  : tab === 'quiz'
                    ? 'Quiz help…'
                    : 'Ask a question…'
            }
            className="flex-1 min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
            disabled={sending}
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={sending || !input.trim()}
            className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
