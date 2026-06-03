'use client';

import Link from 'next/link';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import type { LandingProgramGradientKey } from '@/lib/landing-program-gradients';
import { LANDING_PROGRAM_GRADIENTS } from '@/lib/landing-program-gradients';

export type LandingProgramCardData = {
  tag: string;
  title: string;
  desc: string;
  gradientKey: LandingProgramGradientKey;
  icon: LucideIcon;
  href?: string;
  glow?: boolean;
};

type LandingProgramCardProps = {
  card: LandingProgramCardData;
  exploreLabel: string;
};

export default function LandingProgramCard({ card, exploreLabel }: LandingProgramCardProps) {
  const { tag, title, desc, gradientKey, icon: Icon, href = '/courses', glow = false } = card;

  return (
    <Link
      href={href}
      className={`isit-landing-program-card group block overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 transition hover:-translate-y-0.5 dark:border-white/[0.06] dark:bg-[#0a0c14] dark:hover:border-cyan-400/25 ${
        glow ? 'isit-landing-program-card--glow' : ''
      }`}
    >
      <div
        className="relative h-48 p-5 sm:h-52"
        style={{ background: LANDING_PROGRAM_GRADIENTS[gradientKey] }}
      >
        <span className="inline-block rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-medium tracking-wide text-white/95 backdrop-blur-sm">
          {tag}
        </span>
        <Icon
          className="absolute bottom-5 right-5 h-[4.5rem] w-[4.5rem] text-white/95 transition duration-300 group-hover:scale-105"
          strokeWidth={1.15}
        />
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{desc}</p>
        <span className="mt-5 inline-flex items-center text-sm font-semibold text-sky-600 dark:text-cyan-400">
          {exploreLabel}
          <ChevronRight className="ml-0.5 h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
