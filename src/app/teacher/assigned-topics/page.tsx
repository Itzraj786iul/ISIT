'use client';

/**
 * Lists topic assignments created by the teacher (or all org assignments for admin).
 * Creation: POST /api/teacher/assign-topic (wire from subject/topic UI later).
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TeacherShell from '../_components/TeacherShell';
import { ClipboardList, BarChart3 } from 'lucide-react';

type User = { _id?: string; name: string; role: string; organization_id?: string };

type AssignmentRow = {
  assignment_id: string;
  topic_id: string;
  topic_name: string;
  subject_name: string;
  class_id: string | null;
  class_name: string | null;
  student_id: string | null;
  student_name: string | null;
  status: string;
  due_date: string | null;
  created_at: string | null;
};

export default function TeacherAssignedTopicsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      const userData = meData.user as User;
      const role = userData?.role?.toLowerCase();
      if (!userData || (role !== 'teacher' && role !== 'admin')) {
        router.push('/dashboard');
        return;
      }
      setUser(userData);

      try {
        const res = await fetch('/api/teacher/assigned-topics', { credentials: 'include' });
        if (res.ok) {
          const j = (await res.json()) as { success?: boolean; data?: AssignmentRow[] };
          if (j.success && Array.isArray(j.data)) setRows(j.data);
        }
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [router]);

  return (
    <TeacherShell user={user}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Assigned topics</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Topics you assigned to a class or an individual student. Students see these on their dashboard and topic
              pages.
            </p>
          </div>
        </div>

        <div className="isit-app-panel rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3 animate-pulse">
              <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
              <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            </div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-slate-600 dark:text-slate-400">
              <p>No assignments yet.</p>
              <p className="mt-2 text-sm">
                Open a subject from{' '}
                <Link href="/teacher/subjects" className="font-semibold text-sky-600 hover:underline">
                  Subjects
                </Link>{' '}
                and use Assign on a topic.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-left text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Topic</th>
                    <th className="px-4 py-3 font-semibold">Subject</th>
                    <th className="px-4 py-3 font-semibold">Audience</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Due</th>
                    <th className="px-4 py-3 font-semibold">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((r) => (
                    <tr key={r.assignment_id} className="text-slate-800 dark:text-slate-200">
                      <td className="px-4 py-3">
                        <Link href={`/topic/${r.topic_id}`} className="font-medium text-sky-600 hover:underline">
                          {r.topic_name || 'Topic'}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{r.subject_name || '—'}</td>
                      <td className="px-4 py-3">
                        {r.class_name ? (
                          <span>Class: {r.class_name}</span>
                        ) : r.student_name ? (
                          <span>Student: {r.student_name}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 capitalize">{r.status?.replace('_', ' ') || '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {r.due_date ? new Date(r.due_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/teacher/assignment-progress/${encodeURIComponent(r.topic_id)}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 px-3 py-1.5 text-xs font-semibold hover:bg-violet-100 dark:hover:bg-violet-950/60 no-underline transition"
                        >
                          <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                          View progress
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </TeacherShell>
  );
}
