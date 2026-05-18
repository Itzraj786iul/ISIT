import SiteShell from '@/components/SiteShell';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund policy',
  description: 'How refunds and cancellations work for ISIC courses and programs.',
};

export default function RefundPolicyPage() {
  return (
    <SiteShell variant="public">
      <main className="mx-auto max-w-3xl flex-1 px-4 py-14 sm:px-6 sm:py-20">
        <div className="isit-glass rounded-3xl p-7 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-cyan-300">Policies</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Refund policy</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-cyan-200/65">Last updated: May 2026</p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed isit-muted">
            <p>
              ISIC aims for fair, transparent billing. Refund eligibility depends on the product you purchased (marketplace course,
              school program, or subscription). Specific terms are confirmed at checkout and in your order confirmation email.
            </p>
            <p>
              <strong className="isit-text-primary">Course enrollments:</strong> If a course fails to deliver advertised core content within the
              stated access window, contact support within 14 days of purchase with your order ID. Approved refunds are processed to the
              original payment method within 10–14 business days where payment partners allow.
            </p>
            <p>
              <strong className="isit-text-primary">Subscriptions / school licenses:</strong> Cancellation stops renewal; already-paid periods
              typically remain active until the end of the billing cycle unless your contract states otherwise.
            </p>
            <p>
              <strong className="isit-text-primary">Charge disputes:</strong> Email{' '}
              <a href="mailto:hello@isic.in" className="text-sky-600 dark:text-cyan-300 underline-offset-2 hover:underline">
                hello@isic.in
              </a>{' '}
              before initiating a card chargeback so we can resolve the issue quickly.
            </p>
          </div>

          <p className="mt-10 text-sm">
            <Link href="/terms" className="text-sky-600 dark:text-cyan-300 underline-offset-2 hover:underline">
              Terms of Service
            </Link>
            {' · '}
            <Link href="/privacy" className="text-sky-600 dark:text-cyan-300 underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
            {' · '}
            <Link href="/contact" className="text-sky-600 dark:text-cyan-300 underline-offset-2 hover:underline">
              Contact
            </Link>
          </p>
        </div>
      </main>
    </SiteShell>
  );
}
