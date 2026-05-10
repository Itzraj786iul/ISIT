'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { ChevronRight, BookOpen, Video, Mail } from 'lucide-react';

export default function HelpPage() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) { router.push('/login'); return; }
        const data = await r.json();
        if (data.user?.role?.toLowerCase() === 'teacher') router.push('/teacher/dashboard');
      })
      .catch(() => router.push('/login'));
  }, [router]);

  return (
    <div className="isit-cosmic-bg min-h-screen flex font-sans text-cyan-50 relative">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden relative z-[1]">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-cyan-50 tracking-tight">Help &amp; support</h1>
          <p className="text-cyan-100/70 text-sm mt-1">FAQs and how to get in touch</p>
        </div>

        <div className="max-w-2xl space-y-4">
          <Link
            href="/schedule"
            className="flex items-center justify-between p-4 isit-glass rounded-xl no-underline text-cyan-50 hover:border-cyan-300/40 motion-safe-transition"
          >
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-cyan-400" />
              <span className="font-medium">How do I join a live class?</span>
            </div>
            <ChevronRight className="w-5 h-5 text-cyan-300/50" />
          </Link>
          <Link
            href="/my-courses"
            className="flex items-center justify-between p-4 isit-glass rounded-xl no-underline text-cyan-50 hover:border-cyan-300/40 motion-safe-transition"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span className="font-medium">Where are my courses and lessons?</span>
            </div>
            <ChevronRight className="w-5 h-5 text-cyan-300/50" />
          </Link>
          <div className="p-4 isit-glass rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-cyan-400" />
              <span className="font-medium text-cyan-50">Contact support</span>
            </div>
            <p className="text-sm text-cyan-100/75">
              Email us at{' '}
              <a href="mailto:support@isit.in" className="text-cyan-300 hover:underline font-medium">
                support@isit.in
              </a>{' '}
              for help with your account, live classes, or technical issues.
            </p>
          </div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-cyan-300 text-sm font-medium hover:underline">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
