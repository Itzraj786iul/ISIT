'use client';

/** AI-first — lists `Topic` rows for a subject; links to /topic/[id]. See docs/AI_FIRST_MIGRATION.md */
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { BookOpen, ChevronRight, AlertCircle, ListTodo, Clock, Check } from 'lucide-react';
import { useT } from '@/lib/t';

function difficultyBadge(level?: string) {
  if (!level) return null;
  const l = String(level).toLowerCase();
  const colors =
    l === 'beginner'
      ? 'bg-emerald-100 text-emerald-800'
      : l === 'intermediate'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-rose-100 text-rose-800';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors}`}>
      {level}
    </span>
  );
}

type Subject = {
  _id: string;
  name: string;
  grade: string;
  board: string;
  description?: string;
  [key: string]: unknown;
};

type Topic = {
  _id: string;
  topic_name: string;
  topic_order?: number;
  difficulty_level?: string;
  estimated_time?: number;
  [key: string]: unknown;
};

type MasteryData = {
  mastery_score: number;
  attempt_count: number;
  correct_answers: number;
};

export default function SubjectDetailPage() {
  const tr = useT();
  const params = useParams();
  const id = params.id as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [masteryByTopic, setMasteryByTopic] = useState<Record<string, MasteryData>>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      setForbidden(false);
      try {
        const [subjectRes, topicsRes] = await Promise.all([
          fetch(`/api/subjects/${id}`, { credentials: 'include' }),
          fetch(`/api/topics?subjectId=${encodeURIComponent(id)}`, { credentials: 'include' }),
        ]);

        if (subjectRes.status === 403) {
          setForbidden(true);
          setLoading(false);
          return;
        }

        const subjectJson = (await subjectRes.json()) as { success?: boolean; data?: Subject; error?: string };
        if (!subjectRes.ok || !subjectJson.success || !subjectJson.data) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setSubject(subjectJson.data);

        const topicsJson = (await topicsRes.json()) as { success?: boolean; data?: Topic[] };
        const topicList = Array.isArray(topicsJson?.data) ? topicsJson.data : [];
        setTopics(topicList);

        const masteryResults = await Promise.all(
          topicList.map(async (t) => {
            const res = await fetch(`/api/mastery?topicId=${encodeURIComponent(t._id)}`, {
              credentials: 'include',
            });
            const json = (await res.json()) as { success?: boolean; data?: MasteryData };
            const data: MasteryData =
              json.success && json.data
                ? json.data
                : { mastery_score: 0, attempt_count: 0, correct_answers: 0 };
            return { topicId: t._id, data };
          })
        );
        setMasteryByTopic(
          Object.fromEntries(masteryResults.map((r) => [r.topicId, r.data]))
        );
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="isit-app-bg min-h-screen flex font-sans relative">
        <Sidebar />
        <main className="isit-app-main isit-app-main--with-nav-toggle">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="h-5 bg-slate-200 rounded w-32 mb-6" />
            <div className="h-8 bg-slate-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-slate-100 rounded w-1/2 mb-8" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 isit-app-panel rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="isit-app-bg min-h-screen flex font-sans relative">
        <Sidebar />
        <main className="flex min-h-[50vh] flex-1 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
          <AlertCircle className="mb-4 h-12 w-12 text-amber-400" />
          <h1 className="text-xl font-semibold isit-text-primary">{tr('subjectAccessDeniedTitle')}</h1>
          <p className="mt-2 max-w-md text-center text-sm /80">{tr('subjectAccessDeniedLead')}</p>
          <Link href="/learn/subjects" className="mt-6 font-medium text-sky-400 hover:underline">
            ← {tr('subjects')}
          </Link>
        </main>
      </div>
    );
  }

  if (notFound || !subject) {
    return (
      <div className="isit-app-bg min-h-screen flex font-sans relative">
        <Sidebar />
        <main className="flex min-h-[50vh] flex-1 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
          <AlertCircle className="mb-4 h-12 w-12 text-sky-600 dark:text-cyan-300/60" />
          <h1 className="text-xl font-semibold isit-text-primary">{tr('subjectNotFoundTitle')}</h1>
          <p className="mt-2 text-center text-sm /75">{tr('subjectNotFoundLead')}</p>
          <Link href="/learn/subjects" className="mt-6 font-medium text-sky-400 hover:underline">
            ← {tr('subjects')}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="isit-app-bg min-h-screen flex font-sans relative">
      <Sidebar />
      <main className="isit-app-main isit-app-main--with-nav-toggle">
        <div className="max-w-4xl mx-auto">
          <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Link href="/dashboard" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
              {tr('dashboard')}
            </Link>
            <span className="text-slate-400" aria-hidden>
              /
            </span>
            <Link href="/learn/subjects" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
              {tr('subjects')}
            </Link>
            <span className="text-slate-400" aria-hidden>
              /
            </span>
            <span className="max-w-[min(100%,14rem)] truncate font-semibold text-slate-800 dark:text-slate-100 sm:max-w-xl">
              {subject.name}
            </span>
          </nav>
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-sm font-medium">
              {subject.grade}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-sm font-medium">
              {subject.board}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{subject.name}</h1>
          {subject.description && (
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-8">{subject.description}</p>
          )}

          <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            <ListTodo className="h-5 w-5 text-sky-600" aria-hidden />
            {tr('learningFlowSubjectTopicsHeading')}
          </h2>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{tr('learningFlowSubjectTopicsLead')}</p>
          {topics.length === 0 ? (
            <div className="isit-app-panel rounded-xl p-8 text-center text-slate-500 dark:text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-600 dark:text-slate-300" />
              <p className="text-sm font-medium">No topics in this subject yet.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {topics.map((topic) => {
                const mastery = masteryByTopic[topic._id] ?? {
                  mastery_score: 0,
                  attempt_count: 0,
                  correct_answers: 0,
                };
                const isCompleted = mastery.mastery_score >= 80;
                return (
                  <li key={topic._id}>
                    <Link
                      href={`/topic/${topic._id}`}
                      className="group block isit-app-panel rounded-xl p-4 shadow-sm hover:border-sky-300 hover:shadow-md transition no-underline text-inherit"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-slate-900 group-hover:text-sky-700 truncate">
                            {topic.topic_name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {difficultyBadge(topic.difficulty_level)}
                            {topic.estimated_time != null && topic.estimated_time > 0 && (
                              <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
                                <Clock className="w-3.5 h-3.5" />
                                {topic.estimated_time} min
                              </span>
                            )}
                          </div>
                          <div className="mt-3">
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                                <Check className="w-4 h-4" />
                                Completed
                              </span>
                            ) : (
                              <div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-sky-500 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, mastery.mastery_score)}%` }}
                                  />
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  Progress: {mastery.mastery_score}%
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-sky-500 flex-shrink-0 mt-0.5" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
