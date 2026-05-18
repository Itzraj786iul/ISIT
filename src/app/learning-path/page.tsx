'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { Target, ChevronRight, Layers, Loader2 } from 'lucide-react';
import { useT } from '@/lib/t';

type SubjectPath = {
  _id: string;
  name: string;
  grade: string;
  description?: string;
  topics: { _id: string; topic_name: string; status?: string }[];
};

export default function LearningPathPage() {
  const tr = useT();
  const router = useRouter();
  const [paths, setPaths] = useState<SubjectPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!meRes.ok) { router.push('/login'); return; }
      const meData = await meRes.json();
      const u = meData.user;
      if (!u || u.role?.toLowerCase() === 'teacher') { router.push('/teacher/dashboard'); return; }

      if (!u.organization_id) { setLoading(false); return; }

      try {
        const subjRes = await fetch(`/api/subjects?organizationId=${encodeURIComponent(u.organization_id)}`);
        const subjJson = await subjRes.json();
        if (!subjJson.success || !Array.isArray(subjJson.data)) { setLoading(false); return; }

        const result: SubjectPath[] = await Promise.all(
          subjJson.data.map(async (s: { _id: string; name: string; grade: string; description?: string }) => {
            const topicsRes = await fetch(`/api/topics?subjectId=${encodeURIComponent(s._id)}`);
            const topicsJson = await topicsRes.json();
            return {
              _id: s._id,
              name: s.name,
              grade: s.grade,
              description: s.description,
              topics: topicsJson.success && Array.isArray(topicsJson.data) ? topicsJson.data : [],
            };
          })
        );
        setPaths(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [router]);

  return (
    <div className="isit-cosmic-bg relative flex min-h-screen font-sans ">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-white dark:bg-slate-950/95">
          <div className="px-4 py-3 sm:px-6 md:px-8">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
              <Link href="/dashboard" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
                {tr('dashboard')}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              <span className="font-medium text-slate-700 dark:text-slate-200">{tr('learningPath')}</span>
            </nav>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{tr('learningPath')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tr('learningPathPageLead')}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : paths.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <Layers className="w-12 h-12 text-slate-600 dark:text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-600 dark:text-slate-300">{tr('learningPathEmptyTitle')}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tr('learningPathEmptyLead')}</p>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl">
            {paths.map((path) => {
              const totalTopics = path.topics.length;
              return (
                <div key={path._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="h-1.5 bg-sky-500" />
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">{path.name}</h2>
                        {path.description && <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{path.description}</p>}
                        <div className="flex flex-wrap gap-4 mt-3">
                          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                            <Target className="w-4 h-4 text-slate-400" />
                            {tr('learningPathTopicCount').replace(/\{count\}/g, String(totalTopics))}
                          </span>
                          <span className="text-xs bg-slate-100 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium">{path.grade}</span>
                        </div>
                      </div>
                    </div>

                    {totalTopics > 0 && (
                      <>
                        <h3 className="mt-6 mb-3 text-base font-bold text-slate-800 dark:text-slate-100">
                          {tr('learningPathTopicsListHeading')}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {path.topics.map((topic) => (
                            <Link
                              key={topic._id}
                              href={`/topic/${topic._id}`}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition bg-sky-50 text-sky-800 border border-sky-100 hover:bg-sky-100 no-underline"
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 flex-shrink-0" />
                              <span className="font-medium flex-1">{topic.topic_name}</span>
                              <ChevronRight className="w-4 h-4 text-sky-400" />
                            </Link>
                          ))}
                        </div>
                      </>
                    )}

                    <Link
                      href={`/subject/${path._id}`}
                      className="mt-6 flex items-center justify-center gap-2 w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-xl transition no-underline"
                    >
                      {tr('learningPathViewSubject')} <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
