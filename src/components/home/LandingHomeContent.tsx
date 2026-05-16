'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  ChevronRight,
  Code2,
  GraduationCap,
  Layers,
  Lightbulb,
  Megaphone,
  Microscope,
  Palette,
  Play,
  Rocket,
  Send,
  Shield,
  Sparkles,
  Star,
  Target,
  Telescope,
  TrendingUp,
  Wrench,
  Zap,
} from 'lucide-react';
import type { I18nKey } from '@/lib/t';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';
import HeroDashboardCards from '@/components/home/HeroDashboardCards';

const PARTNER_NAMES = ['Atal Innovation', 'MIT Media Lab', 'NCERT', 'STEM India', 'UNESCO MGIEP', 'CBSE Board'] as const;

const TESTIMONIAL_CARDS = [
  {
    quote: 'The AI tutor explains everything so well. I finally understand the topics I used to fear.',
    name: 'Arjun Sharma',
    meta: 'Grade 8 • Delhi Public School',
    initial: 'A',
    color: 'from-violet-600 to-purple-500',
  },
  {
    quote: "ISIC's programs are helping my child think independently and build real skills.",
    name: 'Priya Mehta',
    meta: 'Parent of two',
    initial: 'P',
    color: 'from-orange-500 to-pink-500',
  },
  {
    quote: 'The AI-first approach aligned with curriculum is a game changer for schools.',
    name: 'Ramesh Kumar',
    meta: 'Principal',
    initial: 'R',
    color: 'from-blue-600 to-cyan-500',
  },
] as const;

type Props = {
  authLoading: boolean;
  isAuthed: boolean;
  primaryCtaHref: string;
  primaryCtaLabel: string;
  tr: (key: I18nKey) => string;
};

function LandingBadge({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-slate-200 backdrop-blur-sm sm:px-4 sm:text-xs ${className}`}
    >
      {children}
    </span>
  );
}

function GlassCard({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}

const STATS_COUNT_CONFIG = [
  { key: 'students', end: 10, format: (n: number) => `${n}K+`, label: 'Students learning', gradient: false },
  { key: 'schools', end: 200, format: (n: number) => `${n}+`, label: 'Schools partnered', gradient: false },
  { key: 'mentors', end: 50, format: (n: number) => `${n}+`, label: 'Expert mentors', gradient: false },
  { key: 'projects', end: 1, format: (n: number) => `${n}K+`, label: 'Projects built', gradient: false },
  { key: 'support', end: 24, format: (n: number) => `${n}/7`, label: 'AI Tutor support', gradient: true },
] as const;

function LandingStatsCountUp() {
  const [values, setValues] = useState<number[]>(() => STATS_COUNT_CONFIG.map(() => 0));
  const ref = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const durationMs = 1400;
      const t0 = performance.now();

      const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

      const tick = (now: number) => {
        const raw = Math.min(1, (now - t0) / durationMs);
        const eased = easeOutCubic(raw);
        setValues(STATS_COUNT_CONFIG.map((s) => Math.round(s.end * eased)));
        if (raw < 1) requestAnimationFrame(tick);
        else setValues(STATS_COUNT_CONFIG.map((s) => s.end));
      };
      requestAnimationFrame(tick);
    };

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValues(STATS_COUNT_CONFIG.map((s) => s.end));
      startedRef.current = true;
      return;
    }

    const ob = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            start();
            ob.disconnect();
            break;
          }
        }
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.15 }
    );
    ob.observe(el);

    const onPointerEnter = () => start();
    el.addEventListener('mouseenter', onPointerEnter);

    return () => {
      ob.disconnect();
      el.removeEventListener('mouseenter', onPointerEnter);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="grid flex-1 grid-cols-2 gap-6 text-center sm:grid-cols-5 sm:gap-4"
      aria-label="Platform statistics"
    >
      {STATS_COUNT_CONFIG.map((s, i) => (
        <div key={s.key} className="min-w-0">
          <p
            className={`tabular-nums text-2xl font-black sm:text-3xl ${
              s.gradient ? 'isit-gradient-text-strong' : 'text-white'
            }`}
          >
            {s.format(values[i] ?? 0)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function TestimonialSlide({ t }: { t: (typeof TESTIMONIAL_CARDS)[number] }) {
  return (
    <div className="relative w-[min(100vw-3rem,380px)] shrink-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition hover:border-cyan-500/20">
      <span className="pointer-events-none absolute right-4 top-2 text-7xl font-serif leading-none text-white/[0.04]">&quot;</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="relative z-10 mt-4 text-sm leading-relaxed text-slate-200">&quot;{t.quote}&quot;</p>
      <div className="mt-6 flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-white`}
        >
          {t.initial}
        </span>
        <div>
          <p className="font-bold text-white">{t.name}</p>
          <p className="text-xs text-slate-500">{t.meta}</p>
        </div>
      </div>
    </div>
  );
}

export default function LandingHomeContent({
  authLoading,
  isAuthed,
  primaryCtaHref,
  primaryCtaLabel,
  tr,
}: Props) {
  const [faqOpen, setFaqOpen] = useState(0);

  const tutorCtaHref = useMemo(() => (isAuthed ? '/ai-tutor' : '/signup'), [isAuthed]);
  const tutorCtaLabel = useMemo(() => (isAuthed ? tr('askAiTutor') : 'Start with AI Tutor — Free'), [isAuthed, tr]);

  const pillPrimary =
    'inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-600 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(99,102,241,0.45)] transition hover:brightness-110 active:scale-[0.98]';
  const pillGhost =
    'inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/[0.08]';

  return (
    <div className="isit-landing-replica text-slate-200">
      {/* Hero */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-24">
        <div className="isit-landing-glow-orb -right-24 top-0 h-80 w-80 bg-purple-600/40" aria-hidden />
        <div className="isit-landing-glow-orb left-1/4 bottom-0 h-64 w-64 bg-cyan-500/30" aria-hidden />

        <div className="relative z-10 mx-auto grid max-w-7xl items-start gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-10 xl:gap-12">
          <div className="max-w-xl space-y-4 sm:space-y-5 lg:max-w-none">
            <div className="isit-hero-col flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <LandingBadge>
                  <Shield className="h-3.5 w-3.5 text-cyan-400" />
                  ISO 9001 · NEP-2020 Aligned
                </LandingBadge>
                <LandingBadge>
                  <Award className="h-3.5 w-3.5 text-fuchsia-400" />
                  EdTech Innovator 2025
                </LandingBadge>
              </div>
              <LandingBadge className="w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <Activity className="h-3.5 w-3.5 text-cyan-400" />
                Live · 10,247 learners online
              </LandingBadge>
            </div>

            <h1 className="isit-hero-main-title text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl md:text-6xl lg:text-[3.25rem] lg:leading-[1.05] xl:text-7xl xl:leading-[1.02]">
              <span className="block">
                Where every child{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-cyan-200 bg-clip-text text-transparent">discovers genius</span>
                  <svg
                    className="pointer-events-none absolute -bottom-1 left-0 w-full max-w-[min(100%,320px)] sm:-bottom-1.5"
                    viewBox="0 0 280 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path
                      d="M4 8C48 2 120 2 180 4C220 5 252 7 276 9"
                      stroke="url(#hero-u1)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="hero-u1" x1="0" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#e879f9" />
                        <stop offset="1" stopColor="#818cf8" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </span>
              <span className="mt-1 block text-white sm:mt-2">within them.</span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              India&apos;s future-first ed-tech ecosystem combining <strong className="font-semibold text-white">AI mentorship</strong>,{' '}
              <strong className="font-semibold text-white">neuroscience</strong> and{' '}
              <strong className="font-semibold text-white">real-world innovation</strong> — so students don&apos;t just learn, they think, create and
              lead.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              {authLoading ? (
                <div className="h-12 w-56 animate-pulse rounded-full bg-white/10" />
              ) : (
                <Link href={tutorCtaHref} className={pillPrimary}>
                  <Bot className="h-4 w-4 shrink-0" />
                  {tutorCtaLabel}
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-90" />
                </Link>
              )}
              <Link href="/watch-demo" className={pillGhost}>
                <Play className="h-4 w-4 fill-current text-cyan-300" />
                Watch 90-second demo
              </Link>
            </div>

            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex -space-x-2">
                  {['A', 'P', 'R', 'S', 'M'].map((l, i) => (
                    <span
                      key={l}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#05070a] text-xs font-bold text-white"
                      style={{
                        background: ['#2563eb', '#14b8a6', '#1e3a5f', '#ec4899', '#f97316'][i % 5],
                      }}
                    >
                      {l}
                    </span>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-1 text-sm font-bold text-white">4.9 / 5</span>
                  </div>
                  <p className="text-xs text-slate-500">Trusted by 10,000+ families · 200+ schools</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">✓</span>
                CBSE & ICSE aligned
              </div>
            </div>
          </div>

          {/* Hero visual — animated dashboard cards */}
          <HeroDashboardCards />
        </div>

        <RevealOnView delayMs={40} className="relative z-10 mx-auto mt-16 max-w-6xl px-4 sm:px-6">
          <p className="mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">Recognised & accredited by</p>
          <div className="landing-marquee-mask">
            <div className="landing-marquee-track items-center">
              {[0, 1, 2].flatMap((cycle) =>
                PARTNER_NAMES.map((name) => (
                  <span
                    key={`${name}-${cycle}`}
                    className="whitespace-nowrap text-xs font-medium text-slate-500 opacity-90 sm:text-sm"
                  >
                    {name}
                  </span>
                ))
              )}
            </div>
          </div>
        </RevealOnView>
      </section>

      {/* Feature bar */}
      <section className="border-y border-white/[0.06] bg-black/20 py-4">
        <RevealOnView>
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 text-[11px] text-cyan-300/90 sm:gap-x-6 sm:px-6 sm:text-xs">
            {[
              { icon: Brain, label: 'Neuroscience-Backed' },
              { icon: Layers, label: 'CBSE & ICSE Aligned' },
              { icon: Rocket, label: 'Real-World Projects' },
              { icon: Code2, label: 'Coding & Robotics' },
              { icon: Microscope, label: 'Curiosity-First Method' },
            ].map(({ icon: Icon, label }, i) => (
              <div key={label} className="group flex items-center gap-2 transition hover:text-cyan-200">
                {i > 0 && <span className="hidden text-slate-600 sm:inline">·</span>}
                <Icon className="h-3.5 w-3.5 shrink-0 text-cyan-400 transition group-hover:scale-110" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </RevealOnView>
      </section>

      {/* Five feature cards */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <RevealStagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { icon: Bot, title: 'AI Tutor', desc: '24/7 doubt solving & personalised guidance', highlight: false },
              { icon: BarChart3, title: 'Smart Learning', desc: 'Lessons adapt to your pace and style', highlight: true },
              { icon: Zap, title: 'Instant Feedback', desc: 'Understand mistakes & improve faster', highlight: false },
              { icon: TrendingUp, title: 'Track Progress', desc: 'See growth live with smart analytics', highlight: false },
              { icon: Sparkles, title: 'Future Skills', desc: 'From coding to creativity — real skills', highlight: false },
            ].map(({ icon: Icon, title, desc, highlight }) => (
              <div
                key={title}
                className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 ${
                  highlight
                    ? 'border-cyan-400/40 bg-cyan-500/[0.06] shadow-[0_0_30px_rgba(34,211,238,0.12)]'
                    : 'border-white/[0.06] bg-white/[0.02]'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
              </div>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* AI Tutor + chat */}
      <section className="py-12 sm:py-20">
        <RevealOnView className="mx-auto grid max-w-7xl items-stretch gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <div className="flex h-full min-h-[22rem] flex-col lg:min-h-0">
            <div className="motion-safe:transition motion-safe:hover:border-cyan-500/25 motion-safe:hover:shadow-[0_0_48px_rgba(34,211,238,0.1)] flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-b from-slate-950/90 to-[#070a12] shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] bg-slate-950/40 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white">ISIC AI Tutor</p>
                    <p className="text-xs text-emerald-400">● Online · Ready to help</p>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] text-slate-500">GPT-powered</span>
              </div>
              <div className="landing-chat-stagger flex min-h-0 flex-1 flex-col bg-slate-950/40 px-5 py-5">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Bot className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
                    <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-white/[0.06] bg-slate-900/80 px-4 py-3 text-sm text-slate-200">
                      Hi! I&apos;m your personal AI Tutor. What shall we learn today? 👋
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <div className="max-w-[90%] rounded-2xl rounded-tr-sm border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-50">
                      I&apos;m struggling with quadratic equations 🧐
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Bot className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
                    <div className="max-w-[95%] rounded-2xl rounded-tl-sm border border-white/[0.06] bg-slate-900/80 px-4 py-3 text-sm leading-relaxed text-slate-200">
                      No worries! Let&apos;s use a real example — rocket trajectories! 🚀 A rocket&apos;s path follows ax² + bx + c. Let&apos;s break that down
                      step by step...
                    </div>
                  </div>
                </div>
                <div className="min-h-6 flex-1" aria-hidden />
              </div>
              <div className="shrink-0 border-t border-white/[0.06] bg-slate-950/50 p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    placeholder="Ask anything... try 'Explain photosynthesis like I'm 10'"
                    className="min-h-11 flex-1 rounded-xl border border-white/[0.06] bg-slate-900/70 px-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/25"
                  />
                  <button
                    type="button"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-600/40"
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 h-full flex-col justify-start lg:pl-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">⚡ The core differentiator</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Meet your <span className="isit-gradient-text-strong">personal AI Tutor</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-400">
              A hyper-personalised learning companion that adapts to your child&apos;s pace, thinking style and curiosity — anytime, anywhere.
            </p>
            <RevealStagger className="mt-8 space-y-4">
              {[
                {
                  icon: Brain,
                  title: 'Adaptive Intelligence',
                  desc: 'Understands how each student learns and dynamically adjusts explanations, tone and depth in real time.',
                },
                {
                  icon: Zap,
                  title: 'Instant Doubt Resolution',
                  desc: 'No waiting. Get step-by-step explanations on any concept, any time — even at 2am before an exam.',
                },
                {
                  icon: BarChart3,
                  title: 'Progress Tracking',
                  desc: 'Visual dashboards show mastery scores, learning streaks and where to focus next.',
                },
                {
                  icon: Target,
                  title: 'Goal-Based Roadmaps',
                  desc: 'Board exams, Olympiads, or entrepreneurship — AI builds a custom learning path for your child.',
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10">
                    <Icon className="h-5 w-5 text-sky-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">{desc}</p>
                  </div>
                </div>
              ))}
            </RevealStagger>
          </div>
        </RevealOnView>
      </section>

      {/* Stats + CTA */}
      <section className="pb-16 sm:pb-24">
        <RevealOnView delayMs={60} className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-8 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md lg:flex-row lg:items-center lg:justify-between lg:p-8">
            <LandingStatsCountUp />
            <div className="shrink-0 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/80 to-indigo-950/60 p-5 shadow-[0_0_40px_rgba(124,58,237,0.2)] motion-safe:transition motion-safe:hover:shadow-[0_0_50px_rgba(124,58,237,0.28)]">
              <p className="max-w-[220px] text-sm font-medium leading-snug text-white">Start your child&apos;s learning journey today</p>
              {authLoading ? (
                <div className="mt-4 h-10 w-36 animate-pulse rounded-full bg-white/10" />
              ) : (
                <Link
                  href={tutorCtaHref}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-violet-400"
                >
                  <Bot className="h-4 w-4" />
                  Try AI Tutor
                </Link>
              )}
            </div>
          </div>
        </RevealOnView>
      </section>

      {/* Explore programs */}
      <section className="py-16 sm:py-24">
        <RevealOnView className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Explore our programs</p>
              <h2 className="mt-2 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Beyond textbooks.
                <br />
                Building <span className="isit-gradient-text-strong">skills, mindset & curiosity.</span>
              </h2>
            </div>
            <Link href="/courses" className={pillGhost + ' shrink-0 self-start lg:self-auto'}>
              View all programs
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <RevealStagger className="grid gap-6 md:grid-cols-3">
            {[
              {
                tag: 'Build · Code · Innovate',
                title: 'Robotics & Tech',
                desc: 'Hands-on robotics, coding, AI and IoT projects for the next generation of engineers.',
                gradient: 'from-blue-900 via-blue-600 to-sky-400',
                icon: Bot,
                href: '/courses',
              },
              {
                tag: 'Navigate · Create · Safe',
                title: 'Digital Literacy',
                desc: 'Essential digital fluency for the modern, hyper-connected world.',
                gradient: 'from-teal-700 via-teal-500 to-emerald-300',
                icon: GraduationCap,
                href: '/courses',
              },
              {
                tag: 'Speak · Influence · Lead',
                title: 'Marketing & Communication',
                desc: 'Communication, branding and storytelling skills for future changemakers.',
                gradient: 'from-fuchsia-600 via-rose-500 to-amber-400',
                icon: Megaphone,
                href: '/courses',
              },
            ].map(({ tag, title, desc, gradient, icon: Icon, href }) => (
              <Link key={title} href={href} className="group block overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0c14] transition hover:border-cyan-400/25">
                <div className={`relative h-44 bg-gradient-to-br ${gradient} p-4`}>
                  <span className="inline-block rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm">{tag}</span>
                  <Icon className="absolute bottom-4 right-4 h-16 w-16 text-white/90 transition group-hover:scale-105" strokeWidth={1.25} />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{desc}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-cyan-400">
                    Explore program <ChevronRight className="ml-0.5 h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </RevealStagger>
        </RevealOnView>
      </section>

      {/* Second program row */}
      <section className="pb-16 sm:pb-24">
        <RevealOnView className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 flex justify-center">
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-400/80">⭐ Must-enroll core courses</p>
          </div>
          <RevealStagger className="grid gap-6 md:grid-cols-3">
            {[
              {
                tag: 'Think · Plan · Build',
                title: 'Entrepreneurship Basics',
                desc: 'Learn business, finance and startup fundamentals. Run your first mini-venture.',
                gradient: 'from-violet-700 via-fuchsia-600 to-pink-500',
                icon: Rocket,
                glow: false,
              },
              {
                tag: 'Learn · Practice · Master',
                title: 'Academic Support with AI',
                desc: 'AI-powered support across all school subjects — CBSE & ICSE aligned.',
                gradient: 'from-sky-500 via-blue-600 to-indigo-700',
                icon: BookOpen,
                glow: true,
              },
              {
                tag: 'Design · Imagine · Make',
                title: 'Creativity & Innovation Labs',
                desc: 'Design thinking and hands-on creative projects that build original thinkers.',
                gradient: 'from-orange-500 via-amber-400 to-rose-300',
                icon: Palette,
                glow: false,
              },
            ].map(({ tag, title, desc, gradient, icon: Icon, glow }) => (
              <Link
                key={title}
                href="/courses"
                className={`group block overflow-hidden rounded-2xl border bg-[#0a0c14] transition hover:-translate-y-0.5 ${
                  glow ? 'border-cyan-400/35 shadow-[0_20px_50px_rgba(34,211,238,0.12)]' : 'border-white/[0.06] hover:border-white/15'
                }`}
              >
                <div className={`relative h-44 bg-gradient-to-br ${gradient} p-4`}>
                  <span className="inline-block rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm">{tag}</span>
                  <Icon className="absolute bottom-4 right-4 h-16 w-16 text-white/90" strokeWidth={1.25} />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{desc}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-cyan-400">
                    Explore program <ChevronRight className="ml-0.5 h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </RevealStagger>
        </RevealOnView>
      </section>

      {/* Core courses 4-up */}
      <section className="py-16 sm:py-24">
        <RevealOnView className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-400/90">⭐ Must-enroll core courses</p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Learn how you <span className="isit-gradient-text-strong">learn</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Four foundational courses that unlock every student&apos;s potential — built on neuroscience and experiential learning.
          </p>

          <RevealStagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: '01',
                lab: 'Brain Lab',
                title: 'How the Brain Works',
                desc: 'Understand your brain to learn and perform better. Discover memory, focus and the neuroscience of...',
                gradient: 'from-violet-600 to-purple-400',
                icon: Brain,
              },
              {
                n: '02',
                lab: 'Learning Intelligence Lab',
                title: 'How Learning Happens',
                desc: 'Science-backed methods to make learning easy — spaced repetition, retrieval practice, flow states and...',
                gradient: 'from-blue-600 to-cyan-400',
                icon: BookOpen,
              },
              {
                n: '03',
                lab: 'Creative Thinking Lab',
                title: 'The Art of Imagination',
                desc: '...creativity and turn ideas into... activate lateral thinking and generate novel ideas on demand.',
                gradient: 'from-orange-500 to-fuchsia-500',
                icon: Lightbulb,
              },
              {
                n: '04',
                lab: 'Action & Exploration Lab',
                title: 'Active Learning Practices',
                desc: 'Learn by doing, questioning and exploring. Move from passive... to deep understanding through action.',
                gradient: 'from-emerald-500 to-teal-400',
                icon: Target,
              },
            ].map(({ n, lab, title, desc, gradient, icon: Icon }) => (
              <Link key={n} href="/courses" className="group block overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0a0c14] text-left transition hover:border-cyan-400/20">
                <div className={`relative h-40 bg-gradient-to-br ${gradient} px-4 pt-4`}>
                  <span className="absolute right-3 top-2 text-5xl font-black text-white/15">{n}</span>
                  <Icon className="absolute bottom-3 left-1/2 h-14 w-14 -translate-x-1/2 text-white/95" strokeWidth={1.15} />
                </div>
                <div className="p-5">
                  <span className="inline-block rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-medium text-slate-300">{lab}</span>
                  <h3 className="mt-3 text-lg font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
                </div>
              </Link>
            ))}
          </RevealStagger>
        </RevealOnView>
      </section>

      {/* Student journey */}
      <section className="py-16 sm:py-24">
        <RevealOnView className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400/90">The ISIC student journey</p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            A path designed for <span className="isit-gradient-text-strong">real transformation</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-400 sm:text-base">
            Every student follows a structured yet flexible path — from curious beginner to confident innovator.
          </p>

          <div className="relative mt-16">
            <div className="absolute left-[10%] right-[10%] top-8 hidden h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent md:block" aria-hidden />
            <RevealStagger className="grid gap-10 md:grid-cols-5 md:gap-4">
              {[
                { step: 1, icon: Telescope, title: 'Discover', desc: 'Explore interests and identify learning goals' },
                { step: 2, icon: BookOpen, title: 'Learn', desc: 'Engage with AI & curated concepts at your pace' },
                { step: 3, icon: Target, title: 'Practice', desc: "Solve, experiment and apply what you've learned" },
                { step: 4, icon: Wrench, title: 'Create', desc: 'Build projects and bring ideas to life' },
                { step: 5, icon: Rocket, title: 'Grow', desc: 'Develop confidence for future success' },
              ].map(({ step, icon: Icon, title, desc }) => (
                <div key={step} className="group relative flex flex-col items-center">
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-500/20 bg-slate-900/90 shadow-[0_0_24px_rgba(34,211,238,0.15)] transition duration-300 group-hover:scale-105 group-hover:border-cyan-400/40 group-hover:shadow-[0_0_32px_rgba(34,211,238,0.25)]">
                    <Icon className="h-7 w-7 text-cyan-300" strokeWidth={1.25} />
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-[11px] font-bold text-white">
                      {step}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-bold text-white">{title}</h3>
                  <p className="mt-2 max-w-[200px] text-xs leading-relaxed text-slate-500">{desc}</p>
                </div>
              ))}
            </RevealStagger>
          </div>
        </RevealOnView>
      </section>

      {/* Testimonials */}
      <section className="overflow-x-hidden py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <RevealOnView className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Loved by students • Trusted by parents</p>
              <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                What our <span className="isit-gradient-text">community says</span>
              </h2>
            </div>
            <Link href="/stories" className={pillGhost + ' shrink-0 self-start'}>
              View all stories
              <ChevronRight className="h-4 w-4" />
            </Link>
          </RevealOnView>

          <div className="landing-marquee-mask -mx-4 py-2 sm:mx-0">
            <div className="landing-marquee-track items-stretch gap-6 px-4 sm:gap-8">
              {[0, 1, 2].flatMap((cycle) =>
                TESTIMONIAL_CARDS.map((t) => <TestimonialSlide key={`${t.name}-${cycle}`} t={t} />)
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:pb-24">
        <RevealOnView className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400/90">Got questions?</p>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Everything you need to know</h2>
          <p className="mt-3 text-sm text-slate-400">Can&apos;t find what you&apos;re looking for? Our team is one message away.</p>

          <RevealStagger className="mt-10 space-y-3 text-left">
            {[
              {
                q: 'What age groups is ISIC designed for?',
                a: 'Our programs are tailored for students from Grade 4 to Grade 12, with age-appropriate learning paths, projects and AI guidance.',
              },
              { q: 'How does the AI Tutor work?', a: "The AI Tutor adapts to your child's pace and style, offering hints, step-by-step explanations, and practice tied to their curriculum goals." },
              { q: 'Is ISIC aligned with CBSE / ICSE curriculum?', a: 'Yes — content and practice are designed to complement CBSE and ICSE learning outcomes, with clear topic mapping.' },
              { q: 'Are the programs available online, offline or both?', a: 'ISIC is built for online-first learning with flexible schedules; check with us for school or cohort-based offline partnerships.' },
            ].map((item, i) => {
              const open = faqOpen === i;
              return (
                <div key={item.q} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => setFaqOpen(open ? -1 : i)}
                    className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-white/[0.03]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/40 bg-sky-500/10 text-sky-300">
                      ?
                    </span>
                    <span className="flex-1 font-semibold text-white">{item.q}</span>
                    <span className="text-slate-400">{open ? '−' : '+'}</span>
                  </button>
                  {open && <p className="border-t border-white/[0.06] px-4 pb-4 pl-[3.25rem] pt-3 text-sm leading-relaxed text-slate-400">{item.a}</p>}
                </div>
              );
            })}
          </RevealStagger>
        </RevealOnView>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <RevealOnView className="mx-auto max-w-4xl rounded-[2rem] border border-white/[0.1] bg-gradient-to-b from-slate-900/90 to-[#060818] p-8 text-center shadow-[0_0_80px_rgba(79,70,229,0.15)] sm:p-12">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-100">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            14-day free trial · No card needed
          </div>
          <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Start learning with
            <br />
            <span className="isit-gradient-text-strong">confidence & curiosity</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Join 10,000+ students already building future skills through AI, creativity and innovation. Your child&apos;s personal AI Tutor is
            waiting.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {authLoading ? (
              <div className="h-12 w-52 animate-pulse rounded-full bg-white/10" />
            ) : (
              <Link href={tutorCtaHref} className={pillPrimary}>
                <Bot className="h-4 w-4" />
                Try AI Tutor — It&apos;s free
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
            <Link href="/contact" className={pillGhost}>
              Talk to an advisor
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            {['100% safe & ad-free', 'Cancel anytime', 'Parent dashboard included'].map((x) => (
              <span key={x} className="inline-flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                {x}
              </span>
            ))}
          </div>
        </RevealOnView>

        {!authLoading && isAuthed && (
          <p className="mt-8 text-center text-sm text-slate-500">
            <Link href={primaryCtaHref} className="text-cyan-400 underline-offset-4 hover:underline">
              {primaryCtaLabel}
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
