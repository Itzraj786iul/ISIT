'use client';

import SiteShell from '@/components/SiteShell';
import Link from 'next/link';
import {
  BarChart,
  BookOpen,
  Bot,
  Award,
  Clock,
  Users,
  CheckCircle,
  Layers,
  Sparkles,
} from 'lucide-react';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';
import { useT } from '@/lib/t';

export default function HowItWorksPage() {
  const tr = useT();
  const loopPills = [tr('learningLoopPill1'), tr('learningLoopPill2'), tr('learningLoopPill3'), tr('learningLoopPill4')];

  return (
    <SiteShell variant="public" active="how-it-works">
      <section className="px-4 py-16 text-center sm:px-6 sm:py-24">
        <RevealOnView>
          <div className="mx-auto max-w-4xl">
            <span className="isit-chip mx-auto inline-flex">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              AI-first learning
            </span>
            <h1 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">{tr('howItWorksHeroTitle')}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-cyan-100/80 sm:text-xl">{tr('howItWorksHeroLead')}</p>
          </div>
        </RevealOnView>
      </section>

      <section className="border-y border-cyan-500/10 bg-slate-950/45 py-10 sm:py-12" aria-labelledby="learning-loop-heading">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/90">{tr('howItWorksLoopEyebrow')}</p>
          <h2 id="learning-loop-heading" className="mt-2 text-xl font-bold text-cyan-50 sm:text-2xl">
            {tr('howItWorksLoopTitle')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-cyan-100/75">{tr('howItWorksLoopHint')}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {loopPills.map((label, i) => (
              <div key={label} className="flex items-center gap-2 sm:gap-3">
                <span className="rounded-full border border-cyan-400/30 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-cyan-100">
                  {label}
                </span>
                {i < loopPills.length - 1 && (
                  <span className="hidden text-cyan-500/70 sm:inline" aria-hidden>
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-20">
        <RevealOnView>
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 sm:gap-16 sm:px-6 md:flex-row">
            <div className="isit-glass rounded-3xl p-6 sm:w-1/2 sm:p-8">
              <div className="mb-2 font-bold uppercase tracking-wider text-cyan-300">Step 01</div>
              <h2 className="mb-6 text-3xl font-bold text-cyan-100">{tr('howItWorksStep1Title')}</h2>
              <p className="mb-8 text-lg text-cyan-100/80">{tr('howItWorksStep1Lead')}</p>
              <ul className="space-y-4">
                {[
                  'Student or parent sign-up with clear roles',
                  'Optional school invite for class connections',
                  'Subject catalog—your main learning home',
                  'Dashboard shows what to do next',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-cyan-100/80">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300">
                      <CheckCircle size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex w-full justify-center md:w-1/2">
              <div className="relative flex h-80 w-full max-w-md items-center justify-center overflow-hidden rounded-3xl isit-glass">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20" />
                <div className="relative z-10 rounded-full border border-cyan-300/20 bg-slate-950/75 p-8 shadow-xl">
                  <Layers size={64} className="text-cyan-300" />
                </div>
              </div>
            </div>
          </div>
        </RevealOnView>
      </section>

      <section className="py-20">
        <RevealOnView delayMs={40}>
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 px-6 md:flex-row-reverse">
            <div className="isit-glass rounded-3xl p-6 sm:w-1/2 sm:p-8">
              <div className="mb-2 font-bold uppercase tracking-wider text-cyan-300">Step 02</div>
              <h2 className="mb-6 text-3xl font-bold text-cyan-100">{tr('howItWorksStep2Title')}</h2>
              <p className="mb-8 text-lg text-cyan-100/80">{tr('howItWorksStep2Lead')}</p>
              <ul className="space-y-4">
                {[
                  'Session player with instant AI explanations',
                  'Quizzes and practice when you need them',
                  'Teacher assignments appear in your flow',
                  'Pick up where you left off on any device',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-cyan-100/80">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300">
                      <CheckCircle size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex w-full justify-center md:w-1/2">
              <div className="relative flex h-80 w-full max-w-md items-center justify-center overflow-hidden rounded-3xl isit-glass">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20" />
                <div className="relative z-10 rounded-full border border-cyan-300/20 bg-slate-950/75 p-8 shadow-xl">
                  <Bot size={64} className="text-cyan-300" />
                </div>
              </div>
            </div>
          </div>
        </RevealOnView>
      </section>

      <section className="py-20">
        <RevealOnView delayMs={30}>
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 px-6 md:flex-row">
            <div className="isit-glass rounded-3xl p-6 sm:w-1/2 sm:p-8">
              <div className="mb-2 font-bold uppercase tracking-wider text-cyan-300">Step 03</div>
              <h2 className="mb-6 text-3xl font-bold text-cyan-100">{tr('howItWorksStep3Title')}</h2>
              <p className="mb-8 text-lg text-cyan-100/80">{tr('howItWorksStep3Lead')}</p>
              <ul className="space-y-4">
                {[
                  'Mastery and performance signals per topic',
                  'Weak-area nudges on your dashboard',
                  'Optional program courses for add-on skills',
                  'Clear next steps after every session',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-cyan-100/80">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300">
                      <CheckCircle size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex w-full justify-center md:w-1/2">
              <div className="relative flex h-80 w-full max-w-md items-center justify-center overflow-hidden rounded-3xl isit-glass">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20" />
                <div className="relative z-10 rounded-full border border-cyan-300/20 bg-slate-950/75 p-8 shadow-xl">
                  <BookOpen size={64} className="text-cyan-300" />
                </div>
              </div>
            </div>
          </div>
        </RevealOnView>
      </section>

      <section className="py-20">
        <RevealOnView delayMs={30}>
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 px-6 md:flex-row-reverse">
            <div className="isit-glass rounded-3xl p-6 sm:w-1/2 sm:p-8">
              <div className="mb-2 font-bold uppercase tracking-wider text-cyan-300">Step 04</div>
              <h2 className="mb-6 text-3xl font-bold text-cyan-100">{tr('howItWorksStep4Title')}</h2>
              <p className="mb-8 text-lg text-cyan-100/80">{tr('howItWorksStep4Lead')}</p>
              <ul className="space-y-4">
                {[
                  'Progress, streaks, and session history',
                  'Parent view of learning activity (where enabled)',
                  'Teacher tools for assignments and follow-up',
                  'Certificates for select program courses',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-cyan-100/80">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300">
                      <CheckCircle size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex w-full justify-center md:w-1/2">
              <div className="relative flex h-80 w-full max-w-md items-center justify-center overflow-hidden rounded-3xl isit-glass">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20" />
                <div className="relative z-10 rounded-full border border-cyan-300/20 bg-slate-950/75 p-8 shadow-xl">
                  <BarChart size={64} className="text-cyan-300" />
                </div>
              </div>
            </div>
          </div>
        </RevealOnView>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <RevealOnView>
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-cyan-50">{tr('howItWorksWhyTitle')}</h2>
              <p className="mx-auto max-w-2xl text-cyan-100/75">{tr('howItWorksWhyLead')}</p>
            </div>
          </RevealOnView>

          <RevealStagger className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl p-8 text-center isit-glass">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/20 bg-slate-950/70 text-cyan-300 shadow-sm">
                <Clock size={32} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-cyan-100">Learn on your schedule</h3>
              <p className="text-sm text-cyan-100/75">Short sessions that fit after school, weekends, and exam season.</p>
            </div>
            <div className="rounded-2xl p-8 text-center isit-glass">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/20 bg-slate-950/70 text-cyan-300 shadow-sm">
                <Users size={32} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-cyan-100">Made for families &amp; schools</h3>
              <p className="text-sm text-cyan-100/75">Separate flows for students, parents, and educators—each sees what matters.</p>
            </div>
            <div className="rounded-2xl p-8 text-center isit-glass">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/20 bg-slate-950/70 text-cyan-300 shadow-sm">
                <CheckCircle size={32} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-cyan-100">Grounded in mastery</h3>
              <p className="text-sm text-cyan-100/75">Focus on understanding concepts—not only finishing videos.</p>
            </div>
            <div className="rounded-2xl p-8 text-center isit-glass">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/20 bg-slate-950/70 text-cyan-300 shadow-sm">
                <Award size={32} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-cyan-100">Programs when you want more</h3>
              <p className="text-sm text-cyan-100/75">Browse paid courses for extra tracks alongside core subjects.</p>
            </div>
          </RevealStagger>
        </div>
      </section>

      <section className="px-6 py-24 text-center">
        <RevealOnView>
          <h2 className="text-3xl font-bold text-cyan-50">{tr('howItWorksReadyTitle')}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-cyan-100/75">{tr('howItWorksReadyLead')}</p>
          <div className="mt-10 flex flex-col flex-wrap justify-center gap-4 sm:flex-row sm:gap-4">
            <Link href="/signup" className="isit-btn-primary px-8 py-3 text-center no-underline">
              {tr('footerCta')}
            </Link>
            <Link href="/subjects" className="isit-btn-secondary px-8 py-3 text-center no-underline">
              {tr('browseSubjects')}
            </Link>
            <Link href="/courses" className="isit-btn-secondary border border-cyan-400/25 bg-slate-950/50 px-8 py-3 text-center no-underline">
              {tr('footerCourseCatalogLink')}
            </Link>
          </div>
          <p className="mt-6 text-sm text-cyan-200/60">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-cyan-300 underline-offset-2 hover:underline">
              {tr('logIn')}
            </Link>
          </p>
        </RevealOnView>
      </section>
    </SiteShell>
  );
}
