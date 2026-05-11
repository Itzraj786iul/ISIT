'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { useT } from '@/lib/t';

const social = [
  { Icon: Facebook, href: 'https://www.facebook.com', label: 'Facebook' },
  { Icon: Instagram, href: 'https://www.instagram.com', label: 'Instagram' },
  { Icon: Youtube, href: 'https://www.youtube.com', label: 'YouTube' },
  { Icon: Linkedin, href: 'https://www.linkedin.com', label: 'LinkedIn' },
] as const;

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || 'hello@isic.in';

export default function Footer() {
  const tr = useT();

  return (
    <footer className="relative z-10 border-t border-cyan-400/15 bg-slate-950 py-12 text-cyan-100/80 sm:py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 sm:gap-10 sm:px-6 md:grid-cols-4 md:gap-12">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-cyan-200">
            ISIC
          </div>
          <h3 className="text-lg font-semibold text-cyan-100 sm:text-xl">Indian School of Innovation and Curiosity</h3>
          <p className="mt-3 max-w-md text-sm text-cyan-100/70 sm:mt-4">{tr('footerTagline')}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {social.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} (opens in new tab)`}
                className="motion-safe-transition inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/25 bg-slate-900/70 text-cyan-200/80 transition hover:border-cyan-300/45 hover:bg-cyan-400/10 hover:text-cyan-100"
              >
                <Icon className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 font-medium text-cyan-100 sm:mb-4">{tr('footerLearn')}</p>
          <ul className="space-y-2 sm:space-y-2.5">
            <li>
              <Link href="/subjects" className="inline-flex min-h-[2rem] items-center py-1 text-cyan-100/70 transition hover:text-cyan-200">
                {tr('footerSubjectsLink')}
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="inline-flex min-h-[2rem] items-center py-1 text-cyan-100/70 transition hover:text-cyan-200">
                {tr('footerHowItWorksLink')}
              </Link>
            </li>
            <li>
              <Link href="/ai-tutor" className="inline-flex min-h-[2rem] items-center py-1 text-cyan-100/70 transition hover:text-cyan-200">
                {tr('footerAiTutorLink')}
              </Link>
            </li>
            <li>
              <Link href="/courses" className="inline-flex min-h-[2rem] flex-col items-start gap-0.5 py-1 text-cyan-100/70 transition hover:text-cyan-200">
                <span>{tr('footerCourseCatalogLink')}</span>
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-medium text-cyan-100 sm:mb-4">{tr('footerCompany')}</p>
          <ul className="space-y-2 sm:space-y-2.5">
            <li>
              <Link href="/about-us" className="inline-flex min-h-[2rem] items-center py-1 text-cyan-100/70 transition hover:text-cyan-200">
                {tr('aboutUs')}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="inline-flex min-h-[2rem] items-center py-1 text-cyan-100/70 transition hover:text-cyan-200">
                {tr('footerContact')}
              </Link>
            </li>
            <li>
              <Link href="/stories" className="inline-flex min-h-[2rem] items-center py-1 text-cyan-100/70 transition hover:text-cyan-200">
                {tr('stories')}
              </Link>
            </li>
            <li>
              <Link href="/blog" className="inline-flex min-h-[2rem] items-center py-1 text-cyan-100/70 transition hover:text-cyan-200">
                {tr('blog')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-medium text-cyan-100 sm:mb-4">{tr('footerGetInTouch')}</p>
          <ul className="space-y-2 text-sm text-cyan-100/70">
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
              <a href={`mailto:${supportEmail}`} className="break-all hover:text-cyan-200">
                {supportEmail}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
              <a href="tel:+911234567890" className="hover:text-cyan-200">
                +91 12345 67890
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
              India
            </li>
          </ul>
          <Link href="/signup" className="isit-btn-primary mt-6 inline-flex min-h-11 items-center justify-center no-underline">
            {tr('footerCta')}
          </Link>
        </div>
      </div>

      <div className="mt-10 border-t border-cyan-400/15 px-4 pt-5 text-xs text-cyan-100/55 sm:mt-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ISIC (Indian School of Innovation and Curiosity). All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/privacy" className="hover:text-cyan-200">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-cyan-200">
              Terms
            </Link>
            <Link href="/refund" className="hover:text-cyan-200">
              Refunds
            </Link>
            <Link href="/contact" className="hover:text-cyan-200">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
