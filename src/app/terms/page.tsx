'use client';

import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <PublicNav />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Terms of Service</h1>
        <p className="mt-2 text-slate-600">Last updated: March 2026</p>

        <div className="mt-10 sm:mt-12 space-y-8 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">1. Acceptance of Terms</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              By accessing or using Indian School of Innovation and Thinking (ISIT), you agree to these Terms of Service.
              If you do not agree, please do not use our platform.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">2. Use of the Platform</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              You may use our platform for learning, teaching (if registered as a teacher), and related activities.
              You must not misuse the service, share account credentials, or violate any applicable laws.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">3. Payments and Refunds</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              Course fees are as stated at checkout. Refund policy is per course; please check the course page before purchase.
              We reserve the right to change pricing with notice.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">4. Intellectual Property</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              Course content, materials, and platform design are owned by ISIT or our licensors. You may not copy,
              redistribute, or resell course content without permission.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">5. Contact</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              For questions about these terms, contact us at support@isit.in (replace with your contact).
            </p>
          </section>
        </div>

        <p className="mt-12 pt-8 border-t border-slate-200">
          <Link href="/" className="text-sky-600 hover:text-sky-700 font-medium">← Back to Home</Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
