'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react';

type User = { _id?: string; name: string; email: string; role: string };

type EnrolledItem = {
  course: { _id: string; title: string; description?: string; teacherId?: { name?: string }; image?: string };
  lessonCount: number;
  completedCount: number;
  progressPercent: number;
  nextLessonId: string | null;
  nextLessonTitle: string | null;
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [enrolled, setEnrolled] = useState<EnrolledItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(userStr) as User;
    if (userData.role?.toLowerCase() === 'teacher') {
      router.push('/teacher/dashboard');
      return;
    }
    setUser(userData);

    const uid = userData._id || (userData as unknown as { id?: string }).id;
    if (!uid) {
      setLoading(false);
      return;
    }

    const fetchEnrolled = async () => {
      try {
        const res = await fetch(`/api/student/enrolled-courses?userId=${encodeURIComponent(uid)}`);
        if (res.ok) {
          const data = await res.json();
          setEnrolled(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolled();
  }, [router]);

  const totalLessonsCompleted = enrolled.reduce((s, e) => s + e.completedCount, 0);
  const coursesCompleted = enrolled.filter((e) => e.progressPercent >= 100).length;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 min-w-0">
        {/* Welcome */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-lg shadow-sky-500/20">
            <p className="text-sky-100 text-sm font-medium mb-1">{getGreeting()}</p>
            <h1 className="text-2xl md:text-3xl font-bold">
              {user?.name ? `${user.name.split(' ')[0]}` : 'Student'}, ready to learn?
            </h1>
            <p className="text-sky-100 mt-1 text-sm md:text-base">
              Continue from where you left off or explore new courses.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="bg-white/15 backdrop-blur rounded-xl px-4 py-3">
                <span className="text-2xl font-bold block">{enrolled.length}</span>
                <span className="text-sky-100 text-xs">Enrolled courses</span>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl px-4 py-3">
                <span className="text-2xl font-bold block">{totalLessonsCompleted}</span>
                <span className="text-sky-100 text-xs">Lessons completed</span>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl px-4 py-3">
                <span className="text-2xl font-bold block">{coursesCompleted}</span>
                <span className="text-sky-100 text-xs">Courses completed</span>
              </div>
            </div>
          </div>
        </section>

        {/* Course progress */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Continue learning</h2>
            {enrolled.length > 0 && (
              <Link href="/my-courses" className="text-sky-600 text-sm font-medium hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
              Loading your courses...
            </div>
          ) : enrolled.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-sky-100 text-sky-600 mb-4">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No courses yet</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                Enroll in a course to start learning. Your progress will show here.
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 bg-sky-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-sky-600 transition"
              >
                <Sparkles className="w-4 h-4" /> Browse courses
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {enrolled.slice(0, 4).map((item) => (
                <div
                  key={item.course._id}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition shadow-sm"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-800 truncate">{item.course.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {typeof item.course.teacherId === 'object' && item.course.teacherId?.name
                          ? item.course.teacherId.name
                          : 'Instructor'}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sky-500 rounded-full transition-all"
                            style={{ width: `${item.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                          {item.progressPercent}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.completedCount} of {item.lessonCount} lessons
                      </p>
                    </div>
                    <Link
                      href={item.nextLessonId ? `/lesson/${item.nextLessonId}` : `/course/${item.course._id}`}
                      className="flex-shrink-0 inline-flex items-center gap-1 bg-sky-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-sky-600 transition"
                    >
                      {item.nextLessonId ? 'Continue' : 'View'}{' '}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition"
            >
              <BookOpen className="w-4 h-4 text-sky-500" /> Browse all courses
            </Link>
            <Link
              href="/analytics"
              className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition"
            >
              <Sparkles className="w-4 h-4 text-sky-500" /> View analytics
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
