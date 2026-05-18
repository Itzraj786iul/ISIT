'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TeacherShell from '@/app/teacher/_components/TeacherShell';
import { fetchWithAuth } from '@/lib/api-client';
import { Plus, Trash2, Loader2, ChevronRight, BookOpen, Users } from 'lucide-react';

type User = {
  _id?: string;
  name: string;
  role: string;
  organization_id?: string;
  assigned_classes?: { _id?: string; name?: string }[];
  assigned_subjects?: { _id?: string; name?: string }[];
};
type ClassRow = { _id: string; name: string };
type SubjectRow = { _id: string; name: string; class_id?: string };
type TeacherRow = {
  _id: string;
  email: string;
  name?: string;
  assigned_classes?: { _id?: string; name?: string }[];
  assigned_subjects?: { _id?: string; name?: string }[];
};

function joinRefNames(refs: TeacherRow['assigned_classes'] | undefined): string {
  if (!Array.isArray(refs) || refs.length === 0) return '—';
  const names = refs.map((r) => (r && typeof r.name === 'string' ? r.name : null)).filter(Boolean) as string[];
  return names.length ? names.join(', ') : '—';
}

function studentClassName(row: { class_id?: { _id?: string; name?: string } | string | null }): string {
  const cls = row.class_id;
  if (!cls) return '—';
  if (typeof cls === 'object' && cls && typeof cls.name === 'string') return cls.name;
  return '—';
}

type OrgGate = 'loading' | 'allowed' | 'denied' | 'unauth';

export default function OrganizationPage() {
  const router = useRouter();
  const [gate, setGate] = useState<OrgGate>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [allOrgSubjects, setAllOrgSubjects] = useState<SubjectRow[]>([]);
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [teacherDisplayName, setTeacherDisplayName] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  type StudentRow = {
    _id: string;
    email: string;
    name?: string;
    class_id?: { _id?: string; name?: string } | string | null;
    email_verified?: boolean;
  };
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentClassId, setStudentClassId] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [enrollNotice, setEnrollNotice] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const res = await fetchWithAuth('/api/students');
      const json = (await res.json()) as { success?: boolean; data?: StudentRow[] };
      if (res.ok && json.success && Array.isArray(json.data)) setStudents(json.data);
      else setStudents([]);
    } catch {
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const loadTeachers = useCallback(async () => {
    setLoadingTeachers(true);
    try {
      const res = await fetchWithAuth('/api/teachers');
      const json = (await res.json()) as { success?: boolean; data?: TeacherRow[]; error?: string };
      if (!res.ok) throw new Error(json.error || 'Failed to load teachers');
      setTeachers(Array.isArray(json.data) ? json.data : []);
    } catch {
      setTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  const loadClasses = useCallback(async () => {
    setLoadingClasses(true);
    setError('');
    try {
      const res = await fetchWithAuth('/api/classes');
      const json = (await res.json()) as { success?: boolean; data?: ClassRow[]; error?: string };
      if (!res.ok) throw new Error(json.error || 'Failed to load classes');
      setClasses(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load classes');
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const loadSubjects = useCallback(async (classId: string) => {
    setLoadingSubjects(true);
    setError('');
    try {
      const res = await fetchWithAuth(`/api/subjects?class_id=${encodeURIComponent(classId)}`);
      const json = (await res.json()) as { success?: boolean; data?: SubjectRow[]; error?: string };
      if (!res.ok) throw new Error(json.error || 'Failed to load subjects');
      setSubjects(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load subjects');
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!meRes.ok) {
        setGate('unauth');
        router.push(`/login?returnUrl=${encodeURIComponent('/organization')}`);
        return;
      }
      const meData = await meRes.json();
      const userData = meData.user as User;
      const r = (userData?.role ?? '').toString().trim().toLowerCase();
      if (!userData || (r !== 'teacher' && r !== 'admin')) {
        setGate('denied');
        setUser(null);
        return;
      }
      setUser(userData);
      setGate('allowed');
    };
    run();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    loadClasses();
    loadTeachers();
    loadStudents();
  }, [user, loadClasses, loadTeachers, loadStudents]);

  const enrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy('enroll-student');
    setError('');
    setEnrollNotice(null);
    try {
      const res = await fetchWithAuth('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentName.trim(),
          email: studentEmail.trim(),
          class_id: studentClassId || undefined,
          grade: studentGrade.trim() || undefined,
        }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        error?: string;
        data?: { temporaryPassword?: string };
      };
      if (!res.ok || !json.success) throw new Error(json.error || 'Could not enroll student');
      if (json.data?.temporaryPassword) {
        setEnrollNotice(`Student enrolled. Temporary password: ${json.data.temporaryPassword} — share securely.`);
      } else {
        setEnrollNotice('Student enrolled successfully.');
      }
      setStudentName('');
      setStudentEmail('');
      setStudentGrade('');
      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not enroll student');
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    const oid = user?.organization_id;
    if (!oid) return;
    const run = async () => {
      try {
        const res = await fetch(`/api/subjects?organizationId=${encodeURIComponent(oid)}`, {
          credentials: 'include',
        });
        const json = (await res.json()) as { success?: boolean; data?: SubjectRow[] };
        if (json.success && Array.isArray(json.data)) setAllOrgSubjects(json.data);
        else setAllOrgSubjects([]);
      } catch {
        setAllOrgSubjects([]);
      }
    };
    run();
  }, [user?.organization_id]);

  useEffect(() => {
    if (!selectedClassId) {
      setSubjects([]);
      return;
    }
    loadSubjects(selectedClassId);
  }, [selectedClassId, loadSubjects]);

  useEffect(() => {
    if (classes.length === 0) {
      setSelectedClassId(null);
      return;
    }
    setSelectedClassId((prev) => (prev && classes.some((c) => c._id === prev) ? prev : classes[0]._id));
  }, [classes]);

  const addClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newClassName.trim();
    if (!name) return;
    setBusy('class-add');
    setError('');
    try {
      const res = await fetchWithAuth('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error || 'Could not create class');
      setNewClassName('');
      await loadClasses();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create class');
    } finally {
      setBusy(null);
    }
  };

  const deleteClass = async (id: string) => {
    if (!confirm('Delete this class? Subjects must be removed first.')) return;
    setBusy(`class-${id}`);
    setError('');
    try {
      const res = await fetchWithAuth(`/api/classes/${id}`, { method: 'DELETE' });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error || 'Could not delete class');
      if (selectedClassId === id) setSelectedClassId(null);
      await loadClasses();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete class');
    } finally {
      setBusy(null);
    }
  };

  const addSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;
    const name = newSubjectName.trim();
    if (!name) return;
    setBusy('subject-add');
    setError('');
    try {
      const res = await fetchWithAuth('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, class_id: selectedClassId }),
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error || 'Could not create subject');
      setNewSubjectName('');
      await loadSubjects(selectedClassId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create subject');
    } finally {
      setBusy(null);
    }
  };

  const deleteSubject = async (id: string) => {
    if (!confirm('Delete this subject? Remove all topics first.')) return;
    setBusy(`sub-${id}`);
    setError('');
    try {
      const res = await fetchWithAuth(`/api/subjects/${id}`, { method: 'DELETE' });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error || 'Could not delete subject');
      if (selectedClassId) await loadSubjects(selectedClassId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete subject');
    } finally {
      setBusy(null);
    }
  };

  const selectedClass = classes.find((c) => c._id === selectedClassId) ?? null;

  const toggleClassForTeacher = (id: string) => {
    setSelectedClassIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleSubjectForTeacher = (id: string) => {
    setSelectedSubjectIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const addTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = teacherEmail.trim();
    const password = teacherPassword;
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setBusy('teacher-add');
    setError('');
    try {
      const res = await fetchWithAuth('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: teacherDisplayName.trim() || undefined,
          class_ids: selectedClassIds,
          subject_ids: selectedSubjectIds,
        }),
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error || 'Could not create teacher');
      setTeacherEmail('');
      setTeacherPassword('');
      setTeacherDisplayName('');
      setSelectedClassIds([]);
      setSelectedSubjectIds([]);
      await loadTeachers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create teacher');
    } finally {
      setBusy(null);
    }
  };

  const deleteTeacherAccount = async (id: string) => {
    if (!confirm('Delete this teacher account? This cannot be undone.')) return;
    setBusy(`teacher-${id}`);
    setError('');
    try {
      const res = await fetchWithAuth(`/api/teachers/${id}`, { method: 'DELETE' });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error || 'Could not delete teacher');
      await loadTeachers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete teacher');
    } finally {
      setBusy(null);
    }
  };

  if (gate === 'loading' || gate === 'unauth') {
    return (
      <div className="isit-app-bg min-h-screen flex items-center justify-center relative">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" aria-hidden />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (gate === 'denied') {
    return (
      <div className="isit-app-bg min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
        <div className="max-w-md w-full isit-glass rounded-2xl p-8 text-center">
          <h1 className="text-xl font-bold isit-text-primary">Organization admin</h1>
          <p className="/80 text-sm mt-3 leading-relaxed">
            This area is for <strong className="isit-body">teachers</strong> and{' '}
            <strong className="isit-body">organization administrators</strong> only. Your
            current account does not have access.
          </p>
          <p className="text-slate-600 dark:text-cyan-200/60 text-xs mt-4 leading-relaxed">
            Teachers are created by an admin in the organization console. If you should have access, ask your school
            admin or sign in with a teacher or admin account.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
            <Link
              href="/dashboard"
              className="btn-primary min-h-11 px-6 no-underline inline-flex items-center justify-center"
            >
              Back to dashboard
            </Link>
            <Link
              href="/login?returnUrl=%2Forganization"
              className="btn-secondary min-h-11 px-6 no-underline inline-flex items-center justify-center"
            >
              Switch account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  return (
    <TeacherShell user={user}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Organization</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Classes, students, and curriculum for your school</p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl dark:bg-red-950/40 dark:text-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {enrollNotice && (
          <div className="mb-4 p-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800">
            {enrollNotice}
          </div>
        )}

        {user?.role?.toLowerCase() === 'teacher' && (
          <div className="mb-6 p-4 rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">Your scope</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Assigned classes
                </p>
                <p className="text-slate-800 dark:text-slate-200">{joinRefNames(user.assigned_classes)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Assigned subjects
                </p>
                <p className="text-slate-800 dark:text-slate-200">{joinRefNames(user.assigned_subjects)}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              Curriculum and student data are limited to these assignments. Ask an admin to update them if needed.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-bold text-slate-800 dark:text-slate-100">Classes</h2>
            </div>
            <div className="p-4 space-y-3">
              {isAdmin && (
              <form onSubmit={addClass} className="flex gap-2">
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="New class name"
                  className="flex-1 min-w-0 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={busy !== null || !newClassName.trim()}
                  className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-sky-600 text-white px-3 py-2 text-sm font-semibold hover:bg-sky-700 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>
              )}

              {loadingClasses ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                </div>
              ) : classes.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-4">No classes yet. Add one above.</p>
              ) : (
                <ul className="space-y-1">
                  {classes.map((c) => {
                    const active = c._id === selectedClassId;
                    return (
                      <li key={c._id}>
                        <div
                          className={`flex items-center gap-2 rounded-xl border transition ${
                            active
                              ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50'
                              : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedClassId(c._id)}
                            className="flex-1 min-w-0 text-left px-3 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2"
                          >
                            <ChevronRight className={`w-4 h-4 shrink-0 ${active ? 'text-sky-600' : 'text-slate-400'}`} />
                            <span className="truncate">{c.name}</span>
                          </button>
{isAdmin && (
                          <button
                            type="button"
                            onClick={() => deleteClass(c._id)}
                            disabled={busy !== null}
                            className="shrink-0 p-2 mr-1 text-slate-400 hover:text-red-600 rounded-lg"
                            aria-label={`Delete ${c.name}`}
                          >
                            {busy === `class-${c._id}` ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
              <h2 className="font-bold text-slate-800 dark:text-slate-100">
                Subjects {selectedClass ? `— ${selectedClass.name}` : ''}
              </h2>
              {selectedClassId && (
                <Link
                  href={`/teacher/subjects`}
                  className="text-xs font-semibold text-sky-600 hover:underline shrink-0"
                >
                  Open subjects hub
                </Link>
              )}
            </div>
            <div className="p-4 space-y-3">
              {!selectedClassId ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-4">Select a class to manage subjects.</p>
              ) : (
                <>
                  <form onSubmit={addSubject} className="flex gap-2">
                    <input
                      type="text"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      placeholder="New subject name"
                      className="flex-1 min-w-0 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={busy !== null || !newSubjectName.trim()}
                      className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-emerald-600 text-white px-3 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </form>

                  {loadingSubjects ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                    </div>
                  ) : subjects.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 py-4">No subjects in this class yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {subjects.map((s) => (
                        <li
                          key={s._id}
                          className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 dark:border-slate-700 px-3 py-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <BookOpen className="w-4 h-4 text-sky-500 shrink-0" />
                            <Link
                              href={`/subject/${s._id}`}
                              className="text-sm font-medium text-slate-800 dark:text-slate-100 hover:text-sky-600 truncate"
                            >
                              {s.name}
                            </Link>
                          </div>
{isAdmin && (
                          <button
                            type="button"
                            onClick={() => deleteSubject(s._id)}
                            disabled={busy !== null}
                            className="shrink-0 p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                            aria-label={`Delete ${s.name}`}
                          >
                            {busy === `sub-${s._id}` ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Students */}
        <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Students</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-auto">{students.length} enrolled</span>
          </div>
          <div className="p-4">
            {isAdmin && (
              <form onSubmit={enrollStudent} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Full name"
                  className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  required
                />
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="off"
                  className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  required
                />
                <select
                  value={studentClassId}
                  onChange={(e) => setStudentClassId(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                >
                  <option value="">Class (optional)</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={studentGrade}
                  onChange={(e) => setStudentGrade(e.target.value)}
                  placeholder="Grade (optional)"
                  className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={busy !== null}
                  className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {busy === 'enroll-student' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Enroll student
                </button>
              </form>
            )}
            {!isAdmin && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Only organization administrators can enroll new students. You can view enrolled learners below.
              </p>
            )}
            {loadingStudents ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4">No students enrolled yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((s) => (
                  <li key={s._id} className="py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{s.name || s.email}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{s.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-600 dark:text-slate-400">{studentClassName(s)}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${s.email_verified ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'}`}
                      >
                        {s.email_verified ? 'Verified' : 'Pending verify'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Teachers */}
        <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-500" />
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Teachers</h2>
          </div>

          <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-8">
            {isAdmin && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Add teacher</h3>
              <form onSubmit={addTeacher} className="space-y-3">
                <input
                  type="email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="off"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  required
                />
                <input
                  type="password"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  placeholder="Temporary password"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  required
                />
                <input
                  type="text"
                  value={teacherDisplayName}
                  onChange={(e) => setTeacherDisplayName(e.target.value)}
                  placeholder="Display name (optional)"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                />

                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Classes</p>
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-600 p-2 space-y-1.5">
                    {classes.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400">Create classes first.</p>
                    ) : (
                      classes.map((c) => (
                        <label key={c._id} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedClassIds.includes(c._id)}
                            onChange={() => toggleClassForTeacher(c._id)}
                            className="rounded border-slate-300 text-violet-600"
                          />
                          <span className="text-slate-800 dark:text-slate-200">{c.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Subjects</p>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-600 p-2 space-y-1.5">
                    {allOrgSubjects.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400">No subjects in this organization yet.</p>
                    ) : (
                      allOrgSubjects.map((s) => (
                        <label key={s._id} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedSubjectIds.includes(s._id)}
                            onChange={() => toggleSubjectForTeacher(s._id)}
                            className="rounded border-slate-300 text-violet-600"
                          />
                          <span className="text-slate-800 dark:text-slate-200 truncate">{s.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy !== null}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1 rounded-xl bg-violet-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-violet-700 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Create teacher
                </button>
              </form>
            </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Team</h3>
              {loadingTeachers ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                </div>
              ) : teachers.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No teachers yet.</p>
              ) : (
                <ul className="space-y-3">
                  {teachers.map((t) => {
                    const isSelf = user?._id && t._id === user._id;
                    return (
                      <li
                        key={t._id}
                        className="rounded-xl border border-slate-100 dark:border-slate-700 p-3 text-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                              {t.name || t.email}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs break-all">{t.email}</p>
                            <p className="mt-2 text-slate-600 dark:text-slate-400 text-xs">
                              <span className="font-medium text-slate-700 dark:text-slate-300">Classes: </span>
                              {joinRefNames(t.assigned_classes)}
                            </p>
                            <p className="mt-1 text-slate-600 dark:text-slate-400 text-xs">
                              <span className="font-medium text-slate-700 dark:text-slate-300">Subjects: </span>
                              {joinRefNames(t.assigned_subjects)}
                            </p>
                          </div>
                          {isAdmin && !isSelf && (
                            <button
                              type="button"
                              onClick={() => deleteTeacherAccount(t._id)}
                              disabled={busy !== null}
                              className="shrink-0 p-2 text-slate-400 hover:text-red-600 rounded-lg"
                              aria-label={`Delete ${t.email}`}
                            >
                              {busy === `teacher-${t._id}` ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </TeacherShell>
  );
}
