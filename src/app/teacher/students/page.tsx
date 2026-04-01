'use client';

/** Uses @legacy MARKETPLACE_LMS courses to list enrollees. Future: org-wide students + topic progress. */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TeacherShell from '../_components/TeacherShell';
import { Users, BookOpen, GraduationCap } from 'lucide-react';

type User = { _id?: string; name: string; role: string; organization_id?: string };
type StudentRow = {
  _id: string;
  name: string;
  email: string;
  enrolledCourses: number;
};

export default function TeacherStudentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

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
        const coursesRes = await fetch(`/api/courses?teacherId=${encodeURIComponent(uid)}`, { credentials: 'include' });
        if (!coursesRes.ok) { setLoading(false); return; }
        const courses = await coursesRes.json();

        const studentMap = new Map<string, { name: string; email: string; courses: number }>();
        if (Array.isArray(courses)) {
          for (const course of courses) {
            if (Array.isArray(course.enrolledStudents)) {
              for (const s of course.enrolledStudents) {
                const sid = typeof s === 'object' && s?._id ? String(s._id) : String(s);
                const existing = studentMap.get(sid);
                if (existing) {
                  existing.courses++;
                } else {
                  const name = typeof s === 'object' && s?.name ? s.name : 'Student';
                  const email = typeof s === 'object' && s?.email ? s.email : '';
                  studentMap.set(sid, { name, email, courses: 1 });
                }
              }
            }
          }
        }

        setStudents(
          Array.from(studentMap.entries()).map(([id, data]) => ({
            _id: id,
            name: data.name,
            email: data.email,
            enrolledCourses: data.courses,
          }))
        );
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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Students</h1>
        <p className="text-slate-500 text-sm mb-6">Students enrolled in your courses</p>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-slate-500 text-sm">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No students enrolled yet</p>
              <p className="text-slate-500 text-sm mt-1">Students will appear here when they enroll in your courses.</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                <p className="text-sm font-medium text-slate-600">{students.length} student{students.length !== 1 ? 's' : ''} total</p>
              </div>
              <div className="divide-y divide-slate-100">
                {students.map((student) => (
                  <div key={student._id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition">
                    <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 text-sm truncate">{student.name}</p>
                      {student.email && <p className="text-xs text-slate-500 truncate">{student.email}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      <span>{student.enrolledCourses} course{student.enrolledCourses !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </TeacherShell>
  );
}
