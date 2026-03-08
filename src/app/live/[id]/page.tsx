'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { Video, Calendar, Clock, ArrowLeft } from 'lucide-react';

const MOCK_SESSIONS: Record<string, { title: string; subtitle: string; time: string; duration: string; type: 'live' | 'onboarding' }> = {
  '1': { title: 'Python Functions - Live Session', subtitle: 'Introduction to Python', time: '10:00 AM', duration: '1 hour', type: 'live' },
  '2': { title: 'CSS Grid Assignment Due', subtitle: 'Web Development Basics', time: '11:59 PM', duration: '-', type: 'live' },
  '3': { title: 'React Hooks Workshop', subtitle: 'Advanced Frontend', time: '2:00 PM', duration: '1.5 hours', type: 'live' },
  'onboarding': { title: 'Welcome & Platform Tour', subtitle: 'Live onboarding for new students', time: '4:00 PM', duration: '45 min', type: 'onboarding' },
};

export default function LiveSessionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const session = MOCK_SESSIONS[id] || MOCK_SESSIONS['1'];

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
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
                <h1 className="text-xl font-bold">{session.title}</h1>
                <p className="text-sky-100 text-sm">{session.subtitle}</p>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap gap-4 text-slate-600 mb-6">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {session.time}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {session.duration}
                </span>
              </div>

              <div className="aspect-video bg-slate-100 rounded-xl flex flex-col items-center justify-center gap-4 p-6 text-center">
                <Video className="w-16 h-16 text-slate-400" />
                <p className="text-slate-600 font-medium">Live session will start here</p>
                <p className="text-slate-500 text-sm max-w-md">
                  When the session is live, the video stream or meeting link will appear here. You can join from your Schedule or when the teacher starts the class.
                </p>
                <button
                  type="button"
                  className="mt-2 px-6 py-3 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600 transition"
                >
                  Join when live
                </button>
              </div>

              <p className="mt-6 text-slate-500 text-sm">
                For onboarding classes and live lectures, you will receive a reminder before the session. Make sure notifications are enabled in Settings.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
