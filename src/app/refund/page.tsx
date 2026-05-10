import Link from 'next/link';
import type { Metadata } from 'next';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Refund policy',
  description: 'How refunds and cancellations work for ISIC courses and programs.',
};

export default function RefundPolicyPage() {
  return (
    <div className="isit-cosmic-bg min-h-screen text-cyan-50 flex flex-col">
      <PublicNav />

      <main className="mx-auto max-w-3xl flex-1 px-4 py-14 sm:px-6 sm:py-20">
        <div className="isit-glass rounded-3xl p-7 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Policies</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Refund policy</h1>
          <p className="mt-2 text-sm text-cyan-200/65">Last updated: May 2026</p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-cyan-100/85">
            <p>
              ISIC aims for fair, transparent billing. Refund eligibility depends on the product you purchased (marketplace course,
              school program, or subscription). Specific terms are confirmed at checkout and in your order confirmation email.
            </p>
            <p>
              <strong className="text-cyan-50">Course enrollments:</strong> If a course fails to deliver advertised core content within the
              stated access window, contact support within 14 days of purchase with your order ID. Approved refunds are processed to the
              original payment method within 10–14 business days where payment partners allow.
            </p>
            <p>
              <strong className="text-cyan-50">Subscriptions / school licenses:</strong> Cancellation stops renewal; already-paid periods
              typically remain active until the end of the billing cycle unless your contract states otherwise.
            </p>
            <p>
              <strong className="text-cyan-50">Charge disputes:</strong> Email{' '}
              <a href="mailto:hello@isic.in" className="text-cyan-300 underline-offset-2 hover:underline">
                hello@isic.in
              </a>{' '}
              before initiating a card chargeback so we can resolve the issue quickly.
            </p>
          </div>

          <p className="mt-10 text-sm">
            <Link href="/terms" className="text-cyan-300 underline-offset-2 hover:underline">
              Terms of Service
            </Link>
            {' · '}
            <Link href="/privacy" className="text-cyan-300 underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
            {' · '}
            <Link href="/contact" className="text-cyan-300 underline-offset-2 hover:underline">
              Contact
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
