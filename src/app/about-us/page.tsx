'use client';

import SiteShell from '@/components/SiteShell';
import Link from 'next/link';
import { Heart, Lightbulb, Shield, Users } from 'lucide-react';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';
import { useT } from '@/lib/t';

const VALUES = [
  {
    icon: Lightbulb,
    title: 'Depth over drill',
    body: 'We optimize for understanding and transfer — not rote coverage — so students can reason in new situations.',
  },
  {
    icon: Users,
    title: 'Every learner in the loop',
    body: 'Teachers, parents, and students see clear progress signals and can act on them the same week.',
  },
  {
    icon: Shield,
    title: 'Trust & safety',
    body: 'Responsible AI practices, age-appropriate experiences, and institutional controls for partner schools.',
  },
  {
    icon: Heart,
    title: 'Joy + rigor',
    body: 'Learning should feel motivating: streaks, milestones, and tutor dialogue that respects attention and pace.',
  },
];

export default function AboutUsPage() {
  const tr = useT();

  return (
    <SiteShell variant="public" active="about-us">
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <RevealOnView>
          <div className="isit-glass rounded-3xl p-7 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-cyan-300">About ISIC</p>
            <h1 className="mt-3 text-4xl font-black sm:text-5xl">Indian School of Innovation and Curiosity</h1>
            <p className="mt-5 text-base leading-relaxed isit-body">{tr('aboutMissionLead')}</p>
            <p className="mt-6 border-l-2 border-cyan-400/35 pl-5 text-sm leading-relaxed isit-muted">
              {tr('aboutLoopBridge')}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ['10K+', 'Learners on platform'],
                ['200+', 'Partner schools & cohorts'],
                ['24/7', 'AI tutor access'],
              ].map(([n, l]) => (
                <div key={l} className="rounded-2xl border border-slate-200 dark:border-cyan-300/20 bg-slate-900/60 p-4 motion-safe-transition hover:border-cyan-300/35">
                  <p className="text-2xl font-black text-slate-600 dark:text-cyan-200">{n}</p>
                  <p className="text-sm isit-body/70">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealOnView>

        <RevealOnView delayMs={50} className="mt-10">
          <h2 className="text-2xl font-bold isit-text-primary sm:text-3xl">What we believe</h2>
          <p className="mt-2 max-w-3xl text-sm isit-body">
            Product decisions follow a simple bar: does this help a student think more clearly tomorrow than they did today?
          </p>
        </RevealOnView>

        <RevealStagger className="mt-8 grid gap-5 sm:grid-cols-2">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="isit-glass rounded-2xl p-6 motion-safe-transition hover:border-cyan-300/35">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-cyan-400/25 bg-cyan-400/10 text-sky-600 dark:text-cyan-300">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-bold isit-text-primary">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed isit-body">{body}</p>
            </div>
          ))}
        </RevealStagger>

        <RevealOnView delayMs={80} className="mt-12 isit-glass rounded-3xl p-8 text-center sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600 dark:text-cyan-300">Next step</p>
          <h2 className="mt-3 text-2xl font-bold isit-text-primary sm:text-3xl">See ISIC in action</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm isit-body">{tr('aboutNextStepLead')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/how-it-works" className="isit-btn-primary no-underline inline-flex min-h-11 items-center px-6">
              {tr('footerHowItWorksLink')}
            </Link>
            <Link href="/stories" className="isit-btn-secondary no-underline inline-flex min-h-11 items-center px-6">
              {tr('stories')}
            </Link>
            <Link href="/contact" className="isit-btn-secondary no-underline inline-flex min-h-11 items-center px-6">
              {tr('footerContact')}
            </Link>
          </div>
        </RevealOnView>
      </main>
    </SiteShell>
  );
}
