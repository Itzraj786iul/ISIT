'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const { refresh } = useAuth();

  const [status, setStatus] = useState<'idle' | 'ok' | 'bad'>('idle');
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('bad');
      setMsg('Missing verification token.');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        if (cancelled) return;
        if (res.ok) {
          setStatus('ok');
          setMsg(data.message || 'Your email is verified.');
          await refresh({ force: true });
        } else {
          setStatus('bad');
          setMsg(data.message || 'Verification failed.');
        }
      } catch {
        if (!cancelled) {
          setStatus('bad');
          setMsg('Network error.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, refresh]);

  return (
    <div className="isit-glass rounded-3xl p-8 text-center">
      {status === 'idle' && <p className="text-cyan-100">Verifying your email…</p>}
      {status === 'ok' && <p className="text-emerald-300 font-medium">{msg}</p>}
      {status === 'bad' && <p className="text-red-300">{msg}</p>}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/dashboard" className="isit-btn-primary no-underline inline-flex justify-center py-2.5 px-6">
          Go to dashboard
        </Link>
        <Link href="/login" className="isit-btn-secondary no-underline inline-flex justify-center py-2.5 px-6">
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="isit-cosmic-bg min-h-screen text-cyan-50 flex flex-col">
      <PublicNav />
      <main className="flex-1 max-w-md mx-auto px-4 py-12 w-full">
        <Suspense fallback={<div className="text-cyan-200 text-sm text-center">Loading…</div>}>
          <VerifyEmailInner />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
