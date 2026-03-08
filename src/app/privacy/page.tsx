'use client';

import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <PublicNav />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-slate-600">Last updated: March 2026</p>

        <div className="mt-10 sm:mt-12 space-y-8 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">1. Information We Collect</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              We collect information you provide when you register (name, email, role), when you enroll in courses,
              and when you use our platform (progress, completions). We use cookies for authentication and preferences.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">2. How We Use Your Information</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              We use your information to deliver courses, track progress, process payments, and improve our services.
              We do not sell your personal data to third parties.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">3. Data Security</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              We use industry-standard measures to protect your data. Passwords are hashed; sensitive data is transmitted over HTTPS.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">4. Your Rights</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              You may request access to, correction of, or deletion of your personal data. Contact us at the email
              provided on our website.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">5. Contact</h2>
            <p className="text-sm sm:text-base leading-relaxed">
              For privacy-related questions, contact us at privacy@isit.in (replace with your contact).
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
