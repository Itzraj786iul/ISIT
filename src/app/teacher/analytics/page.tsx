'use client';

/** Includes @legacy MARKETPLACE_LMS course stats (GET /api/courses?teacherId). Complement with topic/session analytics. */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TeacherShell from '../_components/TeacherShell';
import { TrendingUp, Users, BookOpen, Layers, BarChart3 } from 'lucide-react';

type User = { _id?: string; name: string; role: string; organization_id?: string };
type CourseStat = { title: string; students: number; category: string };
type SubjectStat = { name: string; grade: string; topicCount: number };

export default function TeacherAnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [courseStats, setCourseStats] = useState<CourseStat[]>([]);
  const [subjectStats, setSubjectStats] = useState<SubjectStat[]>([]);
  const [loading, setLoading] = useState(true);

  const totalStudents = courseStats.reduce((s, c) => s + c.students, 0);
  const totalTopics = subjectStats.reduce((s, c) => s + c.topicCount, 0);

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

        const uid = userData._id ?? '';
        const fetches: Promise<void>[] = [];

        fetches.push(
          fetch(`/api/courses?teacherId=${encodeURIComponent(uid)}`, { credentials: 'include' })
            .then(async (r) => {
              if (!r.ok) return;
              const courses = await r.json();
              if (Array.isArray(courses)) {
                setCourseStats(courses.map((c: { title: string; enrolledStudents?: unknown[]; category: string }) => ({
                  title: c.title,
                  students: c.enrolledStudents?.length ?? 0,
                  category: c.category,
                })));
              }
            })
        );

        if (userData.organization_id) {
          fetches.push(
            fetch(`/api/subjects?organizationId=${encodeURIComponent(userData.organization_id)}`)
              .then(async (r) => {
                const json = await r.json();
                if (!json.success || !Array.isArray(json.data)) return;
                const subjects = json.data;
                const stats = await Promise.all(
                  subjects.map(async (s: { _id: string; name: string; grade: string }) => {
                    const tr = await fetch(`/api/topics?subjectId=${encodeURIComponent(s._id)}`);
                    const tj = await tr.json();
                    return { name: s.name, grade: s.grade, topicCount: tj.success && Array.isArray(tj.data) ? tj.data.length : 0 };
                  })
                );
                setSubjectStats(stats);
              })
          );
        }

        await Promise.all(fetches);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [router]);

  return (
    <TeacherShell user={user}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Overview of your courses and curriculum</p>

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Total Courses" value={courseStats.length} icon={<BookOpen className="w-5 h-5 text-violet-600" />} />
          <SummaryCard label="Total Students" value={totalStudents} icon={<Users className="w-5 h-5 text-emerald-600" />} />
          <SummaryCard label="Subjects" value={subjectStats.length} icon={<Layers className="w-5 h-5 text-sky-600" />} />
          <SummaryCard label="Total Topics" value={totalTopics} icon={<BarChart3 className="w-5 h-5 text-amber-600" />} />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="isit-app-panel rounded-xl p-6 animate-pulse">
                <div className="h-5 bg-slate-100 rounded w-1/3 mb-4" />
                <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Course Performance */}
            <section className="isit-app-panel rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-violet-600" /> Course Enrollment
                </h2>
              </div>
              <div className="p-5">
                {courseStats.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-4">No courses yet.</p>
                ) : (
                  <div className="space-y-3">
                    {courseStats.map((c, i) => {
                      const maxStudents = Math.max(...courseStats.map((cs) => cs.students), 1);
                      const pct = Math.round((c.students / maxStudents) * 100);
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-800 truncate flex-1">{c.title}</span>
                            <span className="text-sm text-slate-600 dark:text-slate-300 ml-2 flex-shrink-0">{c.students} students</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Curriculum Overview */}
            <section className="isit-app-panel rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-sky-600" /> Curriculum Coverage
                </h2>
              </div>
              <div className="p-5">
                {subjectStats.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-4">No subjects yet.</p>
                ) : (
                  <div className="space-y-3">
                    {subjectStats.map((s, i) => {
                      const maxTopics = Math.max(...subjectStats.map((ss) => ss.topicCount), 1);
                      const pct = Math.round((s.topicCount / maxTopics) * 100);
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-800 truncate flex-1">
                              {s.name} <span className="text-xs text-slate-400 font-normal">({s.grade})</span>
                            </span>
                            <span className="text-sm text-slate-600 dark:text-slate-300 ml-2 flex-shrink-0">{s.topicCount} topics</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </TeacherShell>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="isit-app-panel rounded-xl p-5 flex items-center gap-4 shadow-sm">
      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">{icon}</div>
      <div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</div>
        <div className="text-xl font-bold text-slate-900">{value}</div>
      </div>
    </div>
  );
}
