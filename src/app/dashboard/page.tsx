'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Updated type to include role
type User = {
  name: string;
  email: string;
  role: string;
};

type Course = {
  _id: string;
  title: string;
  instructor?: string;
  hoursCompleted?: number;
  totalHours?: number;
  nextLesson?: string;
  progress?: number;
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    
    const userData = JSON.parse(userStr);

    // ================= SECURITY CHECK =================
    // If a Teacher logs in, send them to their dashboard
    if (userData.role === 'teacher') {
      router.push('/teacher/dashboard');
      return;
    }
    // =================================================

    setUser(userData);

    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (error) {
        console.error('Failed to fetch courses', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  // ... REST OF THE CODE REMAINS THE SAME ...
  // Fallback mock courses matching the screenshot
  const displayCourses: Course[] =
    courses.length > 0
      ? courses
      : [
          {
            _id: '1',
            title: 'Advanced Web Development',
            instructor: 'Dr. Sarah Chen',
            hoursCompleted: 24,
            totalHours: 32,
            nextLesson: 'React Hooks Deep Dive',
            progress: 75,
          },
          {
            _id: '2',
            title: 'Advanced Web Development',
            instructor: 'Prof. Michael Roberts',
            hoursCompleted: 18,
            totalHours: 30,
            nextLesson: 'Binary Search Trees',
            progress: 60,
          },
        ];

  const roadmapTasks = [
    { id: 1, text: 'Web Development Basics', status: 'completed' },
    { id: 2, text: 'Advanced JavaScript', status: 'completed' },
    { id: 3, text: 'React & Modern Frontend', status: 'inprogress' },
    { id: 4, text: 'Deploying to Production', status: 'locked' },
  ];

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: HomeIcon, active: true },
    { label: 'My Courses', href: '/courses', icon: BookIcon, active: false },
    { label: 'Analytics', href: '#', icon: ChartIcon, active: false },
    { label: 'Learning Path', href: '#', icon: PathIcon, active: false },
    { label: 'Achievements', href: '#', icon: TrophyIcon, active: false },
    { label: 'Schedule', href: '#', icon: ClockIcon, active: false },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* ================= SIDEBAR ================= */}
      <aside style={{
        width: sidebarOpen ? 160 : 0,
        minWidth: sidebarOpen ? 160 : 0,
        background: '#fff',
        borderRight: '1px solid #e8ecf0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 30,
        overflow: 'hidden',
        transition: 'width 0.25s ease, min-width 0.25s ease',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#3b82f6', letterSpacing: '-0.5px' }}>ISIT</div>
            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>Student Portal</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, display: 'flex', alignItems: 'center' }}
          >
            <ChevronLeftIcon />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8,
              background: item.active ? '#eff6ff' : 'transparent',
              color: item.active ? '#3b82f6' : '#64748b',
              fontWeight: item.active ? 600 : 500,
              fontSize: 13,
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}>
              <item.icon color={item.active ? '#3b82f6' : '#94a3b8'} size={16} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid #f1f5f9' }}>
          <Link href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, color: '#64748b', fontWeight: 500, fontSize: 13, textDecoration: 'none' }}>
            <SettingsIcon color="#94a3b8" size={16} />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, color: '#ef4444', fontWeight: 500, fontSize: 13, width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <LogoutIcon color="#ef4444" size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Collapsed sidebar toggle */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: 'fixed', left: 0, top: 20, zIndex: 40,
            background: '#fff', border: '1px solid #e8ecf0', borderLeft: 'none',
            borderRadius: '0 8px 8px 0', padding: '10px 8px',
            cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center',
            boxShadow: '2px 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <ChevronRightIcon />
        </button>
      )}

      {/* ================= MAIN ================= */}
      <main style={{ flex: 1, marginLeft: sidebarOpen ? 160 : 0, padding: '24px 28px', transition: 'margin-left 0.25s ease', minWidth: 0 }}>

        {/* HERO CARD */}
        <section style={{ marginBottom: 20 }}>
          <div style={{
            background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 60%, #6366f1 100%)',
            borderRadius: 16,
            padding: '28px 32px',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(59,130,246,0.25)',
          }}>
            {/* decorative circles */}
            <div style={{ position: 'absolute', top: -30, right: 60, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
            <div style={{ position: 'absolute', bottom: -40, right: 20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: '-0.3px' }}>
              Good Afternoon{user?.name ? `, ${user.name}` : ''}
            </h1>
            <p style={{ opacity: 0.85, marginTop: 4, marginBottom: 20, fontSize: 14 }}>
              Ready to continue your learning journey today?
            </p>

            <div style={{ display: 'flex', gap: 16 }}>
              <HeroStat icon="🔥" value="12" label="Day Streak" />
              <HeroStat icon="📈" value={String(displayCourses.length)} label="Active Courses" />
            </div>
          </div>
        </section>

        {/* STATS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
          <StatCard label="Active Courses" value={String(displayCourses.length)} color="#dbeafe" iconColor="#3b82f6" icon={<BookSolidIcon />} />
          <StatCard label="Completed" value="4" color="#dcfce7" iconColor="#22c55e" icon={<CheckSolidIcon />} />
          <StatCard label="Current Streak" value="12 days" color="#ffedd5" iconColor="#f97316" icon={<TrendIcon />} />
        </div>

        {/* CONTENT GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>

          {/* COURSE PROGRESS */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '24px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#1e293b' }}>Course Progress</h2>
              <GridIcon color="#94a3b8" size={18} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {loading ? (
                <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading...</p>
              ) : (
                displayCourses.slice(0, 2).map((course) => (
                  <CourseProgressCard key={course._id} course={course} />
                ))
              )}
            </div>
          </div>

          {/* ROADMAP */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '24px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#1e293b' }}>Learning Roadmap</h2>
              <ClockIconSm color="#94a3b8" size={16} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {roadmapTasks.filter(t => t.status !== 'locked').map((task) => (
                <RoadmapItem key={task.id} task={task} />
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

/* =========== SUB-COMPONENTS =========== */

function HeroStat({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(8px)',
      borderRadius: 10,
      padding: '10px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, iconColor, icon }: { label: string; value: string; color: string; iconColor: string; icon: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '18px 20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      border: '1px solid #f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div>
        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>{value}</div>
      </div>
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: iconColor, fontSize: 18,
      }}>
        {icon}
      </div>
    </div>
  );
}

function CourseProgressCard({ course }: { course: Course }) {
  const progress = course.progress ?? 70;
  const circumference = 2 * Math.PI * 28;
  const strokeDash = (progress / 100) * circumference;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
      padding: '14px 0',
      borderBottom: '1px solid #f8fafc',
    }}>
      {/* Circle Progress */}
      <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
        <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="4" />
          <circle
            cx="32" cy="32" r="28" fill="none"
            stroke={progress >= 70 ? '#3b82f6' : '#6366f1'}
            strokeWidth="4"
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13, color: '#1e293b',
        }}>
          {progress}%
        </div>
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 2 }}>{course.title}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{course.instructor || 'Instructor'}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>
          <span>⏱</span>
          <span>{course.hoursCompleted ?? 24}/{course.totalHours ?? 32}h completed</span>
        </div>
        {/* Progress Bar */}
        <div style={{ width: '100%', height: 5, background: '#e2e8f0', borderRadius: 99 }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: progress >= 70 ? 'linear-gradient(90deg,#38bdf8,#3b82f6)' : 'linear-gradient(90deg,#818cf8,#6366f1)',
            borderRadius: 99,
            transition: 'width 0.6s ease',
          }} />
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 5 }}>
          Next: <span style={{ color: '#475569', fontWeight: 500 }}>{course.nextLesson ?? 'Next Lesson'}</span>
        </div>
      </div>
    </div>
  );
}

function RoadmapItem({ task }: { task: { id: number; text: string; status: string } }) {
  const completed = task.status === 'completed';
  const inProgress = task.status === 'inprogress';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 14px',
      borderRadius: 10,
      background: completed ? '#f0fdf4' : inProgress ? '#eff6ff' : '#f8fafc',
      border: `1px solid ${completed ? '#bbf7d0' : inProgress ? '#bfdbfe' : '#e2e8f0'}`,
    }}>
      {/* Icon */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: completed ? '#22c55e' : inProgress ? '#3b82f6' : '#e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {completed ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : inProgress ? (
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        )}
      </div>

      <div>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: completed ? '#15803d' : inProgress ? '#1d4ed8' : '#94a3b8',
          textDecoration: completed ? 'line-through' : 'none',
        }}>
          {task.text}
        </div>
        <div style={{ fontSize: 11, color: completed ? '#22c55e' : inProgress ? '#3b82f6' : '#cbd5e1', marginTop: 1 }}>
          {completed ? 'Completed' : inProgress ? 'In Progress' : 'Locked'}
        </div>
      </div>
    </div>
  );
}

/* =========== ICONS =========== */

function HomeIcon({ color = '#64748b', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function BookIcon({ color = '#64748b', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
function ChartIcon({ color = '#64748b', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
function PathIcon({ color = '#64748b', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function TrophyIcon({ color = '#64748b', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 21 12 21 16 21" />
      <line x1="12" y1="21" x2="12" y2="17" />
      <path d="M5 3h14" />
      <path d="M5 3v5a7 7 0 0 0 14 0V3" />
      <path d="M5 7H3a2 2 0 0 0 0 4h2" />
      <path d="M19 7h2a2 2 0 0 1 0 4h-2" />
    </svg>
  );
}
function ClockIcon({ color = '#64748b', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function ClockIconSm({ color = '#64748b', size = 16 }: { color?: string; size?: number }) {
  return <ClockIcon color={color} size={size} />;
}
function SettingsIcon({ color = '#64748b', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function LogoutIcon({ color = '#ef4444', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function GridIcon({ color = '#94a3b8', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function BookSolidIcon() { return <span>📘</span>; }
function CheckSolidIcon() { return <span>✅</span>; }
function TrendIcon() { return <span>📈</span>; }