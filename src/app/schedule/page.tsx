'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Clock, Layers, Loader2 } from 'lucide-react';

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

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SchedulePage() {
  const router = useRouter();
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date().getDate());
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!meRes.ok) { router.push('/login'); return; }
      const meData = await meRes.json();
      const u = meData.user;
      if (!u || u.role?.toLowerCase() === 'teacher') { router.push('/teacher/dashboard'); return; }

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
  }, [router]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = MONTHS[month];

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
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' + dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const goPrev = () => setViewDate(new Date(year, month - 1, 1));
  const goNext = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Schedule</h1>
          <p className="text-slate-500 text-sm mt-1">View your learning sessions</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-800">{monthName} {year}</h2>
                <div className="flex gap-1">
                  <button type="button" onClick={goPrev} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Previous month">
                    <span className="text-lg font-bold">&lt;</span>
                  </button>
                  <button type="button" onClick={goNext} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Next month">
                    <span className="text-lg font-bold">&gt;</span>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS_SHORT.map((d) => (
                    <div key={d} className="text-center text-xs font-semibold text-slate-500 py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => day !== null && setSelectedDate(day)}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition ${
                        day === null
                          ? 'invisible'
                          : day === selectedDate
                            ? 'bg-sky-500 text-white'
                            : 'text-slate-700 hover:bg-slate-100'
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
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-800">
                  {monthName} {selectedDate} Sessions
                </h2>
              </div>
              <div className="p-4">
                {selectedDaySessions.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-4">No sessions on this day.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDaySessions.map((s) => (
                      <div key={s._id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100">
                        <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                          <Layers className="w-5 h-5 text-sky-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-800 text-sm">{s.session_type || 'Learning Session'}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {new Date(s.started_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            {(s.duration_minutes || s.total_time_minutes) && (
                              <span className="text-slate-400"> &middot; {s.duration_minutes ?? s.total_time_minutes} min</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recent sessions */}
        {!loading && sessions.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Recent Sessions</h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {sessions.slice(0, 10).map((s) => (
                  <div key={s._id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-sky-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-800 text-sm">{s.session_type || 'Learning Session'}</div>
                      <div className="text-xs text-slate-500">{upcomingLabel(s)}</div>
                    </div>
                    <div className="text-xs text-slate-400 flex-shrink-0">
                      {s.duration_minutes ?? s.total_time_minutes ?? 0} min
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
