'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import { BookOpen, ChevronRight } from 'lucide-react';

type EnrolledItem = {
  course: { _id: string; title: string; description?: string; teacherId?: { name?: string }; image?: string };
  lessonCount: number;
  completedCount: number;
  progressPercent: number;
  nextLessonId: string | null;
  nextLessonTitle: string | null;
};

export default function MyCoursesPage() {
  const router = useRouter();
  const [enrolled, setEnrolled] = useState<EnrolledItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(userStr) as { _id?: string; id?: string; role?: string };
    if (userData.role?.toLowerCase() === 'teacher') {
      router.push('/teacher/dashboard');
      return;
    }

    const uid = userData._id || userData.id;
    if (!uid) {
      setLoading(false);
      return;
    }

    const fetchEnrolled = async () => {
      try {
        const res = await fetch(`/api/student/enrolled-courses?userId=${encodeURIComponent(uid)}`);
        if (res.ok) setEnrolled(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolled();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 min-w-0">
        <div className="max-w-4xl">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">My courses</h1>
          <p className="text-slate-500 text-sm mb-8">
            Courses you’re enrolled in. Continue from where you left off.
          </p>

          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
              Loading...
            </div>
          ) : enrolled.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-800 mb-2">No enrolled courses</h2>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                When you enroll in a course after checkout, it will appear here.
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 bg-sky-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-sky-600 transition"
              >
                Browse courses <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {enrolled.map((item) => (
                <li key={item.course._id}>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:border-slate-300 transition flex flex-col sm:flex-row">
                    <div className="sm:w-48 h-32 sm:h-auto sm:min-h-[120px] bg-slate-100 relative flex-shrink-0">
                      {item.course.image ? (
                        <Image
                          src={item.course.image}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-5 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-800">{item.course.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {typeof item.course.teacherId === 'object' && item.course.teacherId?.name
                            ? item.course.teacherId.name
                            : 'Instructor'}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-24 sm:w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-sky-500 rounded-full"
                              style={{ width: `${item.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-600">
                            {item.progressPercent}% · {item.completedCount}/{item.lessonCount} lessons
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link
                          href={item.nextLessonId ? `/lesson/${item.nextLessonId}` : `/course/${item.course._id}`}
                          className="inline-flex items-center gap-1 bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-600 transition"
                        >
                          {item.nextLessonId ? 'Continue' : 'View course'}{' '}
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/course/${item.course._id}`}
                          className="inline-flex items-center border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8">
            <Link
              href="/courses"
              className="text-sky-600 text-sm font-medium hover:underline"
            >
              ← Browse all courses
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
