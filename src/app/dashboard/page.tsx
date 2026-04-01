'use client';

/**
 * Student dashboard — AI-first layout: continue learning, recommendations, weak areas,
 * progress (/api/performance), subjects (/api/subjects). Data: last-session, mastery, performance.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { LastSessionCompleteStats } from '@/lib/session-complete-storage';
import { readSessionCompleteStats } from '@/lib/session-complete-storage';
import Sidebar from '@/components/Sidebar';
import { BookOpen, ChevronRight, Flame, TrendingUp, Target } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import type { LastSessionPayload, MasteryRecord, PerformanceMetricRow, SubjectItem } from './_components/dashboard-types';
import {
  aggregatePerformance,
  buildRecommendations,
  buildWeakAreas,
  resolveTopicNames,
} from './_components/dashboard-utils';
import { fetchWithAuth } from '@/lib/api-client';
import ContinueLearningCard from './_components/ContinueLearningCard';
import RecommendationsSection from './_components/RecommendationsSection';
import WeakAreasSection from './_components/WeakAreasSection';
import ProgressStats from './_components/ProgressStats';
import SubjectsGridSection from './_components/SubjectsGridSection';
import FuturePlaceholders from './_components/FuturePlaceholders';
import SessionCompleteModal from './_components/SessionCompleteModal';

type User = { _id?: string; name: string; email: string; role: string; organization_id?: string };

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [lastSession, setLastSession] = useState<LastSessionPayload | null>(null);
  const [lastTopicName, setLastTopicName] = useState<string | null>(null);
  const [lastTopicProgress, setLastTopicProgress] = useState<number | null>(null);
  const [masteryRecords, setMasteryRecords] = useState<MasteryRecord[]>([]);
  const [topicNames, setTopicNames] = useState<Record<string, string>>({});
  const [performanceRows, setPerformanceRows] = useState<PerformanceMetricRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [sessionModalStats, setSessionModalStats] = useState<LastSessionCompleteStats | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search);
    if (q.get('sessionComplete') !== '1') return;
    window.history.replaceState(null, '', '/dashboard');
    const s = readSessionCompleteStats();
    setSessionModalStats(
      s ?? {
        v: 1,
        timeSpentSeconds: 0,
        questionsAnswered: 0,
        questionsCorrect: 0,
        endedAt: new Date().toISOString(),
      }
    );
    setSessionModalOpen(true);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    const run = async () => {
      const userData = authUser as User | null;
      if (!userData) {
        router.push('/login');
        return;
      }
      if (userData.role?.toLowerCase() === 'teacher') {
        router.push('/teacher/dashboard');
        return;
      }
      if (userData.role?.toLowerCase() === 'parent') {
        router.push('/parent/dashboard');
        return;
      }
      setUser(userData);

      try {
        const fetches: Promise<void>[] = [];

        if (userData.organization_id) {
          fetches.push(
            fetchWithAuth(`/api/subjects?organizationId=${encodeURIComponent(userData.organization_id)}`).then(async (r) => {
              const json = (await r.json()) as { success?: boolean; data?: SubjectItem[] };
              if (json.success && Array.isArray(json.data)) setSubjects(json.data);
            })
          );
        }

        fetches.push(
          fetchWithAuth('/api/last-session').then(async (r) => {
            const json = (await r.json()) as { success?: boolean; data?: LastSessionPayload | null };
            if (r.ok && json.success && json.data) {
              const session = json.data;
              setLastSession(session);
              const [topicRes, masteryRes] = await Promise.all([
                fetchWithAuth(`/api/topics/${session.topic_id}`),
                fetchWithAuth(`/api/mastery?topicId=${encodeURIComponent(session.topic_id)}`),
              ]);
              const topicJson = (await topicRes.json()) as { success?: boolean; data?: { topic_name?: string } };
              const masteryJson = (await masteryRes.json()) as { success?: boolean; data?: { mastery_score?: number } };
              if (topicJson.success && topicJson.data?.topic_name) setLastTopicName(topicJson.data.topic_name);
              setLastTopicProgress(masteryJson.success && masteryJson.data ? (masteryJson.data.mastery_score ?? 0) : 0);
            }
          })
        );

        fetches.push(
          fetchWithAuth('/api/mastery').then(async (r) => {
            const json = (await r.json()) as { success?: boolean; data?: MasteryRecord[] };
            if (json.success && Array.isArray(json.data)) {
              setMasteryRecords(json.data);
              const ids = json.data.map((rec) => rec.topic_id);
              const names = await resolveTopicNames(ids);
              setTopicNames(names);
            }
          })
        );

        fetches.push(
          fetchWithAuth('/api/performance').then(async (r) => {
            const json = (await r.json()) as { success?: boolean; data?: PerformanceMetricRow[] };
            if (json.success && Array.isArray(json.data)) setPerformanceRows(json.data);
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

  const { timeMinutes, topicsCompleted, masteryPercent } = useMemo(
    () => aggregatePerformance(performanceRows, masteryRecords),
    [performanceRows, masteryRecords]
  );

  const recommendationItems = useMemo(
    () => buildRecommendations(masteryRecords, topicNames),
    [masteryRecords, topicNames]
  );

  const weakAreaItems = useMemo(() => buildWeakAreas(masteryRecords, topicNames), [masteryRecords, topicNames]);

  const closeSessionModal = useCallback(() => {
    setSessionModalOpen(false);
    setSessionModalStats(null);
  }, []);

  const topicsMastered = masteryRecords.filter((r) => r.mastery_score >= 80).length;
  const topicsInProgress = masteryRecords.filter((r) => r.attempt_count > 0 && r.mastery_score < 80).length;
  const recentTopics = masteryRecords
    .filter((r) => r.attempt_count > 0)
    .sort((a, b) => new Date(b.last_updated ?? 0).getTime() - new Date(a.last_updated ?? 0).getTime())
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden max-w-[1600px] mx-auto w-full">
        <SessionCompleteModal
          open={sessionModalOpen}
          stats={sessionModalStats}
          loadingDashboard={loading}
          recommendationItems={recommendationItems}
          weakAreaItems={weakAreaItems}
          onClose={closeSessionModal}
        />
        <section className="mb-8">
          <div className="bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-lg">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
              {getGreeting()}
              {user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-sky-100 mt-1 text-sm md:text-base max-w-xl">
              Your dashboard is tuned to topics, sessions, and mastery — continue where you left off or strengthen weak areas.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href="/subjects"
                className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 flex items-center gap-2 hover:bg-white/30 transition no-underline text-white"
              >
                <BookOpen className="w-5 h-5 shrink-0" />
                <span className="font-bold">{subjects.length} subjects</span>
              </Link>
              <Link
                href="/progress"
                className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 flex items-center gap-2 hover:bg-white/30 transition no-underline text-white"
              >
                <TrendingUp className="w-5 h-5 shrink-0" />
                <span className="font-bold">{topicsInProgress} in progress</span>
              </Link>
              <div className="bg-white/15 backdrop-blur rounded-xl px-4 py-3 flex items-center gap-2 text-white/95">
                <Target className="w-5 h-5 shrink-0" />
                <span className="font-bold">{topicsMastered} mastered</span>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-10">
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-3">Continue learning</h2>
            <ContinueLearningCard
              loading={loading}
              lastSession={lastSession}
              lastTopicName={lastTopicName}
              lastTopicProgress={lastTopicProgress}
            />
          </section>

          <RecommendationsSection loading={loading} items={recommendationItems} />

          <WeakAreasSection loading={loading} items={weakAreaItems} />

          <ProgressStats
            loading={loading}
            timeMinutes={timeMinutes}
            topicsCompleted={topicsCompleted}
            masteryPercent={masteryPercent}
          />

          <FuturePlaceholders />

          <SubjectsGridSection loading={loading} subjects={subjects} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <Link href="/progress" className="text-lg font-bold text-slate-800 hover:text-sky-600 no-underline">
                Recent topic activity
              </Link>
              <Link href="/progress" className="text-slate-400 hover:text-sky-500" aria-label="My progress">
                <Target className="w-5 h-5" />
              </Link>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-14 bg-slate-100 rounded-lg" />
                  <div className="h-14 bg-slate-100 rounded-lg" />
                </div>
              ) : recentTopics.length === 0 ? (
                <>
                  <p className="text-slate-500 text-sm mb-4">No activity yet — start your first session from a subject.</p>
                  <Link
                    href="/subjects"
                    className="inline-flex items-center gap-1 text-sky-600 text-sm font-medium hover:text-sky-700 hover:underline rounded-lg px-3 py-2 -ml-2 hover:bg-sky-50 transition motion-safe-transition"
                  >
                    Start learning <ChevronRight className="w-4 h-4" />
                  </Link>
                </>
              ) : (
                <ul className="space-y-4">
                  {recentTopics.map((rec) => {
                    const mastered = rec.mastery_score >= 80;
                    return (
                      <li key={rec.topic_id}>
                        <Link href={`/topic/${rec.topic_id}`} className="block no-underline group">
                          <div className="flex gap-4 items-center">
                            <div className="relative w-12 h-12 flex-shrink-0">
                              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="16"
                                  fill="none"
                                  stroke={mastered ? '#22c55e' : '#3b82f6'}
                                  strokeWidth="3"
                                  strokeDasharray={`${rec.mastery_score} 100`}
                                  strokeLinecap="round"
                                />
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
                                <div
                                  className={`h-full rounded-full ${mastered ? 'bg-emerald-500' : 'bg-sky-500'}`}
                                  style={{ width: `${rec.mastery_score}%` }}
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
              {!loading && recentTopics.length > 0 && (
                <Link
                  href="/progress"
                  className="inline-flex items-center gap-1 mt-4 text-sky-600 text-sm font-medium hover:text-sky-700 hover:underline rounded-lg px-2 py-1 -ml-2 hover:bg-sky-50 transition"
                >
                  View all progress <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Quick actions</h2>
            </div>
            <div className="p-5 space-y-2">
              <Link
                href="/subjects"
                className="flex items-center gap-3 px-4 py-3.5 rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 transition no-underline group"
              >
                <BookOpen className="w-5 h-5 text-sky-600 shrink-0" />
                <span className="font-medium flex-1">Explore subjects & topics</span>
                <ChevronRight className="w-4 h-4 text-sky-400 group-hover:translate-x-0.5 transition shrink-0" />
              </Link>
              <Link
                href="/progress"
                className="flex items-center gap-3 px-4 py-3.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition no-underline group"
              >
                <Target className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-medium flex-1">My progress</span>
                <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition shrink-0" />
              </Link>
              <Link
                href="/learning-path"
                className="flex items-center gap-3 px-4 py-3.5 rounded-lg bg-violet-50 text-violet-800 hover:bg-violet-100 transition no-underline group"
              >
                <Flame className="w-5 h-5 text-violet-600 shrink-0" />
                <span className="font-medium flex-1">Learning path</span>
                <ChevronRight className="w-4 h-4 text-violet-400 group-hover:translate-x-0.5 transition shrink-0" />
              </Link>
              <Link
                href="/analytics"
                className="flex items-center gap-3 px-4 py-3.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition no-underline group"
              >
                <TrendingUp className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="font-medium flex-1">Analytics</span>
                <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
