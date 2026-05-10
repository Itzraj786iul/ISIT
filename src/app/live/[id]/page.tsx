'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { Video, ArrowLeft } from 'lucide-react';

export default function LiveSessionPage() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) router.push('/login');
      })
      .catch(() => router.push('/login'));
  }, [router]);

  return (
    <div className="isit-cosmic-bg min-h-screen flex font-sans text-cyan-50 relative">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
        <Link href="/schedule" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-medium mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to schedule
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-sky-500 text-white px-6 py-4 flex items-center gap-3">
              <Video className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">Live Session</h1>
                <p className="text-sky-100 text-sm">Interactive learning session</p>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <div className="aspect-video bg-slate-100 rounded-xl flex flex-col items-center justify-center gap-4 p-6 text-center">
                <Video className="w-16 h-16 text-slate-400" />
                <p className="text-slate-600 font-medium">Live session will start here</p>
                <p className="text-slate-500 text-sm max-w-md">
                  When the session is live, the video stream or meeting link will appear here. Check your Schedule for upcoming sessions.
                </p>
              </div>
              <p className="mt-6 text-slate-500 text-sm">
                You will receive a reminder before the session starts. Make sure notifications are enabled in Settings.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
