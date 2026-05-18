'use client';

import SiteShell from '@/components/SiteShell';
import { useState } from 'react';
import Link from 'next/link';
import { useT } from '@/lib/t';

export default function ForgotPasswordPage() {
  const tr = useT();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setBusy(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      setMsg(data.message || 'If an account exists for that email, we sent instructions.');
    } catch {
      setErr('Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SiteShell variant="auth" showFooter={false}>
      <main className="flex-1 max-w-md mx-auto px-4 py-12 w-full">
        <div className="isit-glass rounded-3xl p-8">
          <h1 className="text-2xl font-bold isit-body">{tr('forgotPasswordTitle')}</h1>
          <p className="isit-body/70 text-sm mt-2">{tr('forgotPasswordLead')}</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="fp-email" className="block text-sm font-medium isit-body/90 mb-1">
                {tr('labelEmail')}
              </label>
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-cyan-400/25 bg-slate-100 dark:bg-white dark:bg-slate-950/70 px-4 py-3 isit-text-primary placeholder:isit-body/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
            {err && <p className="text-red-300 text-sm">{err}</p>}
            {msg && <p className="text-emerald-300 text-sm">{msg}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full isit-btn-primary border-0 py-3 disabled:opacity-50"
            >
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm isit-body/70">
            <Link href="/login" className="text-sky-600 dark:text-cyan-300 hover:underline font-medium">
              Back to sign in
            </Link>
          </p>
        </div>
      </main>
    </SiteShell>
  );
}
