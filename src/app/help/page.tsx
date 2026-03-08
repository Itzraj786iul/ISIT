'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { ChevronRight, BookOpen, Video, Mail } from 'lucide-react';

export default function HelpPage() {
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user?.role?.toLowerCase() === 'teacher') {
      router.push('/teacher/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Help & support</h1>
          <p className="text-slate-500 text-sm mt-1">FAQs and how to get in touch</p>
        </div>

        <div className="max-w-2xl space-y-4">
          <Link href="/schedule" className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-sky-200 no-underline text-slate-800">
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-sky-500" />
              <span className="font-medium">How do I join a live class?</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>
          <Link href="/my-courses" className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-sky-200 no-underline text-slate-800">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-sky-500" />
              <span className="font-medium">Where are my courses and lessons?</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-sky-500" />
              <span className="font-medium text-slate-800">Contact support</span>
            </div>
            <p className="text-sm text-slate-500">Email us at <a href="mailto:support@isit.in" className="text-sky-600 hover:underline">support@isit.in</a> for help with your account, live classes, or technical issues.</p>
          </div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sky-600 text-sm font-medium hover:underline">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
