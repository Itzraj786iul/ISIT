'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { BookOpen, ChevronRight, AlertCircle, ListTodo, Clock, Check } from 'lucide-react';

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
  const params = useParams();
  const id = params.id as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [masteryByTopic, setMasteryByTopic] = useState<Record<string, MasteryData>>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const [subjectRes, topicsRes] = await Promise.all([
          fetch(`/api/subjects/${id}`, { credentials: 'include' }),
          fetch(`/api/topics?subjectId=${encodeURIComponent(id)}`, { credentials: 'include' }),
        ]);

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
      <div className="min-h-screen bg-slate-50 flex font-sans">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="h-5 bg-slate-200 rounded w-32 mb-6" />
            <div className="h-8 bg-slate-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-slate-100 rounded w-1/2 mb-8" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-white rounded-xl border border-slate-200" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (notFound || !subject) {
    return (
      <div className="min-h-screen bg-slate-50 flex font-sans">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
          <h1 className="text-xl font-semibold text-slate-900">Subject not found</h1>
          <p className="text-slate-600 mt-1">The subject you’re looking for doesn’t exist or was removed.</p>
          <Link href="/subjects" className="mt-6 text-sky-600 font-medium hover:underline">
            Back to Subjects
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-auto">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/subjects"
            className="inline-flex items-center gap-1 text-sky-600 text-sm font-medium hover:underline mb-4"
          >
            ← Subjects
          </Link>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-sm font-medium">
              {subject.grade}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-sm font-medium">
              {subject.board}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{subject.name}</h1>
          {subject.description && (
            <p className="text-slate-600 text-sm leading-relaxed mb-8">{subject.description}</p>
          )}

          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-sky-600" />
            Topics
          </h2>
          {topics.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
              <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
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
                      className="group block bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-sky-300 hover:shadow-md transition no-underline text-inherit"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-slate-900 group-hover:text-sky-700 truncate">
                            {topic.topic_name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {difficultyBadge(topic.difficulty_level)}
                            {topic.estimated_time != null && topic.estimated_time > 0 && (
                              <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
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
                                <p className="text-xs text-slate-500 mt-1">
                                  Progress: {mastery.mastery_score}%
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-sky-500 flex-shrink-0 mt-0.5" />
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
