'use client';

import SiteShell from '@/components/SiteShell';
import Link from 'next/link';
import { getSupportEmail } from '@/lib/support-email';

export default function TermsPage() {
  return (
    <SiteShell variant="public">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="isit-glass rounded-3xl p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-cyan-100">Terms of Service</h1>
        <p className="mt-2 text-cyan-100/70">Last updated: March 2026</p>

        <div className="mt-10 sm:mt-12 space-y-8 text-cyan-100/85">
          <section>
            <h2 className="text-xl font-semibold text-cyan-100 mb-2">1. Acceptance of Terms</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              By accessing or using Indian School of Innovation and Curiosity (ISIC), you agree to these Terms of Service.
              If you do not agree, please do not use our platform.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-cyan-100 mb-2">2. Use of the Platform</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              You may use our platform for learning, teaching (if registered as a teacher), and related activities.
              You must not misuse the service, share account credentials, or violate any applicable laws.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-cyan-100 mb-2">3. Payments and Refunds</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              Course fees are as stated at checkout. Refund policy is per course; please check the course page before purchase.
              We reserve the right to change pricing with notice.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-cyan-100 mb-2">4. Intellectual Property</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              Course content, materials, and platform design are owned by ISIC or our licensors. You may not copy,
              redistribute, or resell course content without permission.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-cyan-100 mb-2">5. Contact</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              For questions about these terms, contact us at{' '}
              <a href={`mailto:${getSupportEmail()}`} className="text-cyan-300 hover:text-cyan-200 underline">
                {getSupportEmail()}
              </a>
              .
            </p>
          </section>
        </div>

        <p className="mt-12 pt-8 border-t border-cyan-300/20">
          <Link href="/" className="text-cyan-300 hover:text-cyan-200 font-medium">← Back to Home</Link>
        </p>
        </div>
      </main>
    </SiteShell>
  );
}
