'use client';

import SiteShell from '@/components/SiteShell';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useT } from '@/lib/t';

function ResetPasswordForm() {
  const tr = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!token) {
      setErr('Invalid reset link.');
      return;
    }
    if (password !== confirm) {
      setErr('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setErr(data.message || 'Reset failed.');
        return;
      }
      router.replace('/login?reset=1');
    } catch {
      setErr('Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <div className="isit-glass rounded-3xl p-8 text-center">
        <p className="isit-body">This reset link is invalid or expired.</p>
        <Link href="/forgot-password" className="inline-block mt-4 text-sky-600 dark:text-cyan-300 hover:underline font-medium">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="isit-glass rounded-3xl p-8">
      <h1 className="text-2xl font-bold isit-body">Set a new password</h1>
      <p className="mt-2 text-sm isit-body/70">{tr('resetPasswordLead')}</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="np" className="block text-sm font-medium isit-body/90 mb-1">
            New password
          </label>
          <input
            id="np"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-cyan-400/25 bg-slate-100 dark:bg-white dark:bg-slate-950/70 px-4 py-3 isit-text-primary focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
        <div>
          <label htmlFor="npc" className="block text-sm font-medium isit-body/90 mb-1">
            Confirm password
          </label>
          <input
            id="npc"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-cyan-400/25 bg-slate-100 dark:bg-white dark:bg-slate-950/70 px-4 py-3 isit-text-primary focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
        {err && <p className="text-red-300 text-sm">{err}</p>}
        <button type="submit" disabled={busy} className="w-full isit-btn-primary border-0 py-3 disabled:opacity-50">
          {busy ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <SiteShell variant="auth" showFooter={false}>
      <main className="flex-1 max-w-md mx-auto px-4 py-12 w-full">
        <Suspense fallback={<div className="text-slate-600 dark:text-cyan-200 text-sm">Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>
      </main>
    </SiteShell>
  );
}
