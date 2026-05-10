'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { persistAuthFromLogin } from '@/lib/client-auth';
import { useAuth } from '@/lib/auth-context';
import { Sparkles } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const { refresh } = useAuth();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const passwordResetOk = searchParams.get('reset') === '1';
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
          router.push('/organization');
          return;
        }
        if (userRole === 'teacher') {
          router.push('/teacher/dashboard');
          return;
        }
        if (userRole === 'parent') {
          router.push('/parent/dashboard');
          return;
        }
        if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
          router.push(returnUrl);
        } else {
          router.push('/dashboard');
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
    <div className="isit-cosmic-bg min-h-screen flex flex-col text-cyan-50">
      <header className="relative z-[1] border-b border-cyan-400/15 bg-slate-950/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-cyan-200 font-semibold hover:text-cyan-100 transition-colors no-underline"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-slate-950/60 text-cyan-300 text-sm font-bold animate-pulse-cyan">
              I
            </span>
            <span>ISIC</span>
          </Link>
          <Link href="/" className="text-sm text-cyan-200/80 hover:text-cyan-100 no-underline">
            ← Back to home
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row relative z-[1]">
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 order-2 lg:order-1">
          <div className="max-w-md w-full mx-auto isit-glass rounded-3xl p-8 sm:p-10 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300/90 mb-2">Welcome back</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-cyan-50 mb-2">Sign in</h1>
            <p className="text-sm text-cyan-100/75 mb-8">Continue your sessions, assignments, and AI tutor.</p>

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
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-cyan-400/25 bg-slate-950/70 px-4 py-3 text-cyan-50 placeholder:text-cyan-200/45 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-cyan-400/25 bg-slate-950/70 px-4 py-3 text-cyan-50 placeholder:text-cyan-200/45 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-cyan-400/40 bg-slate-950/80 text-cyan-400 focus:ring-cyan-400"
                  />
                  <span className="text-sm text-cyan-100/80">Remember me on this device</span>
                </label>
                <div className="text-right">
                  <Link href="/forgot-password" className="text-sm font-medium text-cyan-300 hover:text-cyan-200 underline-offset-2 hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button type="submit" disabled={loading} className="isit-btn-primary w-full min-h-11 disabled:opacity-50">
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-cyan-100/75">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-cyan-300 hover:text-cyan-200 underline-offset-2 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 order-1 lg:order-2 items-stretch justify-center p-10 xl:p-16 border-l border-cyan-400/10 bg-gradient-to-br from-cyan-950/40 via-slate-950/20 to-transparent">
          <div className="max-w-md flex flex-col justify-center text-left">
            <div className="inline-flex items-center gap-2 isit-chip mb-6 w-fit">
              <Sparkles className="w-4 h-4 text-cyan-300" aria-hidden />
              AI-first learning
            </div>
            <h2 className="text-3xl xl:text-4xl font-bold text-cyan-50 mb-4 leading-tight">
              Learn with a tutor that adapts to you
            </h2>
            <p className="text-cyan-100/80 leading-relaxed">
              Indian School of Innovation and Curiosity — structured curriculum, mastery tracking, and classroom tools
              for schools and families.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="isit-cosmic-bg min-h-screen flex items-center justify-center text-cyan-200">
          <p className="text-sm">Loading…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
