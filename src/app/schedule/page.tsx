'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Video, FileText } from 'lucide-react';

type EventType = 'live' | 'assignment';

type EventItem = {
  id: string;
  type: EventType;
  title: string;
  subtitle: string;
  time: string;
  duration?: string;
  date?: string;
};

const MOCK_TODAY_EVENTS: EventItem[] = [
  { id: '1', type: 'live', title: 'Python Functions - Live Session', subtitle: 'Introduction to Python', time: '10:00 AM', duration: '1 hour' },
  { id: '2', type: 'assignment', title: 'CSS Grid Assignment Due', subtitle: 'Web Development Basics', time: '11:59 PM' },
];

const MOCK_UPCOMING: EventItem[] = [
  { id: '1', type: 'live', title: 'Python Functions - Live Session', subtitle: 'Introduction to Python', time: '10:00 AM', duration: '1 hour', date: 'Mar 15' },
  { id: '2', type: 'assignment', title: 'CSS Grid Assignment Due', subtitle: 'Web Development Basics', time: '11:59 PM', date: 'Mar 15' },
  { id: '3', type: 'live', title: 'React Hooks Workshop', subtitle: 'Advanced Frontend', time: '2:00 PM', duration: '1.5 hours', date: 'Mar 18' },
  { id: '4', type: 'assignment', title: 'API Project Submission', subtitle: 'Backend Development', time: '11:59 PM', date: 'Mar 20' },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SchedulePage() {
  const router = useRouter();
  const [viewDate, setViewDate] = useState(() => new Date(2026, 2, 1)); // March 2026
  const [selectedDate, setSelectedDate] = useState(15);

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

  const daysWithEvents = new Set([16, 17, 18, 19, 20, 21, 22, 23, 27, 28, 29, 30]);

  const goPrev = () => setViewDate(new Date(year, month - 1, 1));
  const goNext = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Schedule</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your learning schedule</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">{monthName} {year}</h2>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={goPrev}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Previous month"
                >
                  <span className="text-lg font-bold">&lt;</span>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Next month"
                >
                  <span className="text-lg font-bold">&gt;</span>
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS_SHORT.map((d) => (
                  <div key={d} className="text-center text-xs font-semibold text-slate-500 py-1">
                    {d}
                  </div>
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
                    {day !== null && daysWithEvents.has(day) && day !== selectedDate && (
                      <span className="w-1 h-1 rounded-full bg-sky-500 mt-0.5" />
                    )}
                    {day !== null && daysWithEvents.has(day) && day === selectedDate && (
                      <span className="w-1 h-1 rounded-full bg-white mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Today&apos;s Schedule</h2>
            </div>
            <div className="p-4 space-y-3">
              {MOCK_TODAY_EVENTS.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => {}}
                  className="w-full flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-left transition"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${ev.type === 'live' ? 'bg-sky-100 text-sky-600' : 'bg-violet-100 text-violet-600'}`}>
                    {ev.type === 'live' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-800">{ev.title}</div>
                    <div className="text-xs text-slate-500">{ev.subtitle}</div>
                    <div className="text-sm text-slate-600 mt-0.5">
                      {ev.time}
                      {ev.duration && <span className="text-slate-400"> · {ev.duration}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Upcoming Events</h2>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              {MOCK_UPCOMING.map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${ev.type === 'live' ? 'bg-sky-100 text-sky-600' : 'bg-violet-100 text-violet-600'}`}>
                    {ev.type === 'live' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-800">{ev.title}</div>
                    <div className="text-xs text-slate-500">{ev.subtitle}</div>
                    <div className="text-sm text-slate-600 mt-0.5">
                      {ev.date} {ev.time}
                      {ev.duration && <span className="text-slate-400"> - {ev.duration}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs text-slate-400">
                      {ev.type === 'live' ? 'Live Session' : 'Assignment'}
                    </span>
                    {ev.type === 'live' && (
                      <button
                        type="button"
                        onClick={() => {}}
                        className="px-3 py-1.5 bg-sky-500 text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
