'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Award, BookOpen, Layers, Target, Loader2 } from 'lucide-react';

type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: 'award' | 'book' | 'layers' | 'target';
  color: string;
};

type MasteryRecord = {
  topic_id: string;
  mastery_score: number;
  attempt_count: number;
  subject_id?: string;
};

export default function AchievementsPage() {
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
          title: 'First Topic Studied',
          description: 'Study your first topic',
          unlocked: studiedTopics.length > 0,
          icon: 'book',
          color: '#3b82f6',
        });
        achList.push({
          id: 'topic-master',
          title: 'Topic Master',
          description: 'Master a topic (80%+ score)',
          unlocked: masteredTopics.length >= 1,
          icon: 'award',
          color: '#f59e0b',
        });
        achList.push({
          id: 'triple-master',
          title: 'Triple Master',
          description: 'Master 3 topics',
          unlocked: masteredTopics.length >= 3,
          icon: 'award',
          color: '#ec4899',
        });
        achList.push({
          id: 'five-topics',
          title: 'Knowledge Builder',
          description: 'Study 5 different topics',
          unlocked: studiedTopics.length >= 5,
          icon: 'book',
          color: '#ef4444',
        });
        achList.push({
          id: 'ten-mastered',
          title: 'Scholar',
          description: 'Master 10 topics',
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
            title: 'Explorer',
            description: 'Have subjects available to study',
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
          title: 'Study Session',
          description: 'Complete your first learning session',
          unlocked: sessionCount >= 1,
          icon: 'target',
          color: '#22c55e',
        });
        achList.push({
          id: 'sessions-10',
          title: 'Dedicated Learner',
          description: 'Complete 10 learning sessions',
          unlocked: sessionCount >= 10,
          icon: 'target',
          color: '#0ea5e9',
        });
        achList.push({
          id: 'sessions-50',
          title: 'Marathon Runner',
          description: 'Complete 50 learning sessions',
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
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Achievements</h1>
          <p className="text-slate-500 text-sm mt-1">Unlock badges as you progress</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="text-3xl font-extrabold text-slate-800">{unlocked}</div>
                <div className="text-sm text-slate-500 font-medium mt-1">Unlocked</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="text-3xl font-extrabold text-slate-800">{achievements.length}</div>
                <div className="text-sm text-slate-500 font-medium mt-1">Total Achievements</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="text-3xl font-extrabold text-slate-800">
                  {achievements.length > 0 ? Math.round((unlocked / achievements.length) * 100) : 0}%
                </div>
                <div className="text-sm text-slate-500 font-medium mt-1">Completion</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className={`bg-white rounded-xl border p-5 shadow-sm relative ${
                    a.unlocked ? 'border-emerald-200' : 'border-slate-200 opacity-60'
                  }`}
                >
                  {a.unlocked && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: a.color + '20' }}
                  >
                    {renderIcon(a.icon, a.color)}
                  </div>
                  <h3 className="font-bold text-slate-800">{a.title}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{a.description}</p>
                  <p className={`text-xs mt-2 font-medium ${a.unlocked ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {a.unlocked ? 'Unlocked' : 'Locked'}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
