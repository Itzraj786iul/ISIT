'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { BookOpenCheck, Bot, ChevronRight, Laptop, Megaphone, Palette, Rocket } from 'lucide-react';
import { useT } from '@/lib/t';
import { useLanguage } from '@/lib/language-context';
import { buildProgramsRow1, buildProgramsRow2 } from '@/lib/landing-content';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';
import LandingProgramCard from '@/components/home/LandingProgramCard';

type Props = {
  viewAllClassName: string;
};

export default function LandingExplorePrograms({ viewAllClassName }: Props) {
  const tr = useT();
  const { language } = useLanguage();
  const programsRow1 = useMemo(() => buildProgramsRow1(tr), [tr, language]);
  const programsRow2 = useMemo(() => buildProgramsRow2(tr), [tr, language]);

  const programCards = useMemo(
    () => [
      { ...programsRow1[0], gradientKey: 'robotics' as const, icon: Bot },
      { ...programsRow1[1], gradientKey: 'digital' as const, icon: Laptop },
      { ...programsRow1[2], gradientKey: 'marketing' as const, icon: Megaphone },
      { ...programsRow2[0], gradientKey: 'entrepreneurship' as const, icon: Rocket },
      { ...programsRow2[1], gradientKey: 'academic' as const, icon: BookOpenCheck, glow: true },
      { ...programsRow2[2], gradientKey: 'creativity' as const, icon: Palette },
    ],
    [programsRow1, programsRow2]
  );                        

  return (
    <section className="isit-landing-programs-flow py-16 sm:py-24">
      <RevealOnView className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-500 dark:text-sky-400/90">
              {tr('landingProgramsEyebrow')}
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
              {tr('landingProgramsTitle1')}
              <br />
              {tr('landingProgramsTitle2')}{' '}
              <span className="isit-gradient-text-strong">{tr('landingProgramsTitleAccent')}</span>
            </h2>
          </div>
          <Link href="/courses" className={viewAllClassName + ' shrink-0 self-start lg:self-auto'}>
            {tr('landingProgramsViewAll')}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <RevealStagger className="mt-12 grid gap-6 md:grid-cols-3">
          {programCards.map((card) => (
            <LandingProgramCard key={card.title} card={card} exploreLabel={tr('landingExploreProgram')} />
          ))}
        </RevealStagger>
      </RevealOnView>
    </section>
  );
}
