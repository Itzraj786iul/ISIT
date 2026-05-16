'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Bot, Brain, GraduationCap } from 'lucide-react';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return reduced;
}

function useTypewriter(text: string, startDelayMs: number, msPerChar: number, enabled: boolean) {
  const [out, setOut] = useState('');
  const timers = useRef<number[]>([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!enabled) {
      setOut(text);
      return;
    }
    setOut('');
    const start = window.setTimeout(() => {
      for (let i = 0; i <= text.length; i++) {
        const id = window.setTimeout(() => setOut(text.slice(0, i)), i * msPerChar);
        timers.current.push(id);
      }
    }, startDelayMs);
    timers.current.push(start);
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [text, startDelayMs, msPerChar, enabled]);

  return out;
}

function useCountTo(target: number, startDelayMs: number, durationMs: number, enabled: boolean) {
  const [n, setN] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setN(target);
      return;
    }
    let cancelled = false;
    setN(0);
    const startTimer = window.setTimeout(() => {
      const t0 = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const t = Math.min(1, (now - t0) / durationMs);
        const eased = 1 - (1 - t) ** 3;
        setN(Math.round(target * eased));
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
        else setN(target);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, startDelayMs);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, startDelayMs, durationMs, enabled]);

  return n;
}

function Glass({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}

const TUTOR_SNIPPET = 'I adapt to how you learn.';

/** Floating hero dashboard: typewriter lines, count-ups, staged segment fills. */
export default function HeroDashboardCards() {
  const reduced = usePrefersReducedMotion();
  const enabled = !reduced;

  const tutorLine = useTypewriter(TUTOR_SNIPPET, enabled ? 450 : 0, enabled ? 34 : 0, enabled);
  const masteryLabel = useTypewriter('CONCEPT MASTERY', enabled ? 200 : 0, enabled ? 22 : 0, enabled);
  const masteryFoot = useTypewriter('+12% this week', enabled ? 2200 : 0, enabled ? 28 : 0, enabled);
  const strengthLabel = useTypewriter('YOUR STRENGTH', enabled ? 900 : 0, enabled ? 24 : 0, enabled);
  const strengthTopic = useTypewriter('Logical Reasoning', enabled ? 1400 : 0, enabled ? 32 : 0, enabled);
  const focusLabel = useTypewriter("TODAY'S FOCUS", enabled ? 1800 : 0, enabled ? 24 : 0, enabled);
  const focusFoot = useTypewriter('7-day streak active', enabled ? 3200 : 0, enabled ? 30 : 0, enabled);

  const pct = useCountTo(85, enabled ? 1200 : 0, enabled ? 900 : 0, enabled);
  const mins = useCountTo(92, enabled ? 2600 : 0, enabled ? 800 : 0, enabled);

  const [segments, setSegments] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setSegments(4);
      return;
    }
    setSegments(0);
    const ids: number[] = [];
    const start = 1900;
    for (let s = 1; s <= 4; s++) {
      ids.push(window.setTimeout(() => setSegments(s), start + s * 220));
    }
    return () => ids.forEach(clearTimeout);
  }, [enabled]);

  return (
    <div className="relative mx-auto min-h-[380px] w-full max-w-lg lg:max-w-none">
      <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/[0.06] bg-gradient-to-br from-indigo-950/40 to-transparent" />

      <div className="absolute right-8 top-4 z-20 hidden sm:block">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
          <GraduationCap className="h-3.5 w-3.5" />
          Olympiad-ready
        </span>
      </div>

      <div className="absolute left-1/2 top-1/2 z-10 flex h-[min(100%,420px)] w-[min(100%,420px)] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <div className="landing-orbit-slow absolute h-72 w-72 rounded-full border border-cyan-400/10" />
        <div className="landing-orbit-slow landing-orbit-reverse absolute h-56 w-56 rounded-full border border-fuchsia-500/10" />
        <div className="landing-hero-glow-pulse absolute h-[340px] w-[340px] rounded-full bg-gradient-to-br from-violet-600/25 via-transparent to-cyan-500/20 blur-2xl" />
        <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-indigo-600 to-cyan-500 p-[3px] shadow-[0_0_60px_rgba(139,92,246,0.45)]">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0a0c18]">
            <Bot className="h-20 w-20 text-white" strokeWidth={1.25} />
          </div>
        </div>
      </div>

      <Glass className="isit-float-delayed absolute left-0 top-8 z-20 max-w-[220px] sm:left-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/30">
            <Bot className="h-4 w-4 text-sky-300" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">AI Tutor</p>
            <p className="text-[10px] text-emerald-400">● Typing...</p>
          </div>
        </div>
        <p className="mt-2 min-h-[2.5rem] text-[11px] leading-snug text-slate-300">
          {tutorLine}
          {enabled && tutorLine.length < TUTOR_SNIPPET.length && (
            <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-cyan-400 align-middle" aria-hidden />
          )}
        </p>
      </Glass>

      <Glass className="isit-float-delayed-3 absolute right-0 top-28 z-20 w-[210px] sm:right-4">
        <p className="min-h-[14px] text-[10px] font-semibold uppercase tracking-wider text-slate-500">{masteryLabel}</p>
        <p className="mt-1 bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-3xl font-black tabular-nums text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.35)]">
          {pct}%
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 min-h-[14px] text-[11px] font-medium text-emerald-400">{masteryFoot}</p>
      </Glass>

      <Glass className="isit-float-delayed-2 absolute bottom-16 left-4 z-20 max-w-[240px]">
        <p className="min-h-[14px] text-[10px] font-semibold uppercase tracking-wider text-slate-500">{strengthLabel}</p>
        <div className="mt-2 flex items-center gap-2">
          <Brain className="h-4 w-4 shrink-0 text-violet-400" />
          <span className="min-h-[1.25rem] text-sm font-semibold text-white">{strengthTopic}</span>
        </div>
        <div className="mt-3 flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i <= segments ? 'bg-violet-500/80 shadow-[0_0_8px_rgba(139,92,246,0.6)]' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </Glass>

      <Glass className="animate-float-soft absolute bottom-8 right-2 z-20 w-[190px] sm:right-8">
        <p className="min-h-[14px] text-[10px] font-semibold uppercase tracking-wider text-slate-500">{focusLabel}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-white">
          {mins} mins <span className="text-lg">🔥</span>
        </p>
        <p className="min-h-[14px] text-[11px] text-slate-500">{focusFoot}</p>
      </Glass>
    </div>
  );
}
