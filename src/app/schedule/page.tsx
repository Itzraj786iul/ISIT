'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/LazySidebar';
import { useRequireAuth } from '@/lib/use-require-auth';
import { Clock, Layers, Loader2, ChevronRight } from 'lucide-react';
import { useT } from '@/lib/t';
import { useLanguage } from '@/lib/language-context';

type SessionItem = {
  _id: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  total_time_minutes?: number;
  session_type?: string;
  topic_id?: string;
  subject_id?: string;
};

export default function SchedulePage() {
  const tr = useT();
  const { language } = useLanguage();
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  const router = useRouter();
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date().getDate());
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { user: authUser, loading: authLoading } = useRequireAuth({ roles: ['student'] });

  useEffect(() => {
    if (authLoading || !authUser) return;
    const run = async () => {
      setLoading(true);
      const u = authUser;

      try {
        const res = await fetch(`/api/sessions?userId=${encodeURIComponent(u._id || '')}`, { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          const data = json.success && Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
          setSessions(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [authUser, authLoading, router]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const calendarWeekdayLabels = useMemo(() => {
    const labels: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(2023, 0, 1 + i);
      labels.push(d.toLocaleDateString(locale, { weekday: 'short' }));
    }
    return labels;
  }, [locale]);

  const monthTitle = useMemo(
    () => new Date(year, month, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' }),
    [year, month, locale]
  );

  const selectedDayTitle = useMemo(
    () =>
      `${new Date(year, month, selectedDate).toLocaleDateString(locale, {
        month: 'long',
        day: 'numeric',
      })} — ${tr('scheduleSessionsWord')}`,
    [year, month, selectedDate, locale, tr]
  );

  const calendarDays = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const totalDays = last.getDate();
    const pad: (number | null)[] = Array(startPad).fill(null);
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    return [...pad, ...days];
  }, [year, month]);

  const daysWithSessions = useMemo(() => {
    const days = new Set<number>();
    for (const s of sessions) {
      const dt = new Date(s.started_at);
      if (dt.getFullYear() === year && dt.getMonth() === month) {
        days.add(dt.getDate());
      }
    }
    return days;
  }, [sessions, year, month]);

  const selectedDaySessions = useMemo(() => {
    return sessions.filter((s) => {
      const dt = new Date(s.started_at);
      return dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === selectedDate;
    });
  }, [sessions, year, month, selectedDate]);

  const upcomingLabel = (s: SessionItem) => {
    const dt = new Date(s.started_at);
    return (
      dt.toLocaleDateString(locale, { day: 'numeric', month: 'short' }) +
      ' ' +
      dt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
    );
  };

  const goPrev = () => setViewDate(new Date(year, month - 1, 1));
  const goNext = () => setViewDate(new Date(year, month + 1, 1));

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
              <span className="font-medium text-slate-700 dark:text-slate-200">{tr('activity')}</span>
            </nav>
          </div>
        </header>

        <main className="isit-app-main isit-app-main--with-nav-toggle">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{tr('activity')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tr('activityPageLead')}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2 isit-app-panel rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-800 dark:text-slate-100">{monthTitle}</h2>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label={tr('schedulePrevMonthAria')}
                  >
                    <span className="text-lg font-bold">&lt;</span>
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label={tr('scheduleNextMonthAria')}
                  >
                    <span className="text-lg font-bold">&gt;</span>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-2 grid grid-cols-7 gap-0.5 sm:gap-1">
                  {calendarWeekdayLabels.map((d, i) => (
                    <div key={i} className="py-1 text-center text-[10px] font-semibold text-slate-500 sm:text-xs dark:text-slate-400">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                  {calendarDays.map((day, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => day !== null && setSelectedDate(day)}
                      className={`flex min-h-[2.25rem] flex-col items-center justify-center rounded-lg text-[11px] font-medium transition sm:aspect-square sm:min-h-0 sm:text-sm ${
                        day === null
                          ? 'invisible'
                          : day === selectedDate
                            ? 'bg-sky-500 text-white hover:bg-sky-600'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100'
                      }`}
                    >
                      {day}
                      {day !== null && daysWithSessions.has(day) && day !== selectedDate && (
                        <span className="w-1 h-1 rounded-full bg-sky-500 mt-0.5" />
                      )}
                      {day !== null && daysWithSessions.has(day) && day === selectedDate && (
                        <span className="w-1 h-1 rounded-full bg-white mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected day sessions */}
            <div className="isit-app-panel rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-800 dark:text-slate-100">{selectedDayTitle}</h2>
              </div>
              <div className="p-4">
                {selectedDaySessions.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">{tr('scheduleNoSessionsThisDay')}</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDaySessions.map((s) => (
                      <Link
                        key={s._id}
                        href={`/session/${s._id}`}
                        className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/50 dark:border-slate-700 dark:hover:border-sky-800 dark:hover:bg-sky-950/30 transition no-underline"
                      >
                        <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                          <Layers className="w-5 h-5 text-sky-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {s.session_type || tr('scheduleSessionDefaultName')}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {new Date(s.started_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                            {(s.duration_minutes || s.total_time_minutes) && (
                              <span className="text-slate-400">
                                {' '}
                                &middot;{' '}
                                {tr('scheduleMinutesShort').replace(
                                  /\{n\}/g,
                                  String(s.duration_minutes ?? s.total_time_minutes ?? 0)
                                )}
                              </span>
                            )}
                          </div>
                        
                        
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recent sessions */}
        {!loading && sessions.length > 0 && (
          <div className="mt-6 isit-app-panel rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 dark:text-slate-100">{tr('scheduleRecentSessionsTitle')}</h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {sessions.slice(0, 10).map((s) => (
                  <Link
                    key={s._id}
                    href={`/session/${s._id}`}
                    className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/50 dark:border-slate-700 dark:hover:border-sky-800 transition no-underline"
                  >
                    <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-sky-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {s.session_type || tr('scheduleSessionDefaultName')}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{upcomingLabel(s)}</div>
                    </div>
                    <div className="shrink-0 text-xs text-slate-400">
                      {tr('scheduleMinutesShort').replace(/\{n\}/g, String(s.duration_minutes ?? s.total_time_minutes ?? 0))}
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
