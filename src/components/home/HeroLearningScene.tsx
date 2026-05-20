'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Bot, Brain, Flame, Sparkles, Target, Timer, TrendingUp, Zap } from 'lucide-react';

/* —— Hooks —— */

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

function useTypewriter(text: string, enabled: boolean, msPerChar = 28) {
  const [out, setOut] = useState(enabled ? '' : text);
  useEffect(() => {
    if (!enabled) {
      setOut(text);
      return;
    }
    setOut('');
    const ids: number[] = [];
    for (let i = 0; i <= text.length; i++) {
      ids.push(window.setTimeout(() => setOut(text.slice(0, i)), 400 + i * msPerChar));
    }
    return () => ids.forEach(clearTimeout);
  }, [text, enabled, msPerChar]);
  return out;
}

/* —— Primitives —— */

function FxCard({
  accent = 'cyan',
  delay = 0,
  className = '',
  children,
}: {
  accent?: 'cyan' | 'violet' | 'emerald';
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`landing-hero-fx-card landing-hero-fx-card--${accent} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="landing-hero-fx-card-inner">{children}</div>
    </div>
  );
}

function SceneBackdrop() {
  return (
    <div className="landing-hero-premium-backdrop pointer-events-none" aria-hidden>
      <div className="landing-hero-premium-grid" />
      <div className="landing-hero-premium-orb landing-hero-premium-orb--cyan" />
      <div className="landing-hero-premium-orb landing-hero-premium-orb--violet" />
      <div className="landing-hero-premium-orb landing-hero-premium-orb--indigo" />
      {[6, 18, 32, 48, 64, 78, 92].map((left) => (
        <span
          key={left}
          className="landing-hero-premium-particle"
          style={{ left: `${left}%`, animationDelay: `${left * 35}ms` }}
        />
      ))}
      <div className="landing-hero-premium-scan" />
    </div>
  );
}

function MasteryRing({ percent, gradId }: { percent: number; gradId: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <div className="landing-hero-mastery-ring relative h-[3.75rem] w-[3.75rem] shrink-0">
      <div className="landing-hero-mastery-ring-glow" aria-hidden />
      <svg viewBox="0 0 60 60" className="relative h-full w-full -rotate-90" aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="4" />
        <circle
          cx="30"
          cy="30"
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-black tabular-nums text-cyan-300">
        {percent}%
      </span>
    </div>
  );
}

function AnimatedSparkline({ gradId }: { gradId: string }) {
  return (
    <svg viewBox="0 0 48 24" className="landing-hero-sparkline h-6 w-11 shrink-0" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <polyline
        points="2,18 14,13 24,10 34,6 44,3"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AnimatedBars({ heights = [38, 62, 48, 72] }: { heights?: number[] }) {
  return (
    <div className="landing-hero-bars flex h-8 items-end gap-1" aria-hidden>
      {heights.map((h, i) => (
        <div
          key={i}
          className="landing-hero-bars-item w-1.5 rounded-sm bg-gradient-to-t from-cyan-700 to-cyan-300"
          style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

function SkillSegments({ filled = 4, total = 5 }: { filled?: number; total?: number }) {
  return (
    <div className="mt-2.5 flex gap-1">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`landing-hero-segment h-1 flex-1 rounded-full ${
            i < filled ? 'landing-hero-segment--on' : 'bg-slate-700/60'
          }`}
          style={{ animationDelay: `${800 + i * 150}ms` }}
        />
      ))}
    </div>
  );
}

/* —— Panels —— */

function AiTutorPanel({ enabled, prompt }: { enabled: boolean; prompt: string }) {
  const line = useTypewriter(prompt, enabled, 26);

  return (
    <div className="landing-hero-tutor-panel">
      <div className="landing-hero-tutor-panel-inner">
        <div className="landing-hero-tutor-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
          <div className="landing-hero-tutor-avatar-glow" aria-hidden />
          <Bot className="relative h-[1.125rem] w-[1.125rem] text-cyan-300" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-[11px] font-semibold text-white">AI Tutor</span>
            <span className="landing-hero-live-dot inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-snug text-slate-400">
            <span className="text-slate-300">Hi, I&apos;m your coach — </span>
            <span className="text-cyan-200/95">{line}</span>
            {enabled && line.length < 26 && (
              <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-cyan-400 align-middle" />
            )}
          </p>
        </div>
        <div className="landing-hero-typing hidden shrink-0 gap-1 sm:flex" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="landing-hero-typing-dot" style={{ animationDelay: `${i * 180}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MasteryCard({ percent, railId }: { percent: number; railId: string }) {
  const ringGradId = `hero-mastery-ring-${railId}`;
  const sparkGradId = `hero-sparkline-${railId}`;

  return (
    <FxCard accent="cyan" delay={0} className="landing-hero-fx-card--hover">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="landing-hero-icon-wrap landing-hero-icon-wrap--cyan">
            <Target className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <p className="landing-hero-card-label">Concept mastery</p>
        </div>
        <span className="landing-hero-chip">+12%</span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <MasteryRing percent={percent} gradId={ringGradId} />
        <AnimatedSparkline gradId={sparkGradId} />
      </div>
      <p className="landing-hero-card-meta mt-2 flex items-center gap-1">
        <TrendingUp className="h-3 w-3 text-emerald-400" />
        Trending up this week
      </p>
    </FxCard>
  );
}

function StrengthCard() {
  return (
    <FxCard accent="violet" delay={100} className="landing-hero-fx-card--hover">
      <div className="flex items-center gap-2">
        <div className="landing-hero-icon-wrap landing-hero-icon-wrap--violet">
          <Brain className="h-3.5 w-3.5 text-violet-400" />
        </div>
        <p className="landing-hero-card-label">Your strength</p>
      </div>
      <p className="mt-2 text-[0.9375rem] font-semibold text-white">Logical thinking</p>
      <SkillSegments filled={4} />
      <p className="landing-hero-card-meta mt-2">Top 8% in cohort</p>
    </FxCard>
  );
}

function FocusCard({ mins }: { mins: number }) {
  return (
    <FxCard accent="emerald" delay={200} className="landing-hero-fx-card--hover">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="landing-hero-icon-wrap landing-hero-icon-wrap--emerald">
            <Timer className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="landing-hero-card-label">Focus today</p>
        </div>
        <Flame className="h-3.5 w-3.5 text-orange-400 landing-hero-flame-pulse" />
      </div>
      <div className="mt-2.5 flex items-end justify-between gap-2">
        <p className="text-xl font-bold tabular-nums text-white">
          {mins}
          <span className="ml-1 text-xs font-medium text-slate-500">mins</span>
        </p>
        <AnimatedBars heights={[35, 55, 42, 68]} />
      </div>
      <p className="landing-hero-card-meta mt-2 flex items-center gap-1">
        <Zap className="h-3 w-3 text-emerald-400/80" />
        7-day streak active
      </p>
    </FxCard>
  );
}

function StatsRail({ mastery, mins, railId }: { mastery: number; mins: number; railId: string }) {
  return (
    <div className="landing-hero-stats-rail">
      <div className="landing-hero-stats-bridge" aria-hidden />
      <div className="landing-hero-premium-stats flex flex-col gap-2.5">
        <div className="isit-float-delayed">
          <MasteryCard percent={mastery} railId={railId} />
        </div>
        <div className="isit-float-delayed-2">
          <StrengthCard />
        </div>
        <div className="isit-float-delayed-3">
          <FocusCard mins={mins} />
        </div>
      </div>
    </div>
  );
}

/**
 * Premium hero visual — unified ecosystem: portal + connected stats rail.
 */
type HeroLearningSceneProps = {
  tutorPrompt?: string;
};

export default function HeroLearningScene({ tutorPrompt }: HeroLearningSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const reduced = usePrefersReducedMotion();
  const motionEnabled = !reduced && inView;
  const prompt = tutorPrompt ?? 'What shall we learn today?';
  const mastery = useCountTo(85, motionEnabled ? 400 : 0, motionEnabled ? 1000 : 0, motionEnabled);
  const mins = useCountTo(92, motionEnabled ? 900 : 0, motionEnabled ? 750 : 0, motionEnabled);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduced) return;

    const ob = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { root: null, rootMargin: '80px 0px', threshold: 0.05 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [reduced]);

  return (
    <div ref={rootRef} className="landing-hero-premium relative w-full min-w-0">
      <div className="landing-hero-premium-ambient pointer-events-none" aria-hidden />

      <div className="landing-hero-ecosystem">
        <SceneBackdrop />

        <div className="landing-hero-ecosystem-badge" aria-hidden>
          <Sparkles className="h-3 w-3 text-cyan-400" />
          <span>Neural AI active</span>
        </div>

        <div className="landing-hero-visual-cluster">
          <div className="landing-hero-portal-zone">
            <AiTutorPanel enabled={motionEnabled} prompt={prompt} />
            <div className="landing-hero-portal-stack">
              <div className="landing-hero-premium-portal-ring landing-hero-premium-portal-ring--outer" aria-hidden />
              <div className="landing-hero-premium-portal-ring landing-hero-premium-portal-ring--inner" aria-hidden />
              <div className="landing-hero-portal-glow" aria-hidden />
              <div className="landing-hero-premium-portal-frame">
                <Image
                  src="/hero/hero-student-scene.png"
                  alt="Student learning with a glowing AI tutor on a tablet"
                  width={1200}
                  height={900}
                  priority
                  sizes="540px"
                  unoptimized
                  className="landing-hero-premium-portal-img"
                />
                <div className="landing-hero-premium-portal-shine" aria-hidden />
                <div className="landing-hero-portal-vignette" aria-hidden />
              </div>
            </div>
          </div>

          <StatsRail mastery={mastery} mins={mins} railId="cluster" />
        </div>
      </div>

      <div className="landing-hero-premium-stats--mobile mt-3 lg:hidden">
        <StatsRail mastery={mastery} mins={mins} railId="mobile" />
      </div>
    </div>
  );
}
