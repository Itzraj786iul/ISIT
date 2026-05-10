'use client';

/**
 * @legacy MARKETPLACE_LMS — Certificate keyed by `courseId`. Future: /certificate/topic/[topicId] from mastery.
 * Migration: docs/AI_FIRST_MIGRATION.md
 */
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { Award, Download, ChevronLeft, Loader2 } from 'lucide-react';

export default function CertificatePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const [courseTitle, setCourseTitle] = useState<string>('Course');
  const [userName, setUserName] = useState<string>('Student');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!meRes.ok) { router.push('/login'); return; }
      const meData = await meRes.json();
      setUserName(meData.user?.name || 'Student');

      if (courseId) {
        try {
          const res = await fetch(`/api/course/${courseId}`);
          if (res.ok) {
            const data = await res.json();
            setCourseTitle(data.course?.title || 'Course');
          }
        } catch {
          // keep default
        }
      }
      setLoading(false);
    };
    run();
  }, [courseId, router]);

  if (loading) {
    return (
      <div className="isit-cosmic-bg min-h-screen flex font-sans text-cyan-50 relative">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="isit-cosmic-bg min-h-screen flex font-sans text-cyan-50 relative">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
        <Link href="/my-courses" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-medium mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to My Courses
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-lg overflow-hidden p-8 sm:p-12 text-center">
            <Award className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-2">Certificate of Completion</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">This is to certify that</h1>
            <p className="text-xl font-semibold text-slate-700 mb-6">{userName}</p>
            <p className="text-slate-600 mb-1">has successfully completed the course</p>
            <p className="text-lg font-bold text-slate-800 mb-8">{courseTitle}</p>
            <p className="text-sm text-slate-500">ISIC &middot; Indian School of Innovation and Curiosity</p>
            <p className="text-xs text-slate-400 mt-2">Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <button
              type="button"
              onClick={() => window.print()}
              className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white font-medium rounded-xl hover:bg-sky-600 transition"
            >
              <Download className="w-4 h-4" /> Download / Print
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
