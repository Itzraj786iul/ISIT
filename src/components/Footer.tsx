'use client';

import Link from 'next/link';
import { Instagram, Linkedin, Mail, MapPin, Sparkles, Youtube } from 'lucide-react';
import { getSupportEmail } from '@/lib/support-email';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';

/** X (Twitter) — lucide `Twitter` removed in some versions; simple path icon */
function IconX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const contactEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || 'hello@isic.edu.in';

const programs = [
  { label: 'Robotics & Tech', href: '/courses' },
  { label: 'Digital Literacy', href: '/courses' },
  { label: 'Marketing & Comms', href: '/courses' },
  { label: 'Entrepreneurship', href: '/courses' },
  { label: 'Academic + AI', href: '/courses' },
  { label: 'Innovation Labs', href: '/courses' },
] as const;

const coreCourses = [
  { label: 'How the Brain Works', href: '/courses' },
  { label: 'How Learning Happens', href: '/courses' },
  { label: 'The Art of Imagination', href: '/courses' },
  { label: 'Active Learning', href: '/courses' },
] as const;

const company = [
  { label: 'About ISIC', href: '/about-us' },
  { label: 'Careers', href: '/contact' },
  { label: 'Press', href: '/contact' },
  { label: 'Partnerships', href: '/contact' },
  { label: 'For Schools', href: '/contact' },
  { label: 'Contact', href: '/contact' },
] as const;

const social = [
  { href: 'https://twitter.com', Icon: IconX, label: 'X' },
  { href: 'https://www.instagram.com', Icon: Instagram, label: 'Instagram' },
  { href: 'https://www.youtube.com', Icon: Youtube, label: 'YouTube' },
  { href: 'https://www.linkedin.com', Icon: Linkedin, label: 'LinkedIn' },
] as const;

export default function Footer() {
  const mailtoEmail = getSupportEmail();
  const displayEmail = contactEmail.includes('@') ? contactEmail : mailtoEmail;

  return (
    <footer className="relative z-10 overflow-hidden border-t border-white/[0.08] bg-[#050510] pb-10 pt-16 text-slate-200 sm:pb-12 sm:pt-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_100%,rgba(99,102,241,0.14),transparent_60%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <RevealOnView>
          <RevealStagger className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-900/40 motion-safe:transition motion-safe:hover:scale-[1.03] motion-safe:hover:shadow-violet-500/30">
                  <Sparkles className="h-5 w-5" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-lg font-bold tracking-tight text-white">ISIC</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Innovation · Curiosity</p>
                </div>
              </div>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-300">
                The Indian School of Innovation &amp; Curiosity — where every child discovers their own extraordinary genius through AI, neuroscience
                and real-world projects.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {social.map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} (opens in new tab)`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-slate-200 transition hover:-translate-y-0.5 hover:border-cyan-400/35 hover:bg-white/[0.07] hover:text-white"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </a>
                ))}
              </div>
            </div>

            {/* Programs */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Programs</p>
              <ul className="mt-4 space-y-3">
                {programs.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm font-medium text-white/95 transition hover:text-cyan-300">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Core courses */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Core courses</p>
              <ul className="mt-4 space-y-3">
                {coreCourses.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm font-medium text-white/95 transition hover:text-cyan-300">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Company</p>
              <ul className="mt-4 space-y-3">
                {company.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm font-medium text-white/95 transition hover:text-cyan-300">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </RevealStagger>
        </RevealOnView>

        {/* Bottom bar */}
        <RevealOnView delayMs={80} className="mt-16 border-t border-white/[0.08] pt-10">
          <div className="flex flex-col gap-6 text-sm lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <a
              href={`mailto:${mailtoEmail}`}
              className="inline-flex items-center gap-2 font-medium text-white transition hover:text-cyan-200"
            >
              <Mail className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              {displayEmail}
            </a>
            <p className="inline-flex items-center gap-2 font-medium text-white lg:justify-center">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              Bengaluru · Mumbai · Delhi NCR
            </p>
            <p className="text-xs text-slate-500 lg:text-right">
              © {new Date().getFullYear()} ISIC. All rights reserved.{' '}
              <span className="text-slate-600" aria-hidden>
                ·
              </span>{' '}
              <Link href="/privacy" className="text-slate-400 transition hover:text-cyan-300">
                Privacy
              </Link>{' '}
              <span className="text-slate-600" aria-hidden>
                ·
              </span>{' '}
              <Link href="/terms" className="text-slate-400 transition hover:text-cyan-300">
                Terms
              </Link>
            </p>
          </div>
        </RevealOnView>
      </div>
    </footer>
  );
}
