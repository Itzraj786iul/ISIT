'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

type Props = {
  email?: string;
  onResolved?: () => void;
};

export default function EmailVerificationBanner({ email, onResolved }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const resend = async () => {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        credentials: 'include',
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setErr(data.message || 'Could not send email.');
        return;
      }
      setMsg(data.message || 'Check your inbox.');
      onResolved?.();
    } catch {
      setErr('Network error.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="isit-verification-banner rounded-2xl px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex gap-3 min-w-0">
        <Mail className="w-5 h-5 shrink-0 text-sky-600 dark:text-amber-200 mt-0.5" aria-hidden />
        <div className="min-w-0">
          <p className="isit-verification-banner-title">Verify your email</p>
          <p className="isit-verification-banner-body mt-0.5">
            {email ? (
              <>
                We sent a link to <span className="font-medium">{email}</span>. Confirm it to secure your account.
              </>
            ) : (
              <>Confirm your email address to secure your account.</>
            )}
          </p>
          {msg && <p className="text-emerald-700 dark:text-emerald-300 mt-1">{msg}</p>}
          {err && <p className="text-red-700 dark:text-red-300 mt-1">{err}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={resend}
        disabled={busy}
        className="isit-verification-banner-btn shrink-0 rounded-xl px-4 py-2 disabled:opacity-50"
      >
        {busy ? 'Sending…' : 'Resend email'}
      </button>
    </div>
  );
}
