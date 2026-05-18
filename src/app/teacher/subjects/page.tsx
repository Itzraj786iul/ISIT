'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TeacherShell from '../_components/TeacherShell';
import { BookOpen, ChevronRight, Layers, AlertCircle } from 'lucide-react';

type User = { _id?: string; name: string; role: string; organization_id?: string };
type Subject = { _id: string; name: string; grade: string; board: string; description?: string; status?: string };

export default function TeacherSubjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topicCounts, setTopicCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (!meRes.ok) { router.push('/login'); return; }
        const meData = await meRes.json();
        const userData = meData.user as User;
        if (!userData || userData.role?.toLowerCase() !== 'teacher') { router.push('/dashboard'); return; }
        setUser(userData);

        if (!userData.organization_id) { setError('No organization found.'); setLoading(false); return; }

        const res = await fetch(
          `/api/subjects?organizationId=${encodeURIComponent(userData.organization_id)}`,
          { credentials: 'include' }
        );
        const json = await res.json();
        if (!res.ok || !json.success) { setError(json.error ?? 'Failed to load subjects.'); setLoading(false); return; }

        const subjectList: Subject[] = Array.isArray(json.data) ? json.data : [];
        setSubjects(subjectList);

        const counts = await Promise.all(
          subjectList.map(async (s) => {
            const r = await fetch(`/api/topics?subjectId=${encodeURIComponent(s._id)}`, {
              credentials: 'include',
            });
            const j = await r.json();
            return { id: s._id, count: j.success && Array.isArray(j.data) ? j.data.length : 0 };
          })
        );
        setTopicCounts(Object.fromEntries(counts.map((c) => [c.id, c.count])));
      } catch {
        setError('Failed to load subjects.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [router]);

  return (
    <TeacherShell user={user}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Subjects & Curriculum</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your organization&apos;s subjects and topics</p>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                <div className="h-6 bg-slate-100 rounded w-3/4 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-1/2 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-slate-800 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && subjects.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <BookOpen className="w-12 h-12 text-slate-600 dark:text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-300 font-medium">No subjects available yet.</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Subjects will appear here when they are added.</p>
          </div>
        )}

        {!loading && !error && subjects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <Link
                key={subject._id}
                href={`/teacher/subjects/${subject._id}`}
                className="group block bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-sky-300 hover:shadow-md transition no-underline"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                        <Layers className="w-4 h-4 text-sky-600" />
                      </div>
                      <h2 className="text-base font-semibold text-slate-900 group-hover:text-sky-700 truncate">
                        {subject.name}
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs bg-slate-100 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium">{subject.grade}</span>
                      <span className="text-xs bg-slate-100 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium">{subject.board}</span>
                      {subject.status && (
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                          subject.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>{subject.status}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-semibold">{topicCounts[subject._id] ?? '...'}</span> topics
                    </p>
                    {subject.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{subject.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-sky-500 flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </TeacherShell>
  );
}
