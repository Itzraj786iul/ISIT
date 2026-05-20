'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/LazySidebar';
import { useRequireAuth } from '@/lib/use-require-auth';
import { BookOpen, Target, TrendingUp, Layers, Clock, Loader2, ChevronRight } from 'lucide-react';
import { useT } from '@/lib/t';
import { useLanguage } from '@/lib/language-context';

const ORDERED_DAY_CODES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
type DayCode = (typeof ORDERED_DAY_CODES)[number];

function formatWeekdayShort(code: DayCode, locale: string): string {
  const offset = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[code];
  const d = new Date(2024, 0, 1 + offset);
  return d.toLocaleDateString(locale, { weekday: 'short' });
}

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
  const tr = useT();
  const { language } = useLanguage();
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  const router = useRouter();
  const [user, setUser] = useState<{ _id?: string; organization_id?: string } | null>(null);
  const [topicsStudied, setTopicsStudied] = useState(0);
  const [topicsMastered, setTopicsMastered] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalLearningMinutes, setTotalLearningMinutes] = useState(0);
  const [weeklyData, setWeeklyData] = useState<{ day: string; hours: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const { user: authUser, loading: authLoading } = useRequireAuth({ roles: ['student'] });

  useEffect(() => {
    if (authLoading || !authUser) return;
    const userData = authUser;
    setUser(userData);

    const run = async () => {
      setLoading(true);

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
  }, [authUser, authLoading]);

  const maxHours = Math.max(...weeklyData.map((d) => d.hours), 1);
  const totalHoursThisWeek = weeklyData.reduce((s, d) => s + d.hours, 0);

  function formatTime(minutes: number) {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  return (
    <div className="isit-cosmic-bg relative flex min-h-screen font-sans ">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="isit-app-header shrink-0">
          <div className="px-4 py-3 sm:px-6 md:px-8">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
              <Link href="/dashboard" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
                {tr('dashboard')}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              <span className="font-medium text-slate-700 dark:text-slate-200">{tr('analytics')}</span>
            </nav>
          </div>
        </header>

        <main className="isit-app-main isit-app-main--with-nav-toggle">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{tr('analytics')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tr('analyticsPageLead')}</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="isit-app-stat-card rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800">{loading ? '...' : topicsStudied}</div>
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{tr('analyticsTopicsStudiedLabel')}</div>
            </div>
          </div>
          <div className="isit-app-stat-card rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800">{loading ? '...' : topicsMastered}</div>
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{tr('analyticsTopicsMasteredLabel')}</div>
            </div>
          </div>
          <Link href="/learn/subjects" className="block no-underline">
            <div className="isit-app-stat-card rounded-2xl p-6 shadow-sm hover:border-violet-200 hover:shadow transition cursor-pointer flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                <Layers className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-800">{loading ? '...' : subjectCount}</div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{tr('subjects')}</div>
              </div>
            </div>
          </Link>
          <div className="isit-app-stat-card rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800">{loading ? '...' : formatTime(totalLearningMinutes)}</div>
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{tr('analyticsLearningTimeLabel')}</div>
            </div>
          </div>
        </div>

        {/* Weekly Learning Activity */}
        <div className="isit-app-panel rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{tr('analyticsWeeklyTitle')}</h3>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{tr('analyticsWeeklySubtitle')}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {Math.round(totalHoursThisWeek * 10) / 10}
                {tr('analyticsHoursUnit')}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{tr('analyticsThisWeek')}</div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
              </div>
            ) : weeklyData.length > 0 ? (
              weeklyData.map((d) => (
                <div key={d.day} className="flex w-full items-center gap-4">
                  <span className="w-12 shrink-0 text-sm font-medium text-slate-600 dark:text-slate-300">
                    {formatWeekdayShort(d.day as DayCode, locale)}
                  </span>
                  <div className="relative h-8 flex-1 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                    {d.hours > 0 && (
                      <div
                        className="absolute inset-y-0 left-0 rounded-lg bg-sky-500 transition-all"
                        style={{ width: `${(d.hours / maxHours) * 100}%` }}
                      />
                    )}
                    {d.hours > 0 && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-900 dark:text-white drop-shadow">
                        {d.hours}
                        {tr('analyticsHoursUnit')}
                      </span>
                    )}
                  </div>
                  <span className="w-16 shrink-0 text-right text-sm font-medium text-slate-600 dark:text-slate-300">
                    {d.hours} {tr('analyticsHrsUnit')}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">{tr('analyticsNoSessionData')}</p>
            )}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="isit-app-panel rounded-xl p-6 shadow-sm">
            <h3 className="mb-4 text-base font-bold text-slate-800 dark:text-slate-100">{tr('analyticsLearningSummaryTitle')}</h3>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-10 h-10 text-sky-600" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-800">{loading ? '...' : sessionCount}</div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{tr('analyticsTotalSessionsLabel')}</div>
                <div className="mt-1 text-xs text-slate-400">{tr('analyticsAcrossSubjectsNote')}</div>
              </div>
            </div>
          </div>

          <div className="isit-app-panel rounded-xl p-6 shadow-sm">
            <h3 className="mb-4 text-base font-bold text-slate-800 dark:text-slate-100">{tr('analyticsProgressOverviewTitle')}</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">{tr('analyticsRowTopicsStudied')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{loading ? '...' : topicsStudied}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">{tr('analyticsRowTopicsMastered')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{loading ? '...' : topicsMastered}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">{tr('analyticsRowLearningTime')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{loading ? '...' : formatTime(totalLearningMinutes)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">{tr('analyticsRowSubjectsAvailable')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{loading ? '...' : subjectCount}</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
