'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { Check } from 'lucide-react';

type Filter = 'all' | 'unlocked' | 'course' | 'streak' | 'skills';

type Achievement = {
  id: string;
  title: string;
  description: string;
  iconBg: string;
  unlocked: boolean;
  unlockedOn?: string;
  category: 'course' | 'streak' | 'skills' | 'other';
};

const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'First Steps', description: 'Complete your first course', iconBg: '#fbbf24', unlocked: true, unlockedOn: 'Jan 15, 2026', category: 'course' },
  { id: '2', title: 'Quick Learner', description: 'Finish 5 lessons in one day', iconBg: '#3b82f6', unlocked: true, unlockedOn: 'Jan 18, 2026', category: 'course' },
  { id: '3', title: 'Week Warrior', description: 'Study 7 days in a row', iconBg: '#ec4899', unlocked: false, category: 'streak' },
  { id: '4', title: 'Course Champion', description: 'Complete 3 full courses', iconBg: '#f97316', unlocked: true, unlockedOn: 'Feb 2, 2026', category: 'course' },
  { id: '5', title: 'Skill Builder', description: 'Earn 5 skill badges', iconBg: '#22c55e', unlocked: true, unlockedOn: 'Feb 10, 2026', category: 'skills' },
  { id: '6', title: 'Dedicated', description: '30-day learning streak', iconBg: '#0ea5e9', unlocked: false, category: 'streak' },
  { id: '7', title: 'Explorer', description: 'Try 5 different courses', iconBg: '#eab308', unlocked: false, category: 'course' },
  { id: '8', title: 'Quiz Master', description: 'Pass 20 quizzes', iconBg: '#a855f7', unlocked: false, category: 'skills' },
];

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unlocked', label: 'Unlocked' },
  { key: 'course', label: 'Course' },
  { key: 'streak', label: 'Streak' },
  { key: 'skills', label: 'Skills' },
];

const UNLOCKED_COUNT = MOCK_ACHIEVEMENTS.filter((a) => a.unlocked).length;

function AchievementsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilter = useMemo(() => {
    const f = searchParams.get('filter');
    if (f && (['all', 'unlocked', 'course', 'streak', 'skills'] as Filter[]).includes(f as Filter)) return f as Filter;
    return 'all';
  }, [searchParams]);
  const [filter, setFilter] = useState<Filter>(initialFilter);

  useEffect(() => setFilter(initialFilter), [initialFilter]);

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

  const filtered = MOCK_ACHIEVEMENTS.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'course') return a.category === 'course';
    if (filter === 'streak') return a.category === 'streak';
    if (filter === 'skills') return a.category === 'skills';
    return true;
  });

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Achievements</h1>
          <p className="text-slate-500 text-sm mt-1">Unlock badges as you progress</p>
        </div>

        {/* Summary cards — clickable, link to same page with filter or dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Link
              key={i}
              href={i === 1 ? '/achievements' : i === 2 ? '/achievements?filter=unlocked' : '/dashboard'}
              className="block no-underline"
            >
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-sky-200 hover:shadow transition cursor-pointer">
                <div className="text-3xl font-extrabold text-slate-800">{UNLOCKED_COUNT}</div>
                <div className="text-sm text-slate-500 font-medium mt-1">Achievements Unlocked</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filter === f.key
                  ? 'bg-sky-500 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Achievement cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((a) => (
            <Link
              key={a.id}
              href={a.unlocked ? '/my-courses' : '/courses'}
              className="bg-white rounded-xl border border-slate-200 p-5 text-left shadow-sm hover:border-sky-200 hover:shadow transition cursor-pointer relative block no-underline"
            >
              {a.unlocked && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
              )}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: a.iconBg + '30' }}
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={a.iconBg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-800">{a.title}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{a.description}</p>
              <p className={`text-xs mt-2 ${a.unlocked ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                {a.unlocked ? `Unlocked on ${a.unlockedOn}` : 'Locked'}
              </p>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
            No achievements match this filter. Try another tab.
          </div>
        )}
    </main>
  );
}

export default function AchievementsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      <Suspense fallback={<main className="flex-1 p-8"><p className="text-slate-500">Loading…</p></main>}>
        <AchievementsContent />
      </Suspense>
    </div>
  );
}
