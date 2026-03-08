'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { BookOpen, CheckCircle, TrendingUp } from 'lucide-react';

const weeklyData = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 3.2 },
  { day: 'Wed', hours: 1.8 },
  { day: 'Thu', hours: 4.1 },
  { day: 'Fri', hours: 2.9 },
  { day: 'Sat', hours: 3.5 },
  { day: 'Sun', hours: 2.2 },
];

const maxHours = Math.max(...weeklyData.map((d) => d.hours));

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ _id?: string } | null>(null);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(userStr);
    if (userData?.role?.toLowerCase() === 'teacher') {
      router.push('/teacher/dashboard');
      return;
    }
    setUser(userData);
    const uid = userData._id ?? userData.id;
    if (uid) {
      fetch(`/api/student/enrolled-courses?userId=${encodeURIComponent(uid)}`)
        .then((r) => r.ok ? r.json() : [])
        .then((arr: { progressPercent?: number }[]) => {
          setEnrolledCount(arr.length);
          setCompletedCount(arr.filter((e) => (e.progressPercent ?? 0) >= 100).length);
        })
        .catch(() => {});
    }
  }, [router]);

  const activeCourses = enrolledCount - completedCount;
  const currentStreak = 12;
  const bestStreak = 18;
  const lessonsThisMonth = 47;
  const quizzesPassed = 12;
  const activeDays = '18/30';

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Track your learning performance</p>
        </div>

        {/* Summary cards — clickable */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Link href="/my-courses" className="block no-underline">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-sky-200 hover:shadow transition cursor-pointer flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-800">{activeCourses}</div>
                <div className="text-sm text-slate-500 font-medium">Active Courses</div>
              </div>
            </div>
          </Link>
          <Link href="/my-courses" className="block no-underline">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-emerald-200 hover:shadow transition cursor-pointer flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-800">{completedCount}</div>
                <div className="text-sm text-slate-500 font-medium">Completed</div>
              </div>
            </div>
          </Link>
          <Link href="/achievements?filter=streak" className="block no-underline">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-200 hover:shadow transition cursor-pointer flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-800">{currentStreak} days</div>
                <div className="text-sm text-slate-500 font-medium">Current Streak</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Weekly Learning Activity — horizontal bars with hours on the right */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800">Weekly Learning Activity</h3>
            <p className="text-sm text-slate-500 mt-0.5">Hours studied per day</p>
          </div>
          <div className="p-5 space-y-4">
            {weeklyData.map((d) => (
              <Link
                key={d.day}
                href="/my-courses"
                className="w-full flex items-center gap-4 group cursor-pointer no-underline"
              >
                <span className="w-10 text-sm font-medium text-slate-600">{d.day}</span>
                <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                  <div
                    className="absolute inset-y-0 left-0 bg-sky-500 rounded-lg transition-all"
                    style={{ width: `${(d.hours / maxHours) * 100}%` }}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white drop-shadow">
                    {d.hours}h
                  </span>
                </div>
                <span className="w-14 text-right text-sm font-medium text-slate-600">{d.hours} hrs</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Learning Streak card — clickable */}
          <Link
            href="/achievements?filter=streak"
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-200 hover:shadow transition cursor-pointer text-left no-underline block"
          >
            <h3 className="text-base font-bold text-slate-800 mb-4">Learning Streak</h3>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-10 h-10 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-800">{currentStreak} Days</div>
                <div className="text-sm text-slate-500 font-medium">Current Streak</div>
                <div className="text-xs text-slate-400 mt-1">Best: {bestStreak} days</div>
              </div>
            </div>
          </Link>

          {/* This Month card — clickable */}
          <Link
            href="/my-courses"
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-sky-200 hover:shadow transition cursor-pointer text-left no-underline block"
          >
            <h3 className="text-base font-bold text-slate-800 mb-4">This Month</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-slate-600">Lessons Completed</span>
                <span className="font-semibold text-slate-800">{lessonsThisMonth}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600">Quizzes Passed</span>
                <span className="font-semibold text-slate-800">{quizzesPassed}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600">Active Days</span>
                <span className="font-semibold text-slate-800">{activeDays}</span>
              </li>
            </ul>
            <p className="text-xs text-slate-400 mt-3">Best: {bestStreak} days</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
