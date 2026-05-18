'use client';

import SiteShell from '@/components/SiteShell';
import Link from 'next/link';
import { Mail, MapPin, Phone, MessageCircle } from 'lucide-react';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';
import { useT } from '@/lib/t';

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || 'hello@isic.in';

export default function ContactPage() {
  const tr = useT();

  return (
    <SiteShell variant="public">
      <section className="relative flex-1 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <RevealOnView>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-cyan-300">{tr('footerContact')}</p>
            <h1 className="mt-3 text-4xl font-black sm:text-5xl">We&apos;re here to help</h1>
            <p className="mt-4 max-w-2xl text-base isit-body">{tr('contactPageLead')}</p>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-cyan-200/65">{tr('contactExpectReply')}</p>
          </RevealOnView>

          <RevealStagger className="mt-12 grid gap-6 md:grid-cols-3">
            <a
              href={`mailto:${supportEmail}`}
              className="isit-card block rounded-2xl p-6 no-underline motion-safe-transition hover:border-cyan-300/40"
            >
              <Mail className="h-8 w-8 text-cyan-400" aria-hidden />
              <h2 className="mt-4 text-lg font-bold isit-text-primary">{tr('labelEmail')}</h2>
              <p className="mt-1 text-sm isit-body/70">{supportEmail}</p>
              <p className="mt-3 text-xs text-sky-600 dark:text-cyan-300">Best for detailed requests</p>
            </a>
            <a href="tel:+911234567890" className="isit-card block rounded-2xl p-6 no-underline motion-safe-transition hover:border-cyan-300/40">
              <Phone className="h-8 w-8 text-cyan-400" aria-hidden />
              <h2 className="mt-4 text-lg font-bold isit-text-primary">Phone</h2>
              <p className="mt-1 text-sm isit-body/70">+91 12345 67890</p>
              <p className="mt-3 text-xs text-sky-600 dark:text-cyan-300">Weekdays 10:00–18:00 IST</p>
            </a>
            <div className="isit-glass rounded-2xl p-6">
              <MapPin className="h-8 w-8 text-cyan-400" aria-hidden />
              <h2 className="mt-4 text-lg font-bold isit-text-primary">Head office</h2>
              <p className="mt-1 text-sm isit-body/70">India</p>
              <p className="mt-3 text-xs text-sky-600 dark:text-cyan-300">Pan-India · Remote-first team</p>
            </div>
          </RevealStagger>

          <RevealOnView delayMs={60} className="mt-10 rounded-3xl isit-glass p-8 sm:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <MessageCircle className="h-10 w-10 shrink-0 text-cyan-400" aria-hidden />
              <div className="flex-1">
                <h2 className="text-xl font-bold isit-text-primary">{tr('contactParentsTitle')}</h2>
                <p className="mt-2 text-sm leading-relaxed isit-body">{tr('contactParentsBody')}</p>
                <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-cyan-200/70">{tr('contactPartnersHint')}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/signup" className="isit-btn-primary no-underline inline-flex min-h-11 items-center px-6">
                    {tr('createFreeAccount')}
                  </Link>
                  <Link href="/login" className="isit-btn-secondary no-underline inline-flex min-h-11 items-center px-6">
                    {tr('logIn')}
                  </Link>
                  <Link href="/how-it-works" className="isit-btn-secondary no-underline inline-flex min-h-11 items-center border border-slate-200 dark:border-cyan-400/25 bg-white dark:bg-slate-950/45 px-6">
                    {tr('footerHowItWorksLink')}
                  </Link>
                </div>
                <p className="mt-6 text-sm text-slate-600 dark:text-cyan-200/75">
                  <Link href="/how-it-works" className="font-medium text-sky-600 dark:text-cyan-300 underline-offset-2 hover:underline">
                    {tr('contactSeeHow')}
                  </Link>
                </p>
              </div>
            </div>
          </RevealOnView>

          <RevealOnView delayMs={80} className="mt-8 text-center text-xs text-slate-600 dark:text-cyan-200/55">
            <p id="social">
              Social channels are opening soon — follow updates via email or check our{' '}
              <Link href="/blog" className="text-sky-600 dark:text-cyan-300 underline-offset-2 hover:underline">
                blog
              </Link>
              .
            </p>
          </RevealOnView>
        </div>
      </section>
    </SiteShell>
  );
}
