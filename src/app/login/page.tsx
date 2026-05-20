'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { persistAuthFromLogin } from '@/lib/client-auth';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/t';
import { Sparkles } from 'lucide-react';
import SiteShell from '@/components/SiteShell';
import { ThemeToggle } from '@/components/ThemeToggle';

function LoginForm() {
  const router = useRouter();
  const { refresh } = useAuth();
  const tr = useT();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const passwordResetOk = searchParams.get('reset') === '1';
  const safeReturn =
    returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : null;
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...formData, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.user) {
        if (typeof data.token === 'string' && data.token) {
          persistAuthFromLogin(data.token, data.user as Record<string, unknown>);
        }

        await refresh({ force: true });

        const userRole = (data.user.role ?? 'student').toString().toLowerCase();

        if (userRole === 'admin') {
          router.replace('/organization');
          return;
        }
        if (userRole === 'teacher') {
          router.replace('/teacher/dashboard');
          return;
        }
        if (userRole === 'parent') {
          router.replace('/parent/dashboard');
          return;
        }
        if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
          router.replace(returnUrl);
        } else {
          router.replace('/dashboard');
        }
      } else {
        setError('Something went wrong. Please try signing in again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteShell variant="auth" className="flex flex-col">
      <header className="isit-shell-header relative z-[1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 isit-accent-text font-semibold transition-colors no-underline hover:isit-body"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/20 isit-accent-text animate-pulse-cyan">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>ISIC</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/" className="text-sm isit-muted hover:isit-text-primary no-underline">
              {tr('funnelBackHome')}
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row relative z-[1]">
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 order-2 lg:order-1">
          <div className="max-w-md w-full mx-auto isit-auth-panel p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-widest isit-accent-text opacity-90 mb-2">Welcome back</p>
            <h1 className="text-2xl sm:text-3xl font-bold isit-text-primary mb-2">{tr('logIn')}</h1>
            <p className="text-sm isit-body mb-6">{tr('loginLead')}</p>

            {safeReturn && (
              <div
                role="status"
                className="mb-6 rounded-xl border border-[color:var(--isit-border)] bg-[var(--isit-surface-muted)] px-4 py-3 text-xs leading-relaxed isit-body"
              >
                {tr('loginContinueTo')}{' '}
                <span className="font-semibold isit-text-primary">{safeReturn}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
              {passwordResetOk && (
                <div
                  role="status"
                  className="p-3 text-sm text-emerald-200 bg-emerald-950/40 rounded-xl border border-emerald-400/30"
                >
                  Password updated. Sign in with your new password.
                </div>
              )}
              {error && (
                <div
                  role="alert"
                  className="p-3 text-sm text-red-200 bg-red-950/50 rounded-xl border border-red-400/30"
                >
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label htmlFor="email-address" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide isit-accent-text/85">
                    {tr('labelEmail')}
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="isit-input"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide isit-accent-text/85">
                    {tr('labelPassword')}
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="isit-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-cyan-400/40 bg-white dark:bg-slate-950/80 text-cyan-400 focus:ring-cyan-400"
                  />
                  <span className="text-sm isit-body">Remember me on this device</span>
                </label>
                <div className="text-right">
                  <Link href="/forgot-password" className="text-sm font-medium isit-accent-text hover:isit-accent-text underline-offset-2 hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button type="submit" disabled={loading} className="isit-btn-primary w-full min-h-11 disabled:opacity-50">
                {loading ? 'Signing in…' : tr('logIn')}
              </button>
            </form>

            <p className="mt-6 text-center text-sm isit-body">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold isit-accent-text hover:isit-accent-text underline-offset-2 hover:underline">
                {tr('signUp')}
              </Link>
            </p>
            <p className="mt-4 text-center text-sm isit-muted">
              New to ISIC?{' '}
              <Link href="/how-it-works" className="font-medium isit-accent-text underline-offset-2 hover:underline">
                {tr('footerHowItWorksLink')}
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 order-1 lg:order-2 items-stretch justify-center p-10 xl:p-16 border-l border-[color:var(--isit-border)] isit-auth-marketing">
          <div className="max-w-md flex flex-col justify-center text-left">
            <div className="inline-flex items-center gap-2 isit-chip mb-6 w-fit">
              <Sparkles className="w-4 h-4 isit-accent-text" aria-hidden />
              AI-first learning
            </div>
            <h2 className="text-3xl xl:text-4xl font-bold isit-text-primary mb-4 leading-tight">
              Learn with a tutor that adapts to you
            </h2>
            <p className="isit-body leading-relaxed">
              Indian School of Innovation and Curiosity — structured curriculum, mastery tracking, and classroom tools
              for schools and families.
            </p>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="isit-app-bg min-h-screen flex items-center justify-center">
          <p className="text-sm">Loading…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
