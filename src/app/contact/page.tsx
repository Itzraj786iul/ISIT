'use client';

import Link from 'next/link';
import { Mail, MapPin, Phone, MessageCircle } from 'lucide-react';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';
import { useT } from '@/lib/t';

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || 'hello@isic.in';

export default function ContactPage() {
  const tr = useT();

  return (
    <div className="isit-cosmic-bg flex min-h-screen flex-col text-cyan-50">
      <PublicNav />

      <section className="relative flex-1 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <RevealOnView>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{tr('footerContact')}</p>
            <h1 className="mt-3 text-4xl font-black sm:text-5xl">We&apos;re here to help</h1>
            <p className="mt-4 max-w-2xl text-base text-cyan-100/75">{tr('contactPageLead')}</p>
            <p className="mt-3 max-w-2xl text-sm text-cyan-200/65">{tr('contactExpectReply')}</p>
          </RevealOnView>

          <RevealStagger className="mt-12 grid gap-6 md:grid-cols-3">
            <a
              href={`mailto:${supportEmail}`}
              className="isit-glass block rounded-2xl p-6 no-underline motion-safe-transition hover:border-cyan-300/40"
            >
              <Mail className="h-8 w-8 text-cyan-400" aria-hidden />
              <h2 className="mt-4 text-lg font-bold text-cyan-50">{tr('labelEmail')}</h2>
              <p className="mt-1 text-sm text-cyan-100/70">{supportEmail}</p>
              <p className="mt-3 text-xs text-cyan-300">Best for detailed requests</p>
            </a>
            <a href="tel:+911234567890" className="isit-glass block rounded-2xl p-6 no-underline motion-safe-transition hover:border-cyan-300/40">
              <Phone className="h-8 w-8 text-cyan-400" aria-hidden />
              <h2 className="mt-4 text-lg font-bold text-cyan-50">Phone</h2>
              <p className="mt-1 text-sm text-cyan-100/70">+91 12345 67890</p>
              <p className="mt-3 text-xs text-cyan-300">Weekdays 10:00–18:00 IST</p>
            </a>
            <div className="isit-glass rounded-2xl p-6">
              <MapPin className="h-8 w-8 text-cyan-400" aria-hidden />
              <h2 className="mt-4 text-lg font-bold text-cyan-50">Head office</h2>
              <p className="mt-1 text-sm text-cyan-100/70">India</p>
              <p className="mt-3 text-xs text-cyan-300">Pan-India · Remote-first team</p>
            </div>
          </RevealStagger>

          <RevealOnView delayMs={60} className="mt-10 rounded-3xl isit-glass p-8 sm:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <MessageCircle className="h-10 w-10 shrink-0 text-cyan-400" aria-hidden />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-cyan-50">{tr('contactParentsTitle')}</h2>
                <p className="mt-2 text-sm leading-relaxed text-cyan-100/75">{tr('contactParentsBody')}</p>
                <p className="mt-4 text-xs leading-relaxed text-cyan-200/70">{tr('contactPartnersHint')}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/signup" className="isit-btn-primary no-underline inline-flex min-h-11 items-center px-6">
                    {tr('createFreeAccount')}
                  </Link>
                  <Link href="/login" className="isit-btn-secondary no-underline inline-flex min-h-11 items-center px-6">
                    {tr('logIn')}
                  </Link>
                  <Link href="/how-it-works" className="isit-btn-secondary no-underline inline-flex min-h-11 items-center border border-cyan-400/25 bg-slate-950/45 px-6">
                    {tr('footerHowItWorksLink')}
                  </Link>
                </div>
                <p className="mt-6 text-sm text-cyan-200/75">
                  <Link href="/how-it-works" className="font-medium text-cyan-300 underline-offset-2 hover:underline">
                    {tr('contactSeeHow')}
                  </Link>
                </p>
              </div>
            </div>
          </RevealOnView>

          <RevealOnView delayMs={80} className="mt-8 text-center text-xs text-cyan-200/55">
            <p id="social">
              Social channels are opening soon — follow updates via email or check our{' '}
              <Link href="/blog" className="text-cyan-300 underline-offset-2 hover:underline">
                blog
              </Link>
              .
            </p>
          </RevealOnView>
        </div>
      </section>

      <Footer />
    </div>
  );
}
