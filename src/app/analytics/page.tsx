'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { BookOpen, Target, TrendingUp, Layers, Clock, Loader2 } from 'lucide-react';

type MasteryRecord = {
  topic_id: string;
  mastery_score: number;
  attempt_count: number;
};

type PerformanceMetric = {
  learning_time_minutes: number;
  topics_completed: number;
  month: string;
};

type SessionItem = {
  _id?: string;
  start_time?: string;
  started_at?: string;
  duration_minutes?: number;
  total_time_minutes?: number;
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ _id?: string; organization_id?: string } | null>(null);
  const [topicsStudied, setTopicsStudied] = useState(0);
  const [topicsMastered, setTopicsMastered] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalLearningMinutes, setTotalLearningMinutes] = useState(0);
  const [weeklyData, setWeeklyData] = useState<{ day: string; hours: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!meRes.ok) { router.push('/login'); return; }
      const meData = await meRes.json();
      const userData = meData.user;
      if (!userData || userData?.role?.toLowerCase() === 'teacher') {
        router.push('/teacher/dashboard');
        return;
      }
      setUser(userData);

      const fetches: Promise<void>[] = [];

      fetches.push(
        fetch('/api/mastery', { credentials: 'include' })
          .then(async (r) => {
            const json = await r.json();
            if (json.success && Array.isArray(json.data)) {
              const records: MasteryRecord[] = json.data;
              setTopicsStudied(records.filter((rec) => rec.attempt_count > 0).length);
              setTopicsMastered(records.filter((rec) => rec.mastery_score >= 80).length);
            }
          })
          .catch(() => {})
      );

      fetches.push(
        fetch('/api/performance', { credentials: 'include' })
          .then(async (r) => {
            const json = await r.json();
            if (json.success && Array.isArray(json.data)) {
              const total = (json.data as PerformanceMetric[]).reduce((s, m) => s + (m.learning_time_minutes ?? 0), 0);
              setTotalLearningMinutes(total);
            }
          })
          .catch(() => {})
      );

      if (userData.organization_id) {
        fetches.push(
          fetch(`/api/subjects?organizationId=${encodeURIComponent(userData.organization_id)}`)
            .then(async (r) => {
              const json = await r.json();
              if (json.success && Array.isArray(json.data)) setSubjectCount(json.data.length);
            })
            .catch(() => {})
        );
      }

      fetches.push(
        fetch('/api/sessions', { credentials: 'include' })
          .then(async (r) => {
            if (!r.ok) return;
            const json = await r.json();
            const sessions: SessionItem[] = json.success && Array.isArray(json.data) ? json.data : [];
            setSessionCount(sessions.length);

            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const hoursByDay: Record<string, number> = {};
            dayNames.forEach((d) => (hoursByDay[d] = 0));

            for (const s of sessions) {
              const raw = s.start_time ?? s.started_at;
              if (raw) {
                const dt = new Date(raw);
                const now = new Date();
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                if (dt >= weekAgo) {
                  const dayName = dayNames[dt.getDay()];
                  const duration = s.duration_minutes ?? s.total_time_minutes ?? 0;
                  hoursByDay[dayName] += duration / 60;
                }
              }
            }

            const ordered = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            setWeeklyData(ordered.map((d) => ({ day: d, hours: Math.round(hoursByDay[d] * 10) / 10 })));
          })
          .catch(() => {})
      );

      await Promise.all(fetches);
      setLoading(false);
    };
    run();
  }, [router]);

  const maxHours = Math.max(...weeklyData.map((d) => d.hours), 1);
  const totalHoursThisWeek = weeklyData.reduce((s, d) => s + d.hours, 0);

  function formatTime(minutes: number) {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Track your learning performance</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Link href="/progress" className="block no-underline">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-sky-200 hover:shadow transition cursor-pointer flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-800">{loading ? '...' : topicsStudied}</div>
                <div className="text-sm text-slate-500 font-medium">Topics Studied</div>
              </div>
            </div>
          </Link>
          <Link href="/progress" className="block no-underline">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-emerald-200 hover:shadow transition cursor-pointer flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-800">{loading ? '...' : topicsMastered}</div>
                <div className="text-sm text-slate-500 font-medium">Topics Mastered</div>
              </div>
            </div>
          </Link>
          <Link href="/subjects" className="block no-underline">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-violet-200 hover:shadow transition cursor-pointer flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                <Layers className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-800">{loading ? '...' : subjectCount}</div>
                <div className="text-sm text-slate-500 font-medium">Subjects</div>
              </div>
            </div>
          </Link>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800">{loading ? '...' : formatTime(totalLearningMinutes)}</div>
              <div className="text-sm text-slate-500 font-medium">Learning Time</div>
            </div>
          </div>
        </div>

        {/* Weekly Learning Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Weekly Learning Activity</h3>
              <p className="text-sm text-slate-500 mt-0.5">Hours studied per day this week</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-slate-800">{Math.round(totalHoursThisWeek * 10) / 10}h</div>
              <div className="text-xs text-slate-500">This week</div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
              </div>
            ) : weeklyData.length > 0 ? (
              weeklyData.map((d) => (
                <div key={d.day} className="w-full flex items-center gap-4">
                  <span className="w-10 text-sm font-medium text-slate-600">{d.day}</span>
                  <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                    {d.hours > 0 && (
                      <div
                        className="absolute inset-y-0 left-0 bg-sky-500 rounded-lg transition-all"
                        style={{ width: `${(d.hours / maxHours) * 100}%` }}
                      />
                    )}
                    {d.hours > 0 && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white drop-shadow">
                        {d.hours}h
                      </span>
                    )}
                  </div>
                  <span className="w-14 text-right text-sm font-medium text-slate-600">{d.hours} hrs</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm text-center py-4">No session data yet. Start learning to see your activity!</p>
            )}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4">Learning Summary</h3>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-10 h-10 text-sky-600" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-800">{loading ? '...' : sessionCount}</div>
                <div className="text-sm text-slate-500 font-medium">Total Sessions</div>
                <div className="text-xs text-slate-400 mt-1">Across all subjects and topics</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4">Progress Overview</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-slate-600">Topics Studied</span>
                <span className="font-semibold text-slate-800">{loading ? '...' : topicsStudied}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600">Topics Mastered</span>
                <span className="font-semibold text-slate-800">{loading ? '...' : topicsMastered}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600">Learning Time</span>
                <span className="font-semibold text-slate-800">{loading ? '...' : formatTime(totalLearningMinutes)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600">Subjects Available</span>
                <span className="font-semibold text-slate-800">{loading ? '...' : subjectCount}</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
