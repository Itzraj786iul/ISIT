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
import Sidebar from '@/components/LazySidebar';
import { BookOpen, Bot, ChevronRight, Library, TrendingUp, Target } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/t';
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
import AssignedByTeacherSection from './_components/AssignedByTeacherSection';
import type { AssignedTopicListItem } from '@/lib/assigned-topic-types';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';

type User = {
  _id?: string;
  name: string;
  email: string;
  role: string;
  organization_id?: string;
  email_verified?: boolean;
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const router = useRouter();
  const { user: authUser, loading: authLoading, refresh: refreshAuth } = useAuth();
  const tr = useT();
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
  const [assignedTopics, setAssignedTopics] = useState<AssignedTopicListItem[]>([]);

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
      if (userData.role?.toLowerCase() === 'admin') {
        router.replace('/organization');
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

        fetches.push(
          fetchWithAuth('/api/student/assigned-topics').then(async (r) => {
            const json = (await r.json()) as { success?: boolean; data?: AssignedTopicListItem[] };
            if (r.ok && json.success && Array.isArray(json.data)) setAssignedTopics(json.data);
          })
        );

        await Promise.all(fetches);
      } catch {
        /* ignore — dashboard still renders with partial data */
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
    () =>
      buildRecommendations(masteryRecords, topicNames, {
        assignedTopics: assignedTopics.map((a) => ({
          topic_id: a.topic_id,
          topic_name: a.topic_name,
          status: a.status,
        })),
      }),
    [masteryRecords, topicNames, assignedTopics]
  );

  const hasAssignedTopics = assignedTopics.length > 0;

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
    <div className="isit-app-bg min-h-screen flex font-sans overflow-x-hidden relative">
      <Sidebar />
      <main className="isit-app-main isit-app-main--with-nav-toggle">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-8 space-y-4 sm:space-y-6">
          <SessionCompleteModal
            open={sessionModalOpen}
            stats={sessionModalStats}
            loadingDashboard={loading}
            recommendationItems={recommendationItems}
            weakAreaItems={weakAreaItems}
            onClose={closeSessionModal}
          />

          {authUser && authUser.email_verified === false && (
            <EmailVerificationBanner email={authUser.email} onResolved={() => refreshAuth({ force: true })} />
          )}

          <section aria-labelledby="dashboard-welcome">
            <div className="rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 p-4 text-white shadow-lg sm:p-6 lg:p-8">
              <p id="dashboard-welcome" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100/90">
                {tr('dashboardHeroSnapshot')}
              </p>
              <h1 className="mt-2 text-xl font-bold leading-tight sm:text-2xl lg:text-3xl">
                {getGreeting()}
                {user?.name ? `, ${user.name.split(' ')[0]}` : ''}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sky-100 sm:text-base">{tr('dashboardHeroSubtitle')}</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/learn/subjects"
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-base font-bold text-sky-700 no-underline shadow-sm hover:bg-sky-50 active:scale-[0.98] motion-safe-transition sm:flex-none sm:min-w-[200px]"
                >
                  <BookOpen className="h-5 w-5 shrink-0" />
                  {tr('dashboardOpenSubjects')}
                </Link>
                <Link
                  href="/ai-tutor"
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/20 px-5 py-3 text-base font-semibold text-white no-underline backdrop-blur hover:bg-white/30 active:scale-[0.98] motion-safe-transition sm:flex-none"
                >
                  <Bot className="h-5 w-5 shrink-0" />
                  {tr('aiTutor')}
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-sky-50 sm:text-sm">
                <span className="rounded-lg bg-white/25 px-3 py-1.5 backdrop-blur">
                  {subjects.length} {tr('subjects')}
                </span>
                <span className="rounded-lg bg-white/25 px-3 py-1.5 backdrop-blur">
                  {topicsInProgress} {tr('dashboardInProgress')}
                </span>
                <span className="rounded-lg bg-white/25 px-3 py-1.5 backdrop-blur">
                  {topicsMastered} {tr('dashboardMasteredLabel')}
                </span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mb-2 sm:mb-3 dark:text-slate-100">
              {tr('continueLearning')}
            </h2>
            <ContinueLearningCard
              loading={loading}
              lastSession={lastSession}
              lastTopicName={lastTopicName}
              lastTopicProgress={lastTopicProgress}
            />
          </section>

          <AssignedByTeacherSection loading={loading} items={assignedTopics} />

          {(!hasAssignedTopics || loading) && (
            <RecommendationsSection loading={loading} items={recommendationItems} />
          )}

          <WeakAreasSection loading={loading} items={weakAreaItems} />

          <ProgressStats
            loading={loading}
            timeMinutes={timeMinutes}
            topicsCompleted={topicsCompleted}
            masteryPercent={masteryPercent}
          />

          <SubjectsGridSection loading={loading} subjects={subjects} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="isit-app-stat-card rounded-2xl shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-700">
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2 min-w-0">
                <Link
                  href="/analytics"
                  className="text-lg sm:text-xl font-bold text-slate-800 hover:text-sky-600 no-underline truncate dark:text-slate-100"
                >
                  {tr('dashboardRecentActivity')}
                </Link>
                <Link
                  href="/analytics"
                  className="min-h-[44px] min-w-[44px] shrink-0 inline-flex items-center justify-center text-slate-400 hover:text-sky-500 rounded-xl active:scale-95"
                  aria-label="Analytics"
                >
                  <Target className="w-5 h-5" />
                </Link>
              </div>
              <div className="p-4 sm:p-5 overflow-x-hidden">
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-14 bg-slate-100 rounded-xl dark:bg-slate-800" />
                    <div className="h-14 bg-slate-100 rounded-xl dark:bg-slate-800" />
                  </div>
                ) : recentTopics.length === 0 ? (
                  <>
                    <p className="text-slate-500 text-sm sm:text-base mb-4 dark:text-slate-400">
                      No activity yet — start your first session from a subject.
                    </p>
                    <Link
                      href="/learn/subjects"
                      className="inline-flex items-center justify-center gap-1 min-h-[44px] px-4 rounded-xl text-sky-600 text-sm sm:text-base font-semibold hover:bg-sky-50 dark:hover:bg-sky-950/40 active:scale-[0.98] transition-transform w-full sm:w-auto"
                    >
                      {tr('startLearning')} <ChevronRight className="w-4 h-4 shrink-0" />
                    </Link>
                  </>
                ) : (
                  <ul className="space-y-4">
                    {recentTopics.map((rec) => {
                      const mastered = rec.mastery_score >= 80;
                      return (
                        <li key={rec.topic_id}>
                          <Link href={`/topic/${rec.topic_id}`} className="block no-underline group min-h-[44px]">
                            <div className="flex gap-3 sm:gap-4 items-center">
                              <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0">
                                <svg className="w-full h-full max-w-[3rem] -rotate-90" viewBox="0 0 36 36">
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
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-200">
                                  {rec.mastery_score}%
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-slate-800 group-hover:text-sky-600 truncate text-sm sm:text-base dark:text-slate-100">
                                  {topicNames[rec.topic_id] ?? 'Topic'}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                  {rec.correct_answers}/{rec.attempt_count} correct · {mastered ? 'Mastered' : 'In progress'}
                                </p>
                                <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
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
                    href="/analytics"
                    className="inline-flex items-center justify-center gap-1 mt-4 min-h-[44px] px-3 rounded-xl text-sky-600 text-sm font-semibold hover:bg-sky-50 dark:hover:bg-sky-950/40 active:scale-[0.98] transition-transform w-full sm:w-auto"
                  >
                    View analytics <ChevronRight className="w-4 h-4 shrink-0" />
                  </Link>
                )}
              </div>
            </div>

            <div className="isit-app-stat-card rounded-2xl shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-700">
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">{tr('dashboardQuickActionsTitle')}</h2>
              </div>
              <div className="space-y-2 p-4 sm:p-5">
                <Link
                  href="/learn/subjects"
                  className="group flex min-h-[44px] items-center gap-3 rounded-xl bg-sky-50 px-4 py-3 text-sky-800 transition no-underline hover:bg-sky-100 active:scale-[0.99] dark:bg-sky-950/40 dark:text-sky-200"
                >
                  <BookOpen className="h-5 w-5 shrink-0 text-sky-600" />
                  <span className="min-w-0 flex-1 text-sm font-medium sm:text-base">{tr('browseSubjects')}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-sky-400 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/ai-tutor"
                  className="group flex min-h-[44px] items-center gap-3 rounded-xl bg-indigo-50 px-4 py-3 text-indigo-900 transition no-underline hover:bg-indigo-100 active:scale-[0.99] dark:bg-indigo-950/35 dark:text-indigo-100"
                >
                  <Bot className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                  <span className="min-w-0 flex-1 text-sm font-medium sm:text-base">{tr('aiTutor')}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-indigo-400 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/analytics"
                  className="group flex min-h-[44px] items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-900 transition no-underline hover:bg-emerald-100 active:scale-[0.99] dark:bg-emerald-950/30 dark:text-emerald-100"
                >
                  <TrendingUp className="h-5 w-5 shrink-0 text-emerald-600" />
                  <span className="min-w-0 flex-1 text-sm font-medium sm:text-base">{tr('analytics')}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-emerald-400 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/my-courses"
                  className="group flex min-h-[44px] items-center gap-3 rounded-xl bg-amber-50 px-4 py-3 text-amber-900 transition no-underline hover:bg-amber-100 active:scale-[0.99] dark:bg-amber-950/25 dark:text-amber-100"
                >
                  <Library className="h-5 w-5 shrink-0 text-amber-700" />
                  <span className="min-w-0 flex-1 text-sm font-medium sm:text-base">{tr('dashboardQuickMyCourses')}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-amber-400 transition group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>

          <section className="space-y-3 pt-2 sm:pt-4" aria-labelledby="dashboard-coming-later">
            <h2 id="dashboard-coming-later" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {tr('sectionComingLater')}
            </h2>
            <FuturePlaceholders />
          </section>
        </div>
      </main>
    </div>
  );
}
