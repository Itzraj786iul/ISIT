'use client';

import Link from 'next/link';
import { Instagram, Linkedin, Mail, MapPin, Youtube } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { getSupportEmail } from '@/lib/support-email';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';
import { useT } from '@/lib/t';
import type { I18nKey } from '@/lib/t';

/** X (Twitter) — lucide `Twitter` removed in some versions; simple path icon */
function IconX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const contactEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || 'hello@isic.edu.in';

const PROGRAM_KEYS: { labelKey: I18nKey; href: string }[] = [
  { labelKey: 'footerProgRobotics', href: '/courses' },
  { labelKey: 'footerProgDigital', href: '/courses' },
  { labelKey: 'footerProgMarketing', href: '/courses' },
  { labelKey: 'footerProgEntrepreneurship', href: '/courses' },
  { labelKey: 'footerProgAcademic', href: '/courses' },
  { labelKey: 'footerProgInnovation', href: '/courses' },
];

const CORE_KEYS: { labelKey: I18nKey; href: string }[] = [
  { labelKey: 'footerCoreBrain', href: '/courses' },
  { labelKey: 'footerCoreLearning', href: '/courses' },
  { labelKey: 'footerCoreImagination', href: '/courses' },
  { labelKey: 'footerCoreActive', href: '/courses' },
];

const COMPANY_KEYS: { labelKey: I18nKey; href: string }[] = [
  { labelKey: 'footerCompanyAbout', href: '/about-us' },
  { labelKey: 'footerCompanyCareers', href: '/contact' },
  { labelKey: 'footerCompanyPress', href: '/contact' },
  { labelKey: 'footerCompanyPartnerships', href: '/contact' },
  { labelKey: 'footerCompanySchools', href: '/contact' },
  { labelKey: 'footerCompanyContact', href: '/contact' },
];

const social = [
  { href: 'https://twitter.com', Icon: IconX, label: 'X' },
  { href: 'https://www.instagram.com', Icon: Instagram, label: 'Instagram' },
  { href: 'https://www.youtube.com', Icon: Youtube, label: 'YouTube' },
  { href: 'https://www.linkedin.com', Icon: Linkedin, label: 'LinkedIn' },
] as const;

export default function Footer() {
  const tr = useT();
  const mailtoEmail = getSupportEmail();
  const displayEmail = contactEmail.includes('@') ? contactEmail : mailtoEmail;
  const year = new Date().getFullYear();

  return (
    <footer className="isit-site-footer relative z-10 overflow-hidden pb-10 pt-16 sm:pb-12 sm:pt-20">
      <div
        className="isit-footer-glow pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_100%,rgba(99,102,241,0.14),transparent_60%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <RevealOnView>
          <RevealStagger className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex flex-col gap-2">
                <BrandLogo variant="mark" href="/" showWordmark />
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                  {tr('footerBrandTagline')}
                </p>
              </div>
              <p className="mt-5 max-w-sm text-sm leading-relaxed isit-body">{tr('footerBrandDesc')}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {social.map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} (opens in new tab)`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-slate-50 hover:text-sky-700 dark:border-white/15 dark:text-slate-200 dark:hover:border-cyan-400/35 dark:hover:bg-white/[0.07] dark:hover:text-slate-900 dark:text-white"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                {tr('footerProgramsHeading')}
              </p>
              <ul className="mt-4 space-y-3">
                {PROGRAM_KEYS.map(({ labelKey, href }) => (
                  <li key={labelKey}>
                    <Link
                      href={href}
                      className="text-sm font-medium isit-text-primary transition hover:text-sky-600 dark:hover:text-sky-600 dark:text-cyan-300"
                    >
                      {tr(labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                {tr('footerCoreHeading')}
              </p>
              <ul className="mt-4 space-y-3">
                {CORE_KEYS.map(({ labelKey, href }) => (
                  <li key={labelKey}>
                    <Link
                      href={href}
                      className="text-sm font-medium isit-text-primary transition hover:text-sky-600 dark:hover:text-sky-600 dark:text-cyan-300"
                    >
                      {tr(labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                {tr('footerCompany')}
              </p>
              <ul className="mt-4 space-y-3">
                {COMPANY_KEYS.map(({ labelKey, href }) => (
                  <li key={labelKey}>
                    <Link
                      href={href}
                      className="text-sm font-medium isit-text-primary transition hover:text-sky-600 dark:hover:text-sky-600 dark:text-cyan-300"
                    >
                      {tr(labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </RevealStagger>
        </RevealOnView>

        <RevealOnView delayMs={80} className="mt-16 border-t border-slate-200 pt-10 dark:border-white/[0.08]">
          <div className="flex flex-col gap-6 text-sm lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <a
              href={`mailto:${mailtoEmail}`}
              className="inline-flex items-center gap-2 font-medium isit-text-primary transition hover:text-sky-600 dark:hover:text-slate-600 dark:text-cyan-200"
            >
              <Mail className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              {displayEmail}
            </a>
            <p className="inline-flex items-center gap-2 font-medium isit-text-primary lg:justify-center">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              {tr('footerLocations')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 lg:text-right">
              © {year} {tr('footerCopyright')}{' '}
              <span className="text-slate-600 dark:text-slate-300" aria-hidden>
                ·
              </span>{' '}
              <Link href="/privacy" className="text-slate-500 transition hover:text-sky-600 dark:hover:text-sky-600 dark:text-cyan-300">
                {tr('footerPrivacy')}
              </Link>{' '}
              <span className="text-slate-600 dark:text-slate-300" aria-hidden>
                ·
              </span>{' '}
              <Link href="/terms" className="text-slate-500 transition hover:text-sky-600 dark:hover:text-sky-600 dark:text-cyan-300">
                {tr('footerTerms')}
              </Link>
            </p>
          </div>
        </RevealOnView>
      </div>
    </footer>
  );
}
