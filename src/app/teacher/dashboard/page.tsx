'use client';

/**
 * @legacy MARKETPLACE_LMS — Teacher manages paid `Course` rows (list/delete via /api/courses, /api/course).
 * AI-first teacher work: /teacher/subjects (curriculum). See docs/AI_FIRST_MIGRATION.md
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  ChevronRight,
  Layers,
  Sparkles,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import TeacherShell from '../_components/TeacherShell';
import { useRequireAuth } from '@/lib/use-require-auth';

type User = { _id?: string; name: string; role: string; organization_id?: string };
type ApiCourse = {
  _id: string;
  title: string;
  category: string;
  price: number;
  enrolledStudents?: string[];
  lessons?: { _id: string }[];
  createdAt?: string;
};
type SubjectItem = { _id: string; name: string; grade: string; board: string; description?: string };

type InsightStudent = {
  student_id: string;
  name: string;
  avg_mastery: number;
  weak_topics: { topic_id: string; topic_name: string; mastery_score: number }[];
  recent_sessions_count: number;
  confusion_score: number;
  engagement_score: number;
  needs_attention: boolean;
};

type InsightsPayload = {
  overview: { avg_mastery_pct: number; total_students: number; students_struggling: number };
  students: InsightStudent[];
  alerts: string[];
};

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [insights, setInsights] = useState<InsightsPayload | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [filterGrade, setFilterGrade] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');

  const totalStudents = courses.reduce((sum, c) => sum + (c.enrolledStudents?.length ?? 0), 0);
  const gradeOptions = [...new Set(subjects.map((s) => s.grade))].sort();

  const { user: authUser, loading: authLoading } = useRequireAuth({ roles: ['teacher'] });

  useEffect(() => {
    if (authLoading || !authUser) return;
    const userData = authUser as User;
    setUser(userData);

    const run = async () => {
      try {
        const uid = userData._id ?? '';
        const fetches: Promise<void>[] = [
          fetch(`/api/courses?teacherId=${encodeURIComponent(uid)}`, { credentials: 'include' })
            .then(async (r) => { if (r.ok) setCourses(await r.json()); }),
        ];

        if (userData.organization_id) {
          fetches.push(
            fetch(`/api/subjects?organizationId=${encodeURIComponent(userData.organization_id)}`, { credentials: 'include' })
              .then(async (r) => {
                const json = await r.json();
                if (json.success && Array.isArray(json.data)) setSubjects(json.data);
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
  }, [authUser, authLoading, router]);

  useEffect(() => {
    if (!user?.organization_id) {
      setInsights(null);
      setInsightsLoading(false);
      return;
    }
    const run = async () => {
      setInsightsLoading(true);
      try {
        const params = new URLSearchParams();
        if (filterSubjectId) params.set('subjectId', filterSubjectId);
        else if (filterGrade) params.set('grade', filterGrade);
        const qs = params.toString();
        const res = await fetch(`/api/teacher/student-insights${qs ? `?${qs}` : ''}`, { credentials: 'include' });
        const json = await res.json();
        if (json.success && json.data) {
          setInsights({
            overview: json.data.overview,
            students: json.data.students,
            alerts: json.data.alerts || [],
          });
        } else {
          setInsights(null);
        }
      } catch (e) {
        console.error(e);
        setInsights(null);
      } finally {
        setInsightsLoading(false);
      }
    };
    run();
  }, [user?.organization_id, filterGrade, filterSubjectId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course? This will remove all lessons.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/course/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) setCourses((prev) => prev.filter((c) => c._id !== id));
      else alert('Failed to delete course.');
    } catch { alert('Failed to delete course.'); }
    finally { setDeletingId(null); }
  };

  return (
    <TeacherShell user={user}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Instructor Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Welcome back, {user?.name || 'Instructor'}</p>
        </div>
        <Link
          href="/teacher/create-course"
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition no-underline"
        >
          <Plus className="w-4 h-4" /> Create Course
        </Link>
      </div>

      {/* AI student insights */}
      <section className="isit-app-panel mb-8 rounded-2xl p-6 shadow-sm ring-1 ring-violet-200/50 dark:ring-violet-500/20">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Student insights</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Who needs help and where — from mastery, sessions, and confusion signals</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium sr-only" htmlFor="insight-grade">Grade</label>
            <select
              id="insight-grade"
              className="isit-input text-sm min-w-[8rem] py-2 px-3"
              value={filterGrade}
              disabled={!!filterSubjectId}
              onChange={(e) => setFilterGrade(e.target.value)}
              title={filterSubjectId ? 'Clear subject to filter by grade' : 'Filter by grade'}
            >
              <option value="">All grades</option>
              {gradeOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium sr-only" htmlFor="insight-subject">Subject</label>
            <select
              id="insight-subject"
              className="isit-input text-sm min-w-[10rem] py-2 px-3"
              value={filterSubjectId}
              onChange={(e) => {
                setFilterSubjectId(e.target.value);
                if (e.target.value) setFilterGrade('');
              }}
            >
              <option value="">All subjects</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.grade})</option>
              ))}
            </select>
          </div>
        </div>

        {insightsLoading ? (
          <div className="text-sm text-slate-500 dark:text-slate-400 py-6">Loading insights…</div>
        ) : insights ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="isit-app-panel rounded-xl p-4">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Avg mastery</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{insights.overview.avg_mastery_pct}%</div>
                <div className="text-xs text-slate-400 mt-1">Across students in this view</div>
              </div>
              <div className="isit-app-panel rounded-xl p-4">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Students</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{insights.overview.total_students}</div>
                <div className="text-xs text-slate-400 mt-1">Active in your organization</div>
              </div>
              <div className="isit-app-panel rounded-xl p-4">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Struggling</div>
                <div className="text-2xl font-bold text-amber-700 mt-1">{insights.overview.students_struggling}</div>
                <div className="text-xs text-slate-400 mt-1">Low mastery or multiple weak topics</div>
              </div>
            </div>

            {insights.alerts.length > 0 && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-800/60 dark:bg-amber-950/40">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold text-sm mb-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> Alerts
                </div>
                <ul className="space-y-1.5 text-sm text-amber-950/90 dark:text-amber-100/90">
                  {insights.alerts.map((a, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-amber-600">•</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insights.students.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-2">No students or no curriculum topics match these filters yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {insights.students.map((stu) => (
                  <div
                    key={stu.student_id}
                    className={`isit-app-panel rounded-xl p-4 ${stu.needs_attention ? 'border-amber-300 ring-1 ring-amber-200/60' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{stu.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mastery {stu.avg_mastery}%</div>
                      </div>
                      {stu.needs_attention && (
                        <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-800 px-2 py-1 rounded-md whitespace-nowrap">
                          Needs attention
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex gap-3 text-xs text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1" title="Sessions (last 30 days)">
                        <Activity className="w-3.5 h-3.5 text-sky-600" />
                        {stu.recent_sessions_count} sessions
                      </span>
                      <span title="Confusion signal strength">Confusion {stu.confusion_score}</span>
                      <span title="Engagement from sessions + events">Engagement {stu.engagement_score}</span>
                    </div>
                    <div className="mt-3">
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Weak topics</div>
                      {stu.weak_topics.length === 0 ? (
                        <p className="text-xs text-slate-400 mt-1">None flagged in this view</p>
                      ) : (
                        <ul className="mt-1 space-y-1">
                          {stu.weak_topics.map((t) => (
                            <li key={t.topic_id} className="text-sm text-slate-700 dark:text-slate-300">
                              {t.topic_name}
                              {t.mastery_score > 0 && (
                                <span className="text-slate-400 text-xs ml-1">({t.mastery_score}%)</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">Insights unavailable. Try again later.</p>
        )}
      </section>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Subjects" value={subjects.length} icon={<Layers className="w-5 h-5 text-sky-600" />} color="sky" />
        <StatCard label="Courses" value={courses.length} icon={<BookOpen className="w-5 h-5 text-violet-600" />} color="violet" />
        <StatCard label="Students" value={totalStudents} icon={<Users className="w-5 h-5 text-emerald-600" />} color="emerald" />
        <StatCard label="Revenue" value={`\u20B9${courses.reduce((sum, c) => sum + (c.price || 0) * (c.enrolledStudents?.length || 0), 0)}`} icon={<TrendingUp className="w-5 h-5 text-amber-600" />} color="amber" />
      </div>

      {/* Subjects Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600" /> Curriculum Subjects
          </h2>
          <Link href="/teacher/subjects" className="text-sky-600 text-sm font-medium hover:underline inline-flex items-center gap-1">
            Manage <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="isit-app-panel rounded-xl p-5 animate-pulse">
                <div className="h-5 bg-slate-100 rounded w-2/3 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : subjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((s) => (
              <Link
                key={s._id}
                href={`/teacher/subjects/${s._id}`}
                className="group block isit-app-panel rounded-xl p-5 shadow-sm hover:border-sky-300 hover:shadow-md transition no-underline"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-400">{s.name}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-slate-100 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium">{s.grade}</span>
                      <span className="text-xs bg-slate-100 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium">{s.board}</span>
                    </div>
                    {s.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{s.description}</p>}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-sky-500 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="isit-app-panel rounded-xl p-8 text-center">
            <Layers className="w-10 h-10 text-slate-600 dark:text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">No subjects in your organization yet.</p>
          </div>
        )}
      </section>

      {/* Courses Table */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-600" /> My Courses
          </h2>
          <Link href="/teacher/create-course" className="text-sky-600 text-sm font-medium hover:underline inline-flex items-center gap-1">
            New course <Plus className="w-4 h-4" />
          </Link>
        </div>
        <div className="isit-app-panel rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-slate-500 dark:text-slate-400 text-sm">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen className="w-10 h-10 text-slate-600 dark:text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">No courses yet. Create your first course to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-left">
                    <th className="px-5 py-3 text-slate-500 dark:text-slate-400 font-semibold">Course</th>
                    <th className="px-5 py-3 text-slate-500 dark:text-slate-400 font-semibold">Category</th>
                    <th className="px-5 py-3 text-slate-500 dark:text-slate-400 font-semibold">Price</th>
                    <th className="px-5 py-3 text-slate-500 dark:text-slate-400 font-semibold">Students</th>
                    <th className="px-5 py-3 text-slate-500 dark:text-slate-400 font-semibold">Status</th>
                    <th className="px-5 py-3 text-slate-500 dark:text-slate-400 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => {
                    const students = course.enrolledStudents?.length ?? 0;
                    const date = course.createdAt
                      ? new Date(course.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '';
                    return (
                      <tr key={course._id} className="border-b border-slate-50 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/40">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-800">{course.title}</div>
                          {date && <div className="text-xs text-slate-400 mt-0.5">Created {date}</div>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs bg-slate-100 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md font-medium">{course.category}</span>
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-900">
                          {course.price === 0 ? 'Free' : `₹${course.price}`}
                        </td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{students}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${(course.lessons?.length ?? 0) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {(course.lessons?.length ?? 0) > 0 ? 'Active' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <Link
                              href={`/teacher/course/${course._id}/edit`}
                              className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 transition"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                            </Link>
                            <button
                              onClick={() => handleDelete(course._id)}
                              disabled={deletingId === course._id}
                              className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 transition disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </TeacherShell>
  );
}

const COLOR_MAP: Record<string, string> = {
  sky: 'bg-sky-100',
  violet: 'bg-violet-100',
  emerald: 'bg-emerald-100',
  amber: 'bg-amber-100',
};

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="isit-app-panel rounded-xl p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl ${COLOR_MAP[color] || 'bg-slate-100'} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
      </div>
    </div>
  );
}
