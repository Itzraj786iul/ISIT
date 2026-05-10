'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TeacherShell from '../../_components/TeacherShell';
import { BookOpen, ChevronRight, Clock, FileText, HelpCircle, Video, AlertCircle, Layers, Check } from 'lucide-react';

type User = { _id?: string; name: string; role: string; organization_id?: string };
type Subject = { _id: string; name: string; grade: string; board: string; description?: string };
type Topic = {
  _id: string;
  topic_name: string;
  topic_order?: number;
  difficulty_level?: string;
  estimated_time?: number;
  status?: string;
  key_concepts?: string[];
};
type ContentCounts = { notes: number; questions: number; videos: number };

function difficultyBadge(level?: string) {
  if (!level) return null;
  const l = level.toLowerCase();
  const colors =
    l === 'beginner' ? 'bg-emerald-100 text-emerald-800'
    : l === 'intermediate' ? 'bg-amber-100 text-amber-800'
    : 'bg-rose-100 text-rose-800';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors}`}>{level}</span>;
}

export default function TeacherSubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [contentCounts, setContentCounts] = useState<Record<string, ContentCounts>>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      setLoading(true);
      setForbidden(false);
      try {
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (!meRes.ok) { router.push('/login'); return; }
        const meData = await meRes.json();
        const userData = meData.user as User;
        if (!userData || userData.role?.toLowerCase() !== 'teacher') { router.push('/dashboard'); return; }
        setUser(userData);

        const [subjectRes, topicsRes] = await Promise.all([
          fetch(`/api/subjects/${id}`, { credentials: 'include' }),
          fetch(`/api/topics?subjectId=${encodeURIComponent(id)}`, { credentials: 'include' }),
        ]);

        if (subjectRes.status === 403) {
          setForbidden(true);
          setLoading(false);
          return;
        }

        const subjectJson = await subjectRes.json();
        if (!subjectRes.ok || !subjectJson.success || !subjectJson.data) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setSubject(subjectJson.data);

        const topicsJson = await topicsRes.json();
        const topicList: Topic[] = topicsJson.success && Array.isArray(topicsJson.data) ? topicsJson.data : [];
        setTopics(topicList);

        const counts = await Promise.all(
          topicList.map(async (t) => {
            const [notesR, questionsR, videosR] = await Promise.all([
              fetch(`/api/topic-notes?topicId=${encodeURIComponent(t._id)}`, { credentials: 'include' }),
              fetch(`/api/questions?topicId=${encodeURIComponent(t._id)}`, { credentials: 'include' }),
              fetch(`/api/videos?topicId=${encodeURIComponent(t._id)}`, { credentials: 'include' }),
            ]);
            const parse = async (r: Response) => {
              const j = await r.json();
              return j.success && Array.isArray(j.data) ? j.data.length : 0;
            };
            return {
              topicId: t._id,
              counts: {
                notes: await parse(notesR),
                questions: await parse(questionsR),
                videos: await parse(videosR),
              },
            };
          })
        );
        setContentCounts(Object.fromEntries(counts.map((c) => [c.topicId, c.counts])));
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, router]);

  if (loading) {
    return (
      <TeacherShell user={user}>
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-32 mb-6" />
          <div className="h-8 bg-slate-200 rounded w-3/4 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-20 bg-white rounded-xl border border-slate-200" />)}
          </div>
        </div>
      </TeacherShell>
    );
  }

  if (forbidden) {
    return (
      <TeacherShell user={user}>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
          <h1 className="text-xl font-semibold text-slate-900">Access denied</h1>
          <p className="text-slate-600 text-sm mt-2 text-center max-w-md">
            This subject is outside your assigned classes or subjects.
          </p>
          <Link href="/teacher/subjects" className="mt-4 text-sky-600 font-medium hover:underline">Back to Subjects</Link>
        </div>
      </TeacherShell>
    );
  }

  if (notFound || !subject) {
    return (
      <TeacherShell user={user}>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
          <h1 className="text-xl font-semibold text-slate-900">Subject not found</h1>
          <Link href="/teacher/subjects" className="mt-4 text-sky-600 font-medium hover:underline">Back to Subjects</Link>
        </div>
      </TeacherShell>
    );
  }

  const totalNotes = Object.values(contentCounts).reduce((s, c) => s + c.notes, 0);
  const totalQuestions = Object.values(contentCounts).reduce((s, c) => s + c.questions, 0);
  const totalVideos = Object.values(contentCounts).reduce((s, c) => s + c.videos, 0);

  return (
    <TeacherShell user={user}>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-4">
          <Link href="/teacher/dashboard" className="text-sky-600 font-medium hover:underline">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/teacher/subjects" className="text-sky-600 font-medium hover:underline">Subjects</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500">{subject.name}</span>
        </div>

        {/* Subject header */}
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md font-medium">{subject.grade}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md font-medium">{subject.board}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{subject.name}</h1>
        {subject.description && <p className="text-slate-600 text-sm leading-relaxed mb-6">{subject.description}</p>}

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-xl font-bold text-slate-900">{topics.length}</div>
            <div className="text-xs text-slate-500 font-medium">Topics</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-xl font-bold text-slate-900">{totalNotes}</div>
            <div className="text-xs text-slate-500 font-medium">Notes</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-xl font-bold text-slate-900">{totalQuestions}</div>
            <div className="text-xs text-slate-500 font-medium">Questions</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-xl font-bold text-slate-900">{totalVideos}</div>
            <div className="text-xs text-slate-500 font-medium">Videos</div>
          </div>
        </div>

        {/* Topics list */}
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-600" /> Topics
        </h2>

        {topics.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 font-medium">No topics in this subject yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map((topic, idx) => {
              const counts = contentCounts[topic._id] ?? { notes: 0, questions: 0, videos: 0 };
              return (
                <div key={topic._id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-sky-200 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-slate-400 font-medium w-5 flex-shrink-0">{idx + 1}.</span>
                        <h3 className="font-medium text-slate-900 truncate">{topic.topic_name}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 ml-7">
                        {difficultyBadge(topic.difficulty_level)}
                        {topic.estimated_time != null && topic.estimated_time > 0 && (
                          <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                            <Clock className="w-3.5 h-3.5" /> {topic.estimated_time} min
                          </span>
                        )}
                        {topic.status && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            topic.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}>{topic.status}</span>
                        )}
                      </div>
                      {/* Content counts */}
                      <div className="flex flex-wrap gap-4 mt-3 ml-7">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                          <Video className="w-3.5 h-3.5 text-sky-500" />
                          {counts.videos} video{counts.videos !== 1 ? 's' : ''}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                          <FileText className="w-3.5 h-3.5 text-emerald-500" />
                          {counts.notes} note{counts.notes !== 1 ? 's' : ''}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                          {counts.questions} question{counts.questions !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {topic.key_concepts && topic.key_concepts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 ml-7">
                          {topic.key_concepts.slice(0, 5).map((c, i) => (
                            <span key={i} className="text-[11px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">{c}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </TeacherShell>
  );
}
