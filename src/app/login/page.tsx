'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { persistAuthFromLogin } from '@/lib/client-auth';
import { useAuth } from '@/lib/auth-context';

function LoginForm() {
  const router = useRouter();
  const { refresh } = useAuth();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
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

        // Redirect to personalized homepage by role (ignore returnUrl for teacher/parent)
        if (userRole === 'teacher') {
          router.push('/teacher/dashboard');
          return;
        }
        if (userRole === 'parent') {
          router.push('/parent/dashboard');
          return;
        }
        // Student: use returnUrl if present, else dashboard
        if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
          router.push(returnUrl);
        } else {
          router.push('/dashboard');
        }

      } else {
        console.error("No user data found in response!");
        router.push('/login');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      
      {/* ================= SIMPLE HEADER ================= */}
      <div className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center">
           <Link href="/" className="text-sky-500 font-bold text-xl flex items-center gap-2 hover:text-sky-600">
             ISIT <span className="text-xs text-gray-400 font-normal ml-2">← Back to Home</span>
           </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row bg-white">
        
        {/* RIGHT SIDE: Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 py-12 lg:px-16 order-2 md:order-1">
          
          {/* Logo (Mobile Only) */}
          <div className="mb-6 md:hidden">
             <h1 className="text-2xl font-bold text-sky-500">ISIT</h1>
          </div>

          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to continue your learning journey
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleLogin}>
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                 <div>
                    <label htmlFor="email-address" className="sr-only">Email address</label>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
                      className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm text-gray-600">Remember me on this device</span>
                  </label>
              </div>

              <div>
                <div className="flex items-center justify-between">
                   <span className="text-sm text-slate-400 cursor-default">Forgot Password?</span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="font-bold text-sky-600 hover:text-sky-800">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* LEFT SIDE */}
        <div className="hidden md:block w-1/2 bg-gradient-to-br from-sky-500 to-blue-600 relative overflow-hidden order-1 md:order-2">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-8">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl font-bold">I</span>
              </div>
              <h2 className="text-3xl font-bold mb-3">Welcome to ISIT</h2>
              <p className="text-sky-100 text-sm max-w-sm">Indian School of Innovation and Thinking. Learn at your own pace with AI-powered tutoring.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}