'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { BookOpen, ChevronRight, Flame, TrendingUp, Clock, Play, Target } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

type User = { _id?: string; name: string; email: string; role: string; organization_id?: string };

type LastSession = {
  topic_id: string;
  subject_id: string;
  start_time: string;
};

type SubjectItem = {
  _id: string;
  name: string;
  grade: string;
  board: string;
  description?: string;
};

type MasteryRecord = {
  _id?: string;
  topic_id: string;
  mastery_score: number;
  attempt_count: number;
  correct_answers: number;
  last_updated?: string;
};

type PerformanceMetric = {
  learning_time_minutes: number;
  topics_completed: number;
  month: string;
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const SUBJECT_COLORS = [
  { bg: 'bg-sky-100', text: 'text-sky-700', hover: 'hover:border-sky-300', icon: 'text-sky-600' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', hover: 'hover:border-emerald-300', icon: 'text-emerald-600' },
  { bg: 'bg-violet-100', text: 'text-violet-700', hover: 'hover:border-violet-300', icon: 'text-violet-600' },
  { bg: 'bg-amber-100', text: 'text-amber-700', hover: 'hover:border-amber-300', icon: 'text-amber-600' },
  { bg: 'bg-rose-100', text: 'text-rose-700', hover: 'hover:border-rose-300', icon: 'text-rose-600' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', hover: 'hover:border-indigo-300', icon: 'text-indigo-600' },
];

export default function Dashboard() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [lastSession, setLastSession] = useState<LastSession | null>(null);
  const [lastTopicName, setLastTopicName] = useState<string | null>(null);
  const [lastTopicProgress, setLastTopicProgress] = useState<number | null>(null);
  const [masteryRecords, setMasteryRecords] = useState<MasteryRecord[]>([]);
  const [topicNames, setTopicNames] = useState<Record<string, string>>({});
  const [totalLearningMinutes, setTotalLearningMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    const run = async () => {
      const userData = authUser as User | null;
      if (!userData) { router.push('/login'); return; }
      if (userData.role?.toLowerCase() === 'teacher') { router.push('/teacher/dashboard'); return; }
      if (userData.role?.toLowerCase() === 'parent') { router.push('/parent/dashboard'); return; }
      setUser(userData);

      try {
        const fetches: Promise<void>[] = [];

        if (userData.organization_id) {
          fetches.push(
            fetch(`/api/subjects?organizationId=${encodeURIComponent(userData.organization_id)}`, { credentials: 'include' })
              .then(async (r) => {
                const json = await r.json();
                if (json.success && Array.isArray(json.data)) setSubjects(json.data);
              })
          );
        }

        fetches.push(
          fetch('/api/last-session', { credentials: 'include' })
            .then(async (r) => {
              const json = (await r.json()) as { success?: boolean; data?: LastSession | null };
              if (r.ok && json.success && json.data) {
                const session = json.data;
                setLastSession(session);
                const [topicRes, masteryRes] = await Promise.all([
                  fetch(`/api/topics/${session.topic_id}`, { credentials: 'include' }),
                  fetch(`/api/mastery?topicId=${encodeURIComponent(session.topic_id)}`, { credentials: 'include' }),
                ]);
                const topicJson = (await topicRes.json()) as { success?: boolean; data?: { topic_name?: string } };
                const masteryJson = (await masteryRes.json()) as { success?: boolean; data?: { mastery_score?: number } };
                if (topicJson.success && topicJson.data?.topic_name) setLastTopicName(topicJson.data.topic_name);
                setLastTopicProgress(masteryJson.success && masteryJson.data ? (masteryJson.data.mastery_score ?? 0) : 0);
              }
            })
        );

        fetches.push(
          fetch('/api/mastery', { credentials: 'include' })
            .then(async (r) => {
              const json = await r.json();
              if (json.success && Array.isArray(json.data)) {
                setMasteryRecords(json.data);
                const names: Record<string, string> = {};
                await Promise.all(
                  json.data.slice(0, 8).map(async (rec: MasteryRecord) => {
                    try {
                      const tRes = await fetch(`/api/topics/${rec.topic_id}`, { credentials: 'include' });
                      const tJson = await tRes.json();
                      if (tJson.success && tJson.data?.topic_name) names[rec.topic_id] = tJson.data.topic_name;
                    } catch { /* skip */ }
                  })
                );
                setTopicNames(names);
              }
            })
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
        );

        await Promise.all(fetches);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [authUser, authLoading, router]);

  const topicsMastered = masteryRecords.filter((r) => r.mastery_score >= 80).length;
  const topicsInProgress = masteryRecords.filter((r) => r.attempt_count > 0 && r.mastery_score < 80).length;
  const recentTopics = masteryRecords
    .filter((r) => r.attempt_count > 0)
    .sort((a, b) => new Date(b.last_updated ?? 0).getTime() - new Date(a.last_updated ?? 0).getTime())
    .slice(0, 4);

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
        {/* Greeting banner */}
        <section className="mb-6">
          <div className="bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-lg">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{getGreeting()}</h1>
            <p className="text-sky-100 mt-1 text-sm md:text-base">
              Ready to continue your learning journey today?
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <Link href="/subjects" className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 flex items-center gap-2 hover:bg-white/30 transition cursor-pointer no-underline text-white">
                <BookOpen className="w-5 h-5" />
                <span className="font-bold">{subjects.length} Subjects</span>
              </Link>
              <Link href="/progress" className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 flex items-center gap-2 hover:bg-white/30 transition cursor-pointer no-underline text-white">
                <TrendingUp className="w-5 h-5" />
                <span className="font-bold">{topicsInProgress} Topics in Progress</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Continue Learning */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-3">Continue Learning</h2>
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
              <div className="h-5 bg-slate-100 rounded w-1/3 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-1/2 mb-4" />
              <div className="h-9 bg-slate-100 rounded w-24" />
            </div>
          ) : lastSession ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-sky-300 transition">
              <h3 className="font-semibold text-slate-900 truncate mb-1">
                {lastTopicName ?? 'Topic'}
              </h3>
              <div className="flex items-center justify-between gap-4 mt-3">
                <div className="min-w-0 flex-1">
                  {(lastTopicProgress ?? 0) >= 80 ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                      <span>✓</span> Mastered
                    </span>
                  ) : (
                    <>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, lastTopicProgress ?? 0)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Mastery: {lastTopicProgress ?? 0}%
                      </p>
                    </>
                  )}
                </div>
                <Link
                  href={`/topic/${lastSession.topic_id}`}
                  className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-2 rounded-lg transition no-underline flex-shrink-0"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
              <p className="text-slate-600 text-sm">Start learning by exploring subjects.</p>
              <Link
                href="/subjects"
                className="inline-flex items-center gap-1 mt-3 text-sky-600 text-sm font-medium hover:text-sky-700 hover:underline"
              >
                Explore subjects <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </section>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Link href="/subjects" className="block no-underline group">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-sky-300 hover:shadow-md transition cursor-pointer flex items-center gap-4 group-hover:bg-sky-50/50">
              <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-200 transition">
                <BookOpen className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500 font-medium">Subjects</div>
                <div className="text-2xl font-extrabold text-slate-800">{subjects.length}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-sky-500 ml-auto transition" />
            </div>
          </Link>
          <Link href="/progress" className="block no-underline group">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-emerald-300 hover:shadow-md transition cursor-pointer flex items-center gap-4 group-hover:bg-emerald-50/50">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500 font-medium">Topics Mastered</div>
                <div className="text-2xl font-extrabold text-slate-800">{topicsMastered}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 ml-auto transition" />
            </div>
          </Link>
          <Link href="/analytics" className="block no-underline group">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-300 hover:shadow-md transition cursor-pointer flex items-center gap-4 group-hover:bg-amber-50/50">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500 font-medium">Learning Time</div>
                <div className="text-2xl font-extrabold text-slate-800">{formatTime(totalLearningMinutes)}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 ml-auto transition" />
            </div>
          </Link>
        </div>

        {/* Your Subjects */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-800">Your Subjects</h2>
            <Link href="/subjects" className="text-sky-600 text-sm font-medium hover:underline inline-flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                  <div className="h-10 w-10 bg-slate-100 rounded-xl mb-3" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : subjects.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {subjects.map((subject, i) => {
                const color = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
                return (
                  <Link
                    key={subject._id}
                    href={`/subject/${subject._id}`}
                    className={`group block bg-white rounded-xl border border-slate-200 p-5 shadow-sm ${color.hover} hover:shadow-md transition no-underline`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center mb-3`}>
                      <BookOpen className={`w-5 h-5 ${color.icon}`} />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm group-hover:text-sky-700 truncate">{subject.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{subject.grade} · {subject.board}</p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">No subjects available yet.</p>
            </div>
          )}
        </section>

        {/* Recent Topics + Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Topic Progress */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <Link href="/progress" className="text-lg font-bold text-slate-800 hover:text-sky-600 no-underline">
                Topic Progress
              </Link>
              <Link href="/progress" className="text-slate-400 hover:text-sky-500" aria-label="My progress">
                <Target className="w-5 h-5" />
              </Link>
            </div>
            <div className="p-5">
              {loading ? (
                <p className="text-slate-500 text-sm">Loading...</p>
              ) : recentTopics.length === 0 ? (
                <>
                  <p className="text-slate-500 text-sm mb-4">No topics studied yet.</p>
                  <Link href="/subjects" className="inline-flex items-center gap-1 text-sky-600 text-sm font-medium hover:text-sky-700 hover:underline cursor-pointer rounded-lg px-3 py-2 -ml-2 hover:bg-sky-50 transition">
                    Start learning <ChevronRight className="w-4 h-4" />
                  </Link>
                </>
              ) : (
                <ul className="space-y-4">
                  {recentTopics.map((rec) => {
                    const mastered = rec.mastery_score >= 80;
                    return (
                      <li key={rec.topic_id}>
                        <Link
                          href={`/topic/${rec.topic_id}`}
                          className="block no-underline group"
                        >
                          <div className="flex gap-4 items-center">
                            <div className="relative w-12 h-12 flex-shrink-0">
                              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                <circle cx="18" cy="18" r="16" fill="none" stroke={mastered ? '#22c55e' : '#3b82f6'} strokeWidth="3" strokeDasharray={`${rec.mastery_score} 100`} strokeLinecap="round" />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                                {rec.mastery_score}%
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-slate-800 group-hover:text-sky-600 truncate text-sm">
                                {topicNames[rec.topic_id] ?? 'Topic'}
                              </h3>
                              <p className="text-xs text-slate-500">
                                {rec.correct_answers}/{rec.attempt_count} correct · {mastered ? 'Mastered' : 'In progress'}
                              </p>
                              <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${mastered ? 'bg-emerald-500' : 'bg-sky-500'}`} style={{ width: `${rec.mastery_score}%` }} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
              {recentTopics.length > 0 && (
                <Link href="/progress" className="inline-flex items-center gap-1 mt-4 text-sky-600 text-sm font-medium hover:text-sky-700 hover:underline cursor-pointer rounded-lg px-2 py-1 -ml-2 hover:bg-sky-50 transition">
                  View all progress <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
            </div>
            <div className="p-5 space-y-2">
              <Link href="/subjects" className="flex items-center gap-3 px-4 py-3.5 rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 transition no-underline group">
                <BookOpen className="w-5 h-5 text-sky-600" />
                <span className="font-medium flex-1">Explore Subjects & Topics</span>
                <ChevronRight className="w-4 h-4 text-sky-400 group-hover:translate-x-0.5 transition" />
              </Link>
              <Link href="/progress" className="flex items-center gap-3 px-4 py-3.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition no-underline group">
                <Target className="w-5 h-5 text-emerald-600" />
                <span className="font-medium flex-1">My Progress</span>
                <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition" />
              </Link>
              <Link href="/learning-path" className="flex items-center gap-3 px-4 py-3.5 rounded-lg bg-violet-50 text-violet-800 hover:bg-violet-100 transition no-underline group">
                <Flame className="w-5 h-5 text-violet-600" />
                <span className="font-medium flex-1">Learning Path</span>
                <ChevronRight className="w-4 h-4 text-violet-400 group-hover:translate-x-0.5 transition" />
              </Link>
              <Link href="/analytics" className="flex items-center gap-3 px-4 py-3.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition no-underline group">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <span className="font-medium flex-1">View Analytics</span>
                <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
