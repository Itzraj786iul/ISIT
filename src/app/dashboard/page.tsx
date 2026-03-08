'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { BookOpen, ChevronRight, Flame, TrendingUp, Clock } from 'lucide-react';

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

const MOCK_ROADMAP = [
  { id: '1', title: 'Web Development Basics', status: 'completed' as const },
  { id: '2', title: 'Advanced JavaScript', status: 'completed' as const },
  { id: '3', title: 'React & Modern Frontend', status: 'in_progress' as const },
];

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

  const activeCourses = enrolled.filter((e) => e.progressPercent < 100).length;
  const coursesCompleted = enrolled.filter((e) => e.progressPercent >= 100).length;
  const currentStreak = 12;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 min-w-0">
        {/* Greeting banner */}
        <section className="mb-6">
          <div className="bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
            <h1 className="text-2xl md:text-3xl font-bold">{getGreeting()}</h1>
            <p className="text-sky-100 mt-1 text-sm md:text-base">
              Ready to continue your learning journey today?
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 flex items-center gap-2">
                <Flame className="w-5 h-5" />
                <span className="font-bold">{currentStreak} Day Streak</span>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-bold">{activeCourses} Active Courses</span>
              </div>
            </div>
          </div>
        </section>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Link href="/my-courses" className="block no-underline">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-sky-200 hover:shadow transition cursor-pointer flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500 font-medium">Active Courses</div>
                <div className="text-2xl font-extrabold text-slate-800">{activeCourses}</div>
              </div>
            </div>
          </Link>
          <Link href="/my-courses" className="block no-underline">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-emerald-200 hover:shadow transition cursor-pointer flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-600 text-xl">✓</span>
              </div>
              <div>
                <div className="text-sm text-slate-500 font-medium">Completed</div>
                <div className="text-2xl font-extrabold text-slate-800">{coursesCompleted}</div>
              </div>
            </div>
          </Link>
          <Link href="/analytics" className="block no-underline">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-200 hover:shadow transition cursor-pointer flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500 font-medium">Current Streak</div>
                <div className="text-2xl font-extrabold text-slate-800">{currentStreak} days</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Course Progress + Learning Roadmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Progress */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <Link href="/my-courses" className="text-lg font-bold text-slate-800 hover:text-sky-600 no-underline">
                Course Progress
              </Link>
              <Link href="/my-courses" className="text-slate-400 hover:text-sky-500" aria-label="My courses">
                <BookOpen className="w-5 h-5" />
              </Link>
            </div>
            <div className="p-5">
              {loading ? (
                <p className="text-slate-500 text-sm">Loading...</p>
              ) : enrolled.length === 0 ? (
                <>
                  <p className="text-slate-500 text-sm mb-4">No courses yet.</p>
                  <Link href="/courses" className="inline-flex items-center gap-1 text-sky-600 text-sm font-medium hover:underline">
                    Browse courses <ChevronRight className="w-4 h-4" />
                  </Link>
                </>
              ) : (
                <ul className="space-y-5">
                  {enrolled.slice(0, 2).map((item) => {
                    const instructor = typeof item.course.teacherId === 'object' && item.course.teacherId?.name
                      ? item.course.teacherId.name
                      : 'Instructor';
                    return (
                      <li key={item.course._id}>
                        <Link
                          href={item.nextLessonId ? `/lesson/${item.nextLessonId}` : `/course/${item.course._id}`}
                          className="block no-underline group"
                        >
                          <div className="flex gap-4">
                            <div className="relative w-14 h-14 flex-shrink-0">
                              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="16"
                                  fill="none"
                                  stroke="#8b5cf6"
                                  strokeWidth="3"
                                  strokeDasharray={`${item.progressPercent} 100`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                                {item.progressPercent}%
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-slate-800 group-hover:text-sky-600 truncate">{item.course.title}</h3>
                              <p className="text-xs text-slate-500">{instructor}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{item.completedCount}/{item.lessonCount} lessons</p>
                              {item.nextLessonTitle && (
                                <p className="text-xs text-sky-600 font-medium mt-1">Next: {item.nextLessonTitle}</p>
                              )}
                              <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-sky-500 rounded-full"
                                  style={{ width: `${item.progressPercent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
              {enrolled.length > 2 && (
                <Link href="/my-courses" className="inline-flex items-center gap-1 mt-3 text-sky-600 text-sm font-medium hover:underline">
                  View all courses <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Learning Roadmap */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <Link href="/learning-path" className="text-lg font-bold text-slate-800 hover:text-sky-600 no-underline">
                Learning Roadmap
              </Link>
              <Link href="/learning-path" className="text-slate-400 hover:text-sky-500" aria-label="Learning path">
                <Clock className="w-5 h-5" />
              </Link>
            </div>
            <div className="p-5">
              <ul className="space-y-3">
                {MOCK_ROADMAP.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => router.push('/learning-path')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                        item.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-800'
                          : item.status === 'in_progress'
                            ? 'bg-sky-50 text-sky-800'
                            : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      {item.status === 'completed' ? (
                        <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs">✓</span>
                        </span>
                      ) : item.status === 'in_progress' ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500 flex-shrink-0" />
                      ) : null}
                      <span className="font-medium flex-1">{item.title}</span>
                      <span className="text-xs font-medium">
                        {item.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <Link
                href="/learning-path"
                className="inline-flex items-center gap-1 mt-4 text-sky-600 text-sm font-medium hover:underline"
              >
                View full path <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
