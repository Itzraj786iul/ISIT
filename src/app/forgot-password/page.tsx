'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';

export default function ForgotPasswordPage() {
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
    <div className="isit-cosmic-bg min-h-screen text-cyan-50 flex flex-col">
      <PublicNav />
      <main className="flex-1 max-w-md mx-auto px-4 py-12 w-full">
        <div className="isit-glass rounded-3xl p-8">
          <h1 className="text-2xl font-bold text-cyan-100">Forgot password</h1>
          <p className="text-cyan-100/70 text-sm mt-2">
            Enter your email and we&apos;ll send a reset link if an account exists.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="fp-email" className="block text-sm font-medium text-cyan-100/90 mb-1">
                Email
              </label>
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-cyan-400/25 bg-slate-950/70 px-4 py-3 text-cyan-50 placeholder:text-cyan-100/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
          <p className="mt-6 text-center text-sm text-cyan-100/70">
            <Link href="/login" className="text-cyan-300 hover:underline font-medium">
              Back to sign in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
