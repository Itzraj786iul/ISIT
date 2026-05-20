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
import { useT } from '@/lib/t';
import { useLanguage } from '@/lib/language-context';
import {
  PARTNER_NAMES,
  buildFaq,
  buildFeatureBar,
  buildFeatureCards,
  buildFinalTrust,
  buildJourneySteps,
  buildProgramsRow1,
  buildProgramsRow2,
  buildStatsConfig,
  buildTestimonials,
  buildTutorFeatures,
} from '@/lib/landing-content';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';
import HeroLearningScene from '@/components/home/HeroLearningScene';
import LandingPublishedSubjects from '@/components/home/LandingPublishedSubjects';

type Props = {
  authLoading: boolean;
  isAuthed: boolean;
  primaryCtaHref: string;
  primaryCtaLabel: string;
};

function LandingBadge({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`landing-badge sm:text-xs ${className}`}>
      {children}
    </span>
  );
}

function GlassCard({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`landing-glass p-4 ${className}`}
    >
      {children}
    </div>
  );
}

type StatConfig = ReturnType<typeof buildStatsConfig>;

function LandingStatsCountUp({ stats, ariaLabel }: { stats: StatConfig; ariaLabel: string }) {
  const [values, setValues] = useState<number[]>(() => stats.map(() => 0));
  const ref = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const start = () => {
      if (startedRef.current) return;
      if (document.documentElement.classList.contains('is-scrolling')) return;
      startedRef.current = true;
      const durationMs = 1400;
      const t0 = performance.now();

      const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

      const tick = (now: number) => {
        const raw = Math.min(1, (now - t0) / durationMs);
        const eased = easeOutCubic(raw);
        setValues(stats.map((s) => Math.round(s.end * eased)));
        if (raw < 1) requestAnimationFrame(tick);
        else setValues(stats.map((s) => s.end));
      };
      requestAnimationFrame(tick);
    };

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValues(stats.map((s) => s.end));
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
  }, [stats]);

  return (
    <div
      ref={ref}
      className="grid flex-1 grid-cols-2 gap-4 text-center sm:grid-cols-3 sm:gap-4 lg:grid-cols-5"
      aria-label={ariaLabel}
    >
      {stats.map((s, i) => (
        <div key={s.key} className="min-w-0">
          <p
            className={`tabular-nums text-2xl font-black sm:text-3xl ${
              s.gradient ? 'isit-gradient-text-strong' : 'text-slate-900 dark:text-white'
            }`}
          >
            {s.format(values[i] ?? 0)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function TestimonialSlide({ t }: { t: ReturnType<typeof buildTestimonials>[number] }) {
  return (
    <div className="isit-testimonial-slide relative w-[min(100vw-3rem,380px)] shrink-0 overflow-hidden landing-glass p-5 transition hover:border-sky-300 dark:border-cyan-500/20 sm:p-6">
      <span className="pointer-events-none absolute right-4 top-2 text-7xl font-serif leading-none text-white/[0.04]">&quot;</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="relative z-10 mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-200">&quot;{t.quote}&quot;</p>
      <div className="mt-6 flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-white`}
        >
          {t.initial}
        </span>
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{t.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.meta}</p>
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
}: Props) {
  const tr = useT();
  const { language } = useLanguage();
  const [faqOpen, setFaqOpen] = useState(0);

  const statsConfig = useMemo(() => buildStatsConfig(tr), [tr, language]);
  const testimonials = useMemo(() => buildTestimonials(tr), [tr, language]);
  const featureBar = useMemo(() => buildFeatureBar(tr), [tr, language]);
  const featureCards = useMemo(() => buildFeatureCards(tr), [tr, language]);
  const tutorFeatures = useMemo(() => buildTutorFeatures(tr), [tr, language]);
  const programsRow1 = useMemo(() => buildProgramsRow1(tr), [tr, language]);
  const programsRow2 = useMemo(() => buildProgramsRow2(tr), [tr, language]);
  const journeySteps = useMemo(() => buildJourneySteps(tr), [tr, language]);
  const faqItems = useMemo(() => buildFaq(tr), [tr, language]);
  const finalTrust = useMemo(() => buildFinalTrust(tr), [tr, language]);

  const tutorCtaHref = useMemo(() => (isAuthed ? '/ai-tutor' : '/signup'), [isAuthed]);
  const tutorCtaLabel = useMemo(
    () => (isAuthed ? tr('askAiTutor') : tr('landingHeroStartTutorFree')),
    [isAuthed, tr, language]
  );

  const pillPrimary =
    'isit-landing-pill-primary inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-600 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(99,102,241,0.45)] transition hover:brightness-110 active:scale-[0.98] sm:w-auto';
  const pillGhost =
    'isit-landing-pill-ghost landing-pill-ghost inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition active:scale-[0.98] sm:w-auto';

  return (
    <div className="isit-landing-replica isit-text-primary">
      {/* Hero */}
      <section className="isit-landing-hero relative overflow-hidden pb-14 pt-3 sm:pb-20 sm:pt-5 lg:pb-24">
        <div className="isit-landing-glow-orb -right-24 top-0 h-80 w-80 bg-purple-600/40" aria-hidden />
        <div className="isit-landing-glow-orb left-1/4 bottom-0 h-64 w-64 bg-cyan-500/30" aria-hidden />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-10 xl:gap-12">
          <div className="isit-hero-copy max-w-xl space-y-3 sm:space-y-4 lg:max-w-[34rem]">
            <div className="isit-hero-col flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <LandingBadge>
                  <Shield className="h-3.5 w-3.5 text-cyan-400" />
                  {tr('landingHeroBadgeIso')}
                </LandingBadge>
                <LandingBadge>
                  <Award className="h-3.5 w-3.5 text-fuchsia-400" />
                  {tr('landingHeroBadgeAward')}
                </LandingBadge>
              </div>
              <LandingBadge className="w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <Activity className="h-3.5 w-3.5 text-cyan-400" />
                {tr('landingHeroLive')}
              </LandingBadge>
            </div>

            <h1 className="isit-hero-main-title text-[clamp(1.5rem,5.5vw,1.75rem)] font-bold leading-[1.15] tracking-tight sm:text-4xl sm:leading-[1.1] md:text-[2.5rem] lg:text-[2.75rem] lg:leading-[1.08] xl:text-[3rem] xl:leading-[1.06]">
              <span className="block">
                {tr('landingHeroTitleDiscover')}{' '}
                <span className="relative inline-block">
                  <span className="landing-hero-gradient-word">{tr('landingHeroTitleGenius')}</span>
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
              <span className="mt-1 block text-slate-900 dark:text-white sm:mt-2">{tr('landingHeroTitleWithin')}</span>
            </h1>

            <p className="max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[0.9375rem] sm:leading-relaxed lg:text-base">
              {tr('landingHeroLeadPrefix')}{' '}
              <strong className="font-semibold text-slate-900 dark:text-white">{tr('landingHeroLeadAi')}</strong>,{' '}
              <strong className="font-semibold text-slate-900 dark:text-white">{tr('landingHeroLeadNeuro')}</strong> {tr('landingHeroLeadAnd')}{' '}
              <strong className="font-semibold text-slate-900 dark:text-white">{tr('landingHeroLeadInnovation')}</strong> {tr('landingHeroLeadSuffix')}
            </p>

            <div className="isit-landing-hero-ctas flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              {authLoading ? (
                <div className="h-12 w-56 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
              ) : (
                <Link href={tutorCtaHref} className={pillPrimary}>
                  <Bot className="h-4 w-4 shrink-0" />
                  {tutorCtaLabel}
                  <ChevronRight className="h-4 w-4 shrink-0 opacity-90" />
                </Link>
              )}
              <Link href="/watch-demo" className={pillGhost}>
                <Play className="h-4 w-4 fill-current text-sky-600 dark:text-cyan-300" />
                {tr('landingHeroWatchDemo')}
              </Link>
            </div>

            <div className="isit-landing-hero-trust flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex -space-x-2">
                  {['A', 'P', 'R', 'S', 'M'].map((l, i) => (
                    <span
                      key={l}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-slate-900 dark:text-white shadow-sm dark:border-[#05070a]"
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
                    <span className="ml-1 text-sm font-bold text-slate-900 dark:text-white">{tr('landingHeroRating')}</span>
                                    </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{tr('landingHeroTrusted')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">✓</span>
                {tr('landingHeroCbseAligned')}
              </div>
            </div>
          </div>

          {/* Hero visual — student + AI tutor scene */}
          <HeroLearningScene tutorPrompt={tr('landingHeroScenePrompt')} />
        </div>

        <RevealOnView delayMs={40} className="relative z-10 mx-auto mt-16 max-w-6xl px-4 sm:px-6">
          <p className="mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">{tr('landingPartnersEyebrow')}</p>
          <div className="landing-marquee-mask">
            <div className="landing-marquee-track items-center">
              {[0, 1, 2].flatMap((cycle) =>
                PARTNER_NAMES.map((name) => (
                  <span
                    key={`${name}-${cycle}`}
                    className="whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400 opacity-90 sm:text-sm"
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
      <section className="border-y border-slate-200 dark:border-white/[0.06] bg-slate-100 dark:bg-black/20 py-4">
        <RevealOnView>
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 text-[11px] isit-accent-text sm:gap-x-6 sm:px-6 sm:text-xs">
            {[
              { icon: Brain, label: featureBar[0].label },
              { icon: Layers, label: featureBar[1].label },
              { icon: Rocket, label: featureBar[2].label },
              { icon: Code2, label: featureBar[3].label },
              { icon: Microscope, label: featureBar[4].label },
            ].map(({ icon: Icon, label }, i) => (
              <div key={label} className="group flex items-center gap-2 transition hover:text-slate-600 dark:text-cyan-200">
                {i > 0 && <span className="hidden text-slate-600 dark:text-slate-300 sm:inline">·</span>}
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
              { icon: Bot, ...featureCards[0] },
              { icon: BarChart3, ...featureCards[1] },
              { icon: Zap, ...featureCards[2] },
              { icon: TrendingUp, ...featureCards[3] },
              { icon: Sparkles, ...featureCards[4] },
            ].map(({ icon: Icon, title, desc, highlight }) => (
              <div
                key={title}
                className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 ${
                  highlight
                    ? 'border-cyan-400/40 bg-cyan-500/[0.06] shadow-[0_0_30px_rgba(34,211,238,0.12)]'
                    : 'border-slate-200 dark:border-white/[0.06] bg-white shadow-sm dark:bg-white/[0.02] dark:shadow-none'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{title}</h3>
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
            <div className="landing-tutor-mock isit-card flex h-full min-h-0 flex-col overflow-hidden rounded-3xl motion-safe:transition dark:motion-safe:hover:border-cyan-500/25 dark:motion-safe:hover:shadow-[0_0_48px_rgba(34,211,238,0.1)]">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white dark:bg-slate-100 dark:bg-slate-950/40 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
                    <Bot className="h-5 w-5 text-slate-900 dark:text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white">{tr('landingTutorMockName')}</p>
                    <p className="text-xs text-emerald-400">{tr('landingTutorMockStatus')}</p>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] text-slate-500 dark:text-slate-400">{tr('landingTutorMockPowered')}</span>
              </div>
              <div className="landing-chat-stagger flex min-h-0 flex-1 flex-col bg-slate-50 dark:bg-slate-950/40 px-5 py-5">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Bot className="mt-1 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                    <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-slate-200 dark:border-white/[0.06] bg-slate-100 dark:bg-slate-900/80 px-4 py-3 text-sm text-slate-600 dark:text-slate-200">
                      {tr('landingTutorMockGreeting')}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <div className="max-w-[90%] rounded-2xl rounded-tr-sm border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-50">
                      {tr('landingTutorMockUserMsg')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Bot className="mt-1 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                    <div className="max-w-[95%] rounded-2xl rounded-tl-sm border border-slate-200 dark:border-white/[0.06] bg-slate-100 dark:bg-slate-900/80 px-4 py-3 text-sm leading-relaxed text-slate-600 dark:text-slate-200">
                      {tr('landingTutorMockReply')}
                    </div>
                  </div>
                </div>
                <div className="min-h-6 flex-1" aria-hidden />
              </div>
              <div className="shrink-0 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-slate-950/50 p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    placeholder={tr('landingTutorInputPlaceholder')}
                    className="min-h-11 flex-1 rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-slate-900/70 px-4 text-sm text-slate-600 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/25"
                  />
                  <button
                    type="button"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-600/40"
                    aria-label={tr('landingTutorSendAria')}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 h-full flex-col justify-start lg:pl-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{tr('landingTutorEyebrow')}</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
              {tr('landingTutorHeading')} <span className="isit-gradient-text-strong">{tr('landingTutorHeadingAccent')}</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-slate-400">{tr('landingTutorLead')}</p>
            <RevealStagger className="mt-8 space-y-4">
              {[
                { icon: Brain, ...tutorFeatures[0] },
                { icon: Zap, ...tutorFeatures[1] },
                { icon: BarChart3, ...tutorFeatures[2] },
                { icon: Target, ...tutorFeatures[3] },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white shadow-sm dark:bg-white/[0.02] dark:shadow-none p-4 backdrop-blur-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10">
                    <Icon className="h-5 w-5 text-sky-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
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
          <div className="flex flex-col gap-8 rounded-3xl border border-slate-200 dark:border-white/[0.08] bg-white shadow-sm dark:bg-white/[0.02] dark:shadow-none p-6 backdrop-blur-md lg:flex-row lg:items-center lg:justify-between lg:p-8">
            <LandingStatsCountUp stats={statsConfig} ariaLabel={tr('landingStatsAria')} />
            <div className="shrink-0 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/80 to-indigo-950/60 p-5 shadow-[0_0_40px_rgba(124,58,237,0.2)] motion-safe:transition motion-safe:hover:shadow-[0_0_50px_rgba(124,58,237,0.28)]">
              <p className="max-w-[220px] text-sm font-medium leading-snug text-slate-900 dark:text-white">{tr('landingStatsCta')}</p>
              {authLoading ? (
                <div className="mt-4 h-10 w-36 animate-pulse rounded-full bg-white/10" />
              ) : (
                <Link
                  href={tutorCtaHref}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-violet-400"
                >
                  <Bot className="h-4 w-4" />
                  {tr('landingStatsTryTutor')}
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{tr('landingProgramsEyebrow')}</p>
              <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                {tr('landingProgramsTitle1')}
                <br />
                {tr('landingProgramsTitle2')} <span className="isit-gradient-text-strong">{tr('landingProgramsTitleAccent')}</span>
              </h2>
            </div>
            <Link href="/courses" className={pillGhost + ' shrink-0 self-start lg:self-auto'}>
              {tr('landingProgramsViewAll')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <RevealStagger className="grid gap-6 md:grid-cols-3">
            {[
              { ...programsRow1[0], gradient: 'from-blue-900 via-blue-600 to-sky-400', icon: Bot, href: '/courses' },
              { ...programsRow1[1], gradient: 'from-teal-700 via-teal-500 to-emerald-300', icon: GraduationCap, href: '/courses' },
              { ...programsRow1[2], gradient: 'from-fuchsia-600 via-rose-500 to-amber-400', icon: Megaphone, href: '/courses' },
            ].map(({ tag, title, desc, gradient, icon: Icon, href }) => (
              <Link key={title} href={href} className="group block overflow-hidden rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-slate-100 dark:bg-[#0a0c14] transition hover:border-slate-200 dark:border-cyan-400/25">
                <div className={`relative h-44 bg-gradient-to-br ${gradient} p-4`}>
                  <span className="inline-block rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm">{tag}</span>
                  <Icon className="absolute bottom-4 right-4 h-16 w-16 text-white/90 transition group-hover:scale-105" strokeWidth={1.25} />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{desc}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-cyan-400">
                    {tr('landingExploreProgram')} <ChevronRight className="ml-0.5 h-4 w-4" />
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
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-400/80">{tr('landingCoreEyebrow')}</p>
          </div>
          <RevealStagger className="grid gap-6 md:grid-cols-3">
            {[
              { ...programsRow2[0], gradient: 'from-violet-700 via-fuchsia-600 to-pink-500', icon: Rocket },
              { ...programsRow2[1], gradient: 'from-sky-500 via-blue-600 to-indigo-700', icon: BookOpen },
              { ...programsRow2[2], gradient: 'from-orange-500 via-amber-400 to-rose-300', icon: Palette },
            ].map(({ tag, title, desc, gradient, icon: Icon, glow }) => (
              <Link
                key={title}
                href="/courses"
                className={`group block overflow-hidden rounded-2xl border bg-slate-100 dark:bg-[#0a0c14] transition hover:-translate-y-0.5 ${
                  glow ? 'border-cyan-400/35 shadow-[0_20px_50px_rgba(34,211,238,0.12)]' : 'border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/15'
                }`}
              >
                <div className={`relative h-44 bg-gradient-to-br ${gradient} p-4`}>
                  <span className="inline-block rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-sm">{tag}</span>
                  <Icon className="absolute bottom-4 right-4 h-16 w-16 text-white/90" strokeWidth={1.25} />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{desc}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-cyan-400">
                    {tr('landingExploreProgram')} <ChevronRight className="ml-0.5 h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </RevealStagger>
        </RevealOnView>
      </section>

      {/* Published curriculum subjects (public, no login) */}
      <LandingPublishedSubjects />

      {/* Student journey */}
      <section className="py-16 sm:py-24">
        <RevealOnView className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400/90">{tr('landingJourneyEyebrow')}</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            {tr('landingJourneyTitle1')} <span className="isit-gradient-text-strong">{tr('landingJourneyTitleAccent')}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-400 sm:text-base">{tr('landingJourneyLead')}</p>

          <div className="relative mt-16">
            <div className="absolute left-[10%] right-[10%] top-8 hidden h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent md:block" aria-hidden />
            <RevealStagger className="isit-landing-journey-scroll grid gap-10 md:grid-cols-5 md:gap-4">
              {(
                [
                  [Telescope, journeySteps[0]],
                  [BookOpen, journeySteps[1]],
                  [Target, journeySteps[2]],
                  [Wrench, journeySteps[3]],
                  [Rocket, journeySteps[4]],
                ] as const
              ).map(([Icon, { step, title, desc }]) => (
                <div key={step} className="group relative flex flex-col items-center">
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-500/20 bg-slate-900/90 shadow-[0_0_24px_rgba(34,211,238,0.15)] transition duration-300 group-hover:scale-105 group-hover:border-cyan-400/40 group-hover:shadow-[0_0_32px_rgba(34,211,238,0.25)]">
                    <Icon className="h-7 w-7 text-sky-600 dark:text-cyan-300" strokeWidth={1.25} />
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-[11px] font-bold text-white">
                      {step}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-bold text-slate-900 dark:text-white">{title}</h3>
                  <p className="mt-2 max-w-[200px] text-xs leading-relaxed text-slate-500 dark:text-slate-400">{desc}</p>
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
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">{tr('landingTestimonialsEyebrow')}</p>
              <h2 className="isit-landing-section-title mt-2 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                {tr('landingTestimonialsTitle1')} <span className="isit-gradient-text">{tr('landingTestimonialsTitleAccent')}</span>
              </h2>
            </div>
            <Link href="/stories" className={pillGhost + ' shrink-0 self-start'}>
              {tr('landingTestimonialsViewAll')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </RevealOnView>

          <div className="landing-marquee-mask -mx-4 py-2 sm:mx-0">
            <div className="landing-marquee-track items-stretch gap-6 px-4 sm:gap-8">
              {[0, 1, 2].flatMap((cycle) =>
                testimonials.map((t) => <TestimonialSlide key={`${t.name}-${cycle}`} t={t} />)
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:pb-24">
        <RevealOnView className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400/90">{tr('landingFaqEyebrow')}</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">{tr('landingFaqTitle')}</h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{tr('landingFaqLead')}</p>

          <RevealStagger className="mt-10 space-y-3 text-left">
            {faqItems.map((item, i) => {
              const open = faqOpen === i;
              return (
                <div key={item.q} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => setFaqOpen(open ? -1 : i)}
                    className="flex min-h-11 w-full items-center gap-3 p-4 text-left transition hover:bg-white dark:bg-white/[0.03]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-50 text-sky-600 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-300">
                      ?
                    </span>
                    <span className="flex-1 font-semibold text-slate-900 dark:text-white">{item.q}</span>
                    <span className="text-slate-500 dark:text-slate-400">{open ? '−' : '+'}</span>
                  </button>
                  {open && (
                    <p className="border-t border-slate-200 dark:border-white/[0.06] px-4 pb-4 pl-[3.25rem] pt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </RevealStagger>
        </RevealOnView>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <RevealOnView className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 dark:border-white/[0.1] bg-gradient-to-b from-slate-900/90 to-[#060818] p-8 text-center shadow-[0_0_80px_rgba(79,70,229,0.15)] sm:p-12">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-100">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            {tr('landingFinalBadge')}
          </div>
          <h2 className="text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            {tr('landingFinalTitle1')}
            <br />
            <span className="isit-gradient-text-strong">{tr('landingFinalTitleAccent')}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">{tr('landingFinalLead')}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {authLoading ? (
              <div className="h-12 w-52 animate-pulse rounded-full bg-white/10" />
            ) : (
              <Link href={tutorCtaHref} className={pillPrimary}>
                <Bot className="h-4 w-4" />
                {tr('landingFinalCta')}
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
            <Link href="/contact" className={pillGhost}>
              {tr('landingFinalAdvisor')}
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            {finalTrust.map((x) => (
              <span key={x} className="inline-flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                {x}
              </span>
            ))}
          </div>
        </RevealOnView>

        {!authLoading && isAuthed && (
          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            <Link href={primaryCtaHref} className="text-cyan-400 underline-offset-4 hover:underline">
              {primaryCtaLabel}
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
