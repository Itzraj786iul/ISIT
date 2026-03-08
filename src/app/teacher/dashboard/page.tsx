'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  MoreVertical, 
  Plus, 
  Edit, 
  Trash2,
  TrendingUp,
  Star
} from 'lucide-react';

type User = {
  _id?: string;
  id?: string;
  name: string;
  role: string;
};

type ApiCourse = {
  _id: string;
  title: string;
  category: string;
  price: number;
  enrolledStudents?: unknown[];
  createdAt?: string;
};

export default function TeacherDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalStudents = courses.reduce((sum, c) => sum + (c.enrolledStudents?.length ?? 0), 0);
  const stats = {
    totalRevenue: 0, // Could be extended with payments later
    totalStudents,
    courseRating: 0,
    activeCourses: courses.length
  };

  useEffect(() => {
    const run = async () => {
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      const userData = meData.user as User;
      if (!userData || userData.role?.toLowerCase() !== 'teacher') {
        router.push('/dashboard');
        return;
      }
      setUser(userData);

      setLoading(true);
      try {
        const uid = userData._id ?? (userData as unknown as { id?: string }).id ?? '';
        const res = await fetch(`/api/courses?teacherId=${encodeURIComponent(uid)}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course? This will remove all lessons.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/course/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) setCourses((prev) => prev.filter((c) => c._id !== id));
      else alert('Failed to delete course.');
    } catch (e) {
      console.error(e);
      alert('Failed to delete course.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'DM Sans', sans-serif", display: 'flex' }}>
      
      {/* SIDEBAR */}
      <aside style={{
        width: 250, background: '#fff', borderRight: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column', padding: '20px 0',
        position: 'fixed', height: '100vh', top: 0, zIndex: 10
      }}>
        <div style={{ padding: '0 24px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: '#3b82f6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>I</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#0f172a' }}>ISIT Instructor</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Link href="/teacher/dashboard" style={{ textDecoration: 'none' }}>
            <NavItem icon={<BookOpen size={18} />} label="Dashboard" active={pathname === '/teacher/dashboard'} />
          </Link>
          <Link href="/teacher/students" style={{ textDecoration: 'none' }}>
            <NavItem icon={<Users size={18} />} label="Students" active={pathname === '/teacher/students'} />
          </Link>
          <Link href="/teacher/earnings" style={{ textDecoration: 'none' }}>
            <NavItem icon={<DollarSign size={18} />} label="Earnings" active={pathname === '/teacher/earnings'} />
          </Link>
          <Link href="/teacher/analytics" style={{ textDecoration: 'none' }}>
            <NavItem icon={<TrendingUp size={18} />} label="Analytics" active={pathname === '/teacher/analytics'} />
          </Link>
          <Link href="/teacher/reviews" style={{ textDecoration: 'none' }}>
            <NavItem icon={<Star size={18} />} label="Reviews" active={pathname === '/teacher/reviews'} />
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, marginLeft: 250, padding: '32px 40px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Instructor Dashboard
            </h1>
            <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>
              Welcome back, {user?.name || 'Instructor'}
            </p>
          </div>
          <Link 
            href="/teacher/create-course"
            style={{
              background: '#3b82f6', color: '#fff', padding: '10px 20px',
              borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            <Plus size={18} /> Create New Course
          </Link>
        </div>

        {/* STATS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
          <StatCard 
            label="Total Revenue" 
            value={`₹${stats.totalRevenue.toLocaleString()}`} 
            icon={<DollarSign size={20} color="#3b82f6" />}
            bg="#eff6ff"
            border="#bfdbfe"
          />
          <StatCard 
            label="Total Students" 
            value={stats.totalStudents} 
            icon={<Users size={20} color="#22c55e" />}
            bg="#f0fdf4"
            border="#bbf7d0"
          />
          <StatCard 
            label="Avg Rating" 
            value={stats.courseRating || '-'} 
            icon={<Star size={20} color="#f59e0b" />}
            bg="#fffbeb"
            border="#fde68a"
          />
          <StatCard 
            label="Active Courses" 
            value={stats.activeCourses} 
            icon={<BookOpen size={20} color="#6366f1" />}
            bg="#eef2ff"
            border="#c7d2fe"
          />
        </div>

        {/* COURSES TABLE */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>My Courses</h2>
          </div>

          {loading ? (
            <p style={{ color: '#64748b', padding: 24 }}>Loading courses...</p>
          ) : courses.length === 0 ? (
            <p style={{ color: '#64748b', padding: 24 }}>No courses yet. Create your first course to get started.</p>
          ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                  <th style={{ padding: 12, color: '#64748b', fontWeight: 600 }}>Course Title</th>
                  <th style={{ padding: 12, color: '#64748b', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: 12, color: '#64748b', fontWeight: 600 }}>Price</th>
                  <th style={{ padding: 12, color: '#64748b', fontWeight: 600 }}>Students</th>
                  <th style={{ padding: 12, color: '#64748b', fontWeight: 600 }}>Rating</th>
                  <th style={{ padding: 12, color: '#64748b', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: 12, color: '#64748b', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => {
                  const publishedAt = course.createdAt ? new Date(course.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
                  const students = course.enrolledStudents?.length ?? 0;
                  return (
                  <tr key={course._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: 16 }}>
                      <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>{course.title}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>Created {publishedAt}</div>
                    </td>
                    <td style={{ padding: 16 }}>
                      <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, color: '#475569' }}>
                        {course.category}
                      </span>
                    </td>
                    <td style={{ padding: 16, fontWeight: 500, color: '#0f172a' }}>
                      {course.price === 0 ? 'Free' : `₹${course.price}`}
                    </td>
                    <td style={{ padding: 16, color: '#475569' }}>{students}</td>
                    <td style={{ padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={14} fill="none" color="#f59e0b" />
                        <span>-</span>
                      </div>
                    </td>
                    <td style={{ padding: 16 }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                        background: '#dcfce7', color: '#166534'
                      }}>
                        Published
                      </span>
                    </td>
                    <td style={{ padding: 16 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link href={`/teacher/course/${course._id}/edit`} style={{ background: '#f1f5f9', border: 'none', padding: 6, borderRadius: 4, cursor: 'pointer', display: 'inline-flex' }} title="Edit course">
                          <Edit size={14} color="#64748b" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(course._id)}
                          disabled={deletingId === course._id}
                          style={{ background: '#fee2e2', border: 'none', padding: 6, borderRadius: 4, cursor: deletingId === course._id ? 'wait' : 'pointer' }}
                          title="Delete course"
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
          )}
        </div>

      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div style={{
      padding: '12px 24px',
      display: 'flex', alignItems: 'center', gap: 12,
      color: active ? '#3b82f6' : '#64748b',
      fontWeight: 500, cursor: 'pointer',
      borderLeft: active ? '4px solid #3b82f6' : '4px solid transparent',
      background: active ? '#eff6ff' : 'transparent'
    }}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function StatCard({ label, value, icon, bg, border }: { label: string, value: string | number, icon: React.ReactNode, bg: string, border: string }) {
  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{value}</div>
      </div>
    </div>
  );
}