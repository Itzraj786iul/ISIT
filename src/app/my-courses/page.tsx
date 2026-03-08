'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import { BookOpen, ChevronRight, Search } from 'lucide-react';

type EnrolledItem = {
  course: { _id: string; title: string; description?: string; teacherId?: { name?: string }; image?: string };
  lessonCount: number;
  completedCount: number;
  progressPercent: number;
  nextLessonId: string | null;
  nextLessonTitle: string | null;
};

type Filter = 'all' | 'in_progress' | 'completed';

export default function MyCoursesPage() {
  const router = useRouter();
  const [enrolled, setEnrolled] = useState<EnrolledItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

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

  const filtered = useMemo(() => {
    let list = enrolled;
    if (filter === 'in_progress') list = list.filter((e) => e.progressPercent > 0 && e.progressPercent < 100);
    if (filter === 'completed') list = list.filter((e) => e.progressPercent >= 100);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.course.title.toLowerCase().includes(q) ||
          (e.course.description?.toLowerCase().includes(q) ?? false)
      );
    }
    return list;
  }, [enrolled, filter, search]);

  const estimateTimeLeft = (item: EnrolledItem) => {
    const remaining = item.lessonCount - item.completedCount;
    const minutes = remaining * 30;
    if (minutes < 60) return `${minutes}m left`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m left`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
        {/* Search */}
        <div className="relative max-w-md mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search for courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">My Courses</h1>
          <p className="text-slate-500 text-sm mt-1">Track your learning progress</p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'in_progress', 'completed'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filter === f
                  ? 'bg-sky-500 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : 'Completed'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              {enrolled.length === 0 ? 'No enrolled courses' : 'No courses match your filters'}
            </h2>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              {enrolled.length === 0
                ? 'When you enroll in a course after checkout, it will appear here.'
                : 'Try a different search or filter.'}
            </p>
            {enrolled.length === 0 && (
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 bg-sky-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-sky-600 transition"
              >
                Browse courses <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => {
              const instructor =
                typeof item.course.teacherId === 'object' && item.course.teacherId?.name
                  ? item.course.teacherId.name.toUpperCase()
                  : 'INSTRUCTOR';
              return (
                <div
                  key={item.course._id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow hover:border-slate-300 transition"
                >
                  <Link href={`/course/${item.course._id}`} className="block">
                    <div className="aspect-video bg-slate-100 relative">
                      {item.course.image ? (
                        <Image
                          src={item.course.image}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-slate-300" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-slate-500 tracking-wide">{instructor}</p>
                    <Link href={`/course/${item.course._id}`} className="no-underline">
                      <h3 className="font-bold text-slate-800 mt-0.5 hover:text-sky-600">{item.course.title}</h3>
                    </Link>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                      {item.course.description || 'Continue learning'}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-600">{item.progressPercent}% complete</span>
                      <span className="text-sm text-slate-500">{estimateTimeLeft(item)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-sky-500 rounded-full transition-all"
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                    <Link
                      href={item.nextLessonId ? `/lesson/${item.nextLessonId}` : `/course/${item.course._id}`}
                      className="mt-4 flex items-center justify-center gap-2 w-full bg-sky-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-sky-600 transition"
                    >
                      Continue Course <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8">
          <Link href="/courses" className="text-sky-600 text-sm font-medium hover:underline">
            ← Browse all courses
          </Link>
        </div>
      </main>
    </div>
  );
}
