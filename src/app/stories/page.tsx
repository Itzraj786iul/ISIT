'use client';

import SiteShell from '@/components/SiteShell';
import Link from 'next/link';
import { Users, Award, MapPin, Quote, Clock, Layers } from 'lucide-react';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';
import { useT } from '@/lib/t';

type Story = {
  id: number;
  name: string;
  role: string;
  focus: string;
  tag: string;
  quote: string;
};

const STORIES: Story[] = [
  {
    id: 1,
    name: 'Neha K.',
    role: 'Parent · Pune',
    focus: 'Class 9 · Mathematics confidence',
    tag: 'Curriculum practice',
    quote:
      'Evenings used to be fights over homework. Now she opens the topic she saw in class and the tutor explains it in smaller steps — without replacing her teacher.',
  },
  {
    id: 2,
    name: 'Arjun M.',
    role: 'Student · Bengaluru',
    focus: 'Science · Exam season',
    tag: 'Pace & clarity',
    quote:
      'I still make mistakes, but I see why now. Sessions feel like practice with someone patient — not another long video to finish.',
  },
  {
    id: 3,
    name: 'Meera & Vikram S.',
    role: 'Parents · New Delhi',
    focus: 'Two learners · One household',
    tag: 'Family visibility',
    quote:
      'We wanted both kids on one rhythm without micromanaging. The dashboard shows where time goes — we celebrate streaks instead of nagging.',
  },
];

export default function StoriesPage() {
  const tr = useT();

  const stats = [
    { Icon: Clock, value: tr('storiesStatValueAlwaysOn'), label: tr('storiesStatLabelAlwaysOn') },
    { Icon: Layers, value: tr('storiesStatValueLoop'), label: tr('storiesStatLabelLoop') },
    { Icon: Award, value: tr('storiesStatValueCoverage'), label: tr('storiesStatLabelCoverage') },
    { Icon: Users, value: tr('storiesStatValueTogether'), label: tr('storiesStatLabelTogether') },
  ];

  return (
    <SiteShell variant="public" active="stories">
      <section className="pb-8 pt-10 sm:pb-12 sm:pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <RevealOnView>
            <div className="mb-8 text-center sm:mb-12">
              <h1 className="mb-4 text-4xl font-bold text-cyan-50 md:text-5xl">{tr('storiesHeroTitle')}</h1>
              <p className="mx-auto max-w-2xl text-lg text-cyan-100/75">{tr('storiesHeroLead')}</p>
            </div>
          </RevealOnView>

          <RevealStagger className="grid grid-cols-2 gap-4 border-t border-cyan-300/20 pt-8 sm:grid-cols-4 sm:gap-8 sm:pt-12">
            {stats.map(({ Icon, value, label }) => (
              <div key={label} className="group text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-400/15 text-cyan-300 transition group-hover:bg-cyan-400/30">
                    <Icon size={24} aria-hidden />
                  </div>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-cyan-100 md:text-3xl">{value}</h3>
                <p className="text-sm text-cyan-100/75">{label}</p>
              </div>
            ))}
          </RevealStagger>
        </div>
      </section>

      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <RevealOnView>
            <div className="mb-10 text-center sm:mb-16">
              <h2 className="mb-3 text-2xl font-bold text-cyan-50 sm:mb-4 sm:text-3xl">{tr('storiesSectionTitle')}</h2>
              <p className="mx-auto max-w-2xl text-sm text-cyan-100/75 sm:text-base">{tr('storiesSectionLead')}</p>
            </div>
          </RevealOnView>

          <RevealStagger className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {STORIES.map((story) => (
              <article
                key={story.id}
                className="isit-glass flex h-full flex-col rounded-xl p-5 motion-safe-transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-xl sm:rounded-2xl sm:p-8"
              >
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-cyan-100">{story.name}</h3>
                    <div className="mt-1 flex items-center gap-1 text-xs text-cyan-100/70">
                      <MapPin size={12} aria-hidden />
                      {story.role}
                    </div>
                  </div>
                  <Quote className="h-9 w-9 shrink-0 text-cyan-300/40" aria-hidden />
                </div>

                <div className="mb-5 rounded-xl border border-cyan-300/20 bg-slate-900/70 p-4">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-cyan-300">Focus</p>
                  <p className="font-semibold text-cyan-100">{story.focus}</p>
                  <span className="mt-3 inline-block rounded-full border border-cyan-400/25 bg-slate-950/60 px-3 py-1 text-[11px] font-semibold text-cyan-200/90">
                    {story.tag}
                  </span>
                </div>

                <blockquote className="mt-auto border-t border-cyan-300/20 pt-4 text-sm italic leading-relaxed text-cyan-100/80">
                  &ldquo;{story.quote}&rdquo;
                </blockquote>
              </article>
            ))}
          </RevealStagger>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <RevealOnView delayMs={50}>
            <div className="relative overflow-hidden rounded-3xl border border-cyan-300/25 bg-gradient-to-r from-cyan-600/35 to-blue-600/35 p-10 text-center text-white motion-safe-transition hover:border-cyan-300/40 md:p-16">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300 opacity-10" aria-hidden />
              <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-cyan-300 opacity-10" aria-hidden />

              <h2 className="relative z-10 mb-6 text-3xl font-bold md:text-4xl">{tr('storiesCtaTitle')}</h2>
              <p className="relative z-10 mx-auto mb-10 max-w-2xl text-lg text-cyan-100/90">{tr('storiesCtaLead')}</p>
              <div className="relative z-10 flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row">
                <Link href="/signup" className="isit-btn-primary inline-flex min-h-11 items-center px-8 font-bold no-underline">
                  {tr('footerCta')}
                </Link>
                <Link href="/how-it-works" className="isit-btn-secondary inline-flex min-h-11 items-center px-8 font-semibold no-underline">
                  {tr('footerHowItWorksLink')}
                </Link>
              </div>
            </div>
          </RevealOnView>
        </div>
      </section>
    </SiteShell>
  );
}
