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
    <div className="rounded-2xl border border-amber-400/35 bg-amber-950/40 px-4 py-3 text-sm text-amber-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex gap-3 min-w-0">
        <Mail className="w-5 h-5 shrink-0 text-amber-200 mt-0.5" aria-hidden />
        <div className="min-w-0">
          <p className="font-semibold text-amber-100">Verify your email</p>
          <p className="text-amber-100/80 mt-0.5">
            {email ? (
              <>
                We sent a link to <span className="font-medium text-amber-50">{email}</span>. Confirm it to secure your
                account.
              </>
            ) : (
              <>Confirm your email address to secure your account.</>
            )}
          </p>
          {msg && <p className="text-emerald-300 mt-1">{msg}</p>}
          {err && <p className="text-red-300 mt-1">{err}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={resend}
        disabled={busy}
        className="shrink-0 rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 py-2 font-medium text-amber-50 hover:bg-amber-500/25 disabled:opacity-50"
      >
        {busy ? 'Sending…' : 'Resend email'}
      </button>
    </div>
  );
}
