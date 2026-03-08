'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
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
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      // === DEBUGGING (Open Browser Console to see this) ===
      console.log("Login Response Data:", data);
      console.log("User Role Detected:", data.user?.role);
      // ==============================================

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

       // Check if user object exists before saving
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log("User saved to localStorage");

        // ================= THE FIX =================
        // We use .toLowerCase() to handle 'Teacher' (Capital) vs 'teacher' (Lowercase)
        const userRole = data.user.role?.toLowerCase();

        if (userRole === 'teacher') {
          router.push('/teacher/dashboard');
        } else {
          // Students and Parents go to main dashboard
          router.push('/dashboard');
        }
        // ===========================================

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

            {/* Social Login Buttons */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full flex items-center justify-center py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                onClick={() => alert('Google Login: Coming in Phase 2')}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-center py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                onClick={() => alert('Facebook Login: Coming in Phase 2')}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
                Facebook
              </button>
            </div>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            {/* Actual Login Form */}
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
              </div>

              <div>
                <div className="flex items-center justify-between">
                   <Link href="#" className="text-sm text-sky-600 hover:underline">Forgot Password?</Link>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
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

        {/* LEFT SIDE: Illustration */}
        <div className="hidden md:block w-1/2 bg-sky-50 relative overflow-hidden order-1 md:order-2">
           <img 
             src="/assets/login-illustration.png" 
             alt="Learning Illustration" 
             className="absolute inset-0 w-full h-full object-cover"
             onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"; 
             }}
           />
           <div className="absolute inset-0 bg-sky-900 opacity-5"></div>
        </div>

      </div>
    </div>
  );
}