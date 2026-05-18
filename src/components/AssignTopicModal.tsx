'use client';

import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';

type ClassRow = { _id: string; name: string };
type StudentRow = { _id: string; name?: string; email: string };

type AssignTopicModalProps = {
  open: boolean;
  onClose: () => void;
  topicId: string;
  topicName?: string;
  onSuccess?: () => void;
};

export default function AssignTopicModal({ open, onClose, topicId, topicName, onSuccess }: AssignTopicModalProps) {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [target, setTarget] = useState<'class' | 'student'>('class');
  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    const load = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          fetchWithAuth('/api/classes'),
          fetchWithAuth('/api/students'),
        ]);
        const cJson = (await cRes.json()) as { success?: boolean; data?: ClassRow[] };
        const sJson = (await sRes.json()) as { success?: boolean; data?: StudentRow[] };
        if (cRes.ok && cJson.success && Array.isArray(cJson.data)) {
          setClasses(cJson.data);
          if (cJson.data[0]) setClassId(cJson.data[0]._id);
        }
        if (sRes.ok && sJson.success && Array.isArray(sJson.data)) {
          setStudents(sJson.data);
          if (sJson.data[0]) setStudentId(sJson.data[0]._id);
        }
      } catch {
        setError('Could not load classes or students.');
      }
    };
    void load();
  }, [open]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, string> = { topic_id: topicId };
      if (target === 'class') {
        if (!classId) throw new Error('Select a class');
        body.class_id = classId;
      } else {
        if (!studentId) throw new Error('Select a student');
        body.student_id = studentId;
      }
      if (dueDate) body.due_date = new Date(dueDate).toISOString();

      const res = await fetchWithAuth('/api/teacher/assign-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Assignment failed');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-topic-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-white dark:bg-slate-950 p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 id="assign-topic-title" className="text-lg font-bold text-slate-900 dark:text-white">
              Assign topic
            </h2>
            {topicName && <p className="mt-1 text-sm text-slate-400">{topicName}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-white/10" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTarget('class')}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold ${target === 'class' ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40' : 'border border-white/10 text-slate-400'}`}
            >
              Whole class
            </button>
            <button
              type="button"
              onClick={() => setTarget('student')}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold ${target === 'student' ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40' : 'border border-white/10 text-slate-400'}`}
            >
              One student
            </button>
          </div>

          {target === 'class' ? (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Class</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              >
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Student</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              >
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name || s.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Due date (optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            />
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="isit-btn-primary w-full min-h-11 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Assigning…
              </span>
            ) : (
              'Assign topic'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
