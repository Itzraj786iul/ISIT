'use client';

import SiteShell from '@/components/SiteShell';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <SiteShell variant="public">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="isit-glass rounded-3xl p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-cyan-100">Privacy Policy</h1>
        <p className="mt-2 text-cyan-100/70">Last updated: March 2026</p>

        <div className="mt-10 sm:mt-12 space-y-8 text-cyan-100/85">
          <section>
            <h2 className="text-xl font-semibold text-cyan-100 mb-2">1. Information We Collect</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              We collect information you provide when you register (name, email, role), when you enroll in courses,
              and when you use our platform (progress, completions). We use cookies for authentication and preferences.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-cyan-100 mb-2">2. How We Use Your Information</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              We use your information to deliver courses, track progress, process payments, and improve our services.
              We do not sell your personal data to third parties.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-cyan-100 mb-2">3. Data Security</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              We use industry-standard measures to protect your data. Passwords are hashed; sensitive data is transmitted over HTTPS.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-cyan-100 mb-2">4. Your Rights</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              You may request access to, correction of, or deletion of your personal data. Contact us at the email
              provided on our website.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-cyan-100 mb-2">5. Contact</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              For privacy-related questions, contact us at privacy@isit.in (replace with your contact).
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
