'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { Award, BookOpen, Layers, Target, Loader2, ChevronRight } from 'lucide-react';
import { useT, type I18nKey } from '@/lib/t';

type Achievement = {
  id: string;
  unlocked: boolean;
  icon: 'award' | 'book' | 'layers' | 'target';
  color: string;
};

const ACHIEVEMENT_I18N: Record<string, { title: I18nKey; desc: I18nKey }> = {
  'first-topic': { title: 'achievementFirstTopicTitle', desc: 'achievementFirstTopicDesc' },
  'topic-master': { title: 'achievementTopicMasterTitle', desc: 'achievementTopicMasterDesc' },
  'triple-master': { title: 'achievementTripleMasterTitle', desc: 'achievementTripleMasterDesc' },
  'five-topics': { title: 'achievementKnowledgeBuilderTitle', desc: 'achievementKnowledgeBuilderDesc' },
  'ten-mastered': { title: 'achievementScholarTitle', desc: 'achievementScholarDesc' },
  'explore-subjects': { title: 'achievementExplorerTitle', desc: 'achievementExplorerDesc' },
  'first-session': { title: 'achievementStudySessionTitle', desc: 'achievementStudySessionDesc' },
  'sessions-10': { title: 'achievementDedicatedLearnerTitle', desc: 'achievementDedicatedLearnerDesc' },
  'sessions-50': { title: 'achievementMarathonRunnerTitle', desc: 'achievementMarathonRunnerDesc' },
};

type MasteryRecord = {
  topic_id: string;
  mastery_score: number;
  attempt_count: number;
  subject_id?: string;
};

export default function AchievementsPage() {
  const tr = useT();
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!meRes.ok) { router.push('/login'); return; }
      const meData = await meRes.json();
      const u = meData.user;
      if (!u || u.role?.toLowerCase() === 'teacher') { router.push('/teacher/dashboard'); return; }

      const achList: Achievement[] = [];

      try {
        const masteryRes = await fetch('/api/mastery', { credentials: 'include' });
        let masteryRecords: MasteryRecord[] = [];
        if (masteryRes.ok) {
          const masteryJson = await masteryRes.json();
          if (masteryJson.success && Array.isArray(masteryJson.data)) {
            masteryRecords = masteryJson.data;
          }
        }

        const studiedTopics = masteryRecords.filter((r) => r.attempt_count > 0);
        const masteredTopics = masteryRecords.filter((r) => r.mastery_score >= 80);

        achList.push({
          id: 'first-topic',
          unlocked: studiedTopics.length > 0,
          icon: 'book',
          color: '#3b82f6',
        });
        achList.push({
          id: 'topic-master',
          unlocked: masteredTopics.length >= 1,
          icon: 'award',
          color: '#f59e0b',
        });
        achList.push({
          id: 'triple-master',
          unlocked: masteredTopics.length >= 3,
          icon: 'award',
          color: '#ec4899',
        });
        achList.push({
          id: 'five-topics',
          unlocked: studiedTopics.length >= 5,
          icon: 'book',
          color: '#ef4444',
        });
        achList.push({
          id: 'ten-mastered',
          unlocked: masteredTopics.length >= 10,
          icon: 'award',
          color: '#a855f7',
        });

        if (u.organization_id) {
          const subjRes = await fetch(`/api/subjects?organizationId=${encodeURIComponent(u.organization_id)}`);
          const subjJson = await subjRes.json();
          const subjectCount = subjJson.success && Array.isArray(subjJson.data) ? subjJson.data.length : 0;

          achList.push({
            id: 'explore-subjects',
            unlocked: subjectCount > 0,
            icon: 'layers',
            color: '#6366f1',
          });
        }

        const sessRes = await fetch('/api/sessions', { credentials: 'include' });
        let sessionCount = 0;
        if (sessRes.ok) {
          const sessJson = await sessRes.json();
          const sessions = sessJson.success && Array.isArray(sessJson.data) ? sessJson.data : [];
          sessionCount = sessions.length;
        }

        achList.push({
          id: 'first-session',
          unlocked: sessionCount >= 1,
          icon: 'target',
          color: '#22c55e',
        });
        achList.push({
          id: 'sessions-10',
          unlocked: sessionCount >= 10,
          icon: 'target',
          color: '#0ea5e9',
        });
        achList.push({
          id: 'sessions-50',
          unlocked: sessionCount >= 50,
          icon: 'award',
          color: '#a855f7',
        });
      } catch (e) {
        console.error(e);
      }

      setAchievements(achList);
      setLoading(false);
    };
    run();
  }, [router]);

  const unlocked = achievements.filter((a) => a.unlocked).length;

  const renderIcon = (icon: string, color: string) => {
    const props = { className: 'w-8 h-8', style: { color } };
    if (icon === 'book') return <BookOpen {...props} />;
    if (icon === 'layers') return <Layers {...props} />;
    if (icon === 'target') return <Target {...props} />;
    return <Award {...props} />;
  };

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
              <span className="font-medium text-slate-700 dark:text-slate-200">{tr('achievements')}</span>
            </nav>
          </div>
        </header>

        <main className="isit-app-main isit-app-main--with-nav-toggle">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{tr('achievements')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tr('achievementsPageLead')}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="isit-app-panel rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{unlocked}</div>
                <div className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{tr('achievementsSummaryUnlocked')}</div>
              </div>
              <div className="isit-app-panel rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{achievements.length}</div>
                <div className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{tr('achievementsSummaryTotal')}</div>
              </div>
              <div className="isit-app-panel rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                  {achievements.length > 0 ? Math.round((unlocked / achievements.length) * 100) : 0}%
                </div>
                <div className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{tr('achievementsSummaryCompletion')}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {achievements.map((a) => {
                const keys = ACHIEVEMENT_I18N[a.id];
                return (
                <div
                  key={a.id}
                  className={`isit-achievement-card ${
                    a.unlocked ? 'isit-achievement-card--unlocked' : 'isit-achievement-card--locked'
                  }`}
                >
                  {a.unlocked && (
                    <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                      <svg className="h-3.5 w-3.5 text-slate-900 dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                  <div
                    className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl"
                    style={{ backgroundColor: a.color + '20' }}
                  >
                    {renderIcon(a.icon, a.color)}
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">
                    {keys ? tr(keys.title) : a.id}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{keys ? tr(keys.desc) : ''}</p>
                  <p className={`mt-2 text-xs font-medium ${a.unlocked ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {a.unlocked ? tr('achievementsBadgeUnlocked') : tr('achievementsBadgeLocked')}
                  </p>
                </div>
                );
              })}
            </div>
          </>
        )}
      </main>
      </div>
    </div>
  );
}
