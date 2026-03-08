'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

const weeklyData = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 1.8 },
  { day: 'Wed', hours: 3.2 },
  { day: 'Thu', hours: 0.9 },
  { day: 'Fri', hours: 2.1 },
  { day: 'Sat', hours: 4.0 },
  { day: 'Sun', hours: 1.5 },
];

const monthlyProgress = [
  { month: 'Oct', score: 62 },
  { month: 'Nov', score: 71 },
  { month: 'Dec', score: 68 },
  { month: 'Jan', score: 80 },
  { month: 'Feb', score: 88 },
];

const subjects = [
  { name: 'Web Development', progress: 78, color: '#3b82f6', lessons: 24, courseId: '1' },
  { name: 'Data Structures', progress: 61, color: '#8b5cf6', lessons: 18, courseId: '2' },
  { name: 'UI/UX Design', progress: 45, color: '#f97316', lessons: 12, courseId: '3' },
  { name: 'DevOps Basics', progress: 30, color: '#22c55e', lessons: 8, courseId: '4' },
];

const maxHours = Math.max(...weeklyData.map(d => d.hours));

export default function Analytics() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user?.role?.toLowerCase() === 'teacher') {
      router.push('/teacher/dashboard');
    }
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '28px 32px', minWidth: 0 }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.4px' }}>Analytics</h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>Track your learning performance and progress</p>
        </div>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Hours', value: '46.2h', sub: '+12% this week', color: '#dbeafe', accent: '#3b82f6', emoji: '⏱', href: '/courses' },
            { label: 'Avg. Daily', value: '2.4h', sub: 'Last 7 days', color: '#fce7f3', accent: '#ec4899', emoji: '📊', href: '/courses' },
            { label: 'Lessons Done', value: '28', sub: '+5 this week', color: '#dcfce7', accent: '#22c55e', emoji: '✅', href: '/lesson' },
            { label: 'Quiz Score', value: '84%', sub: 'Top 15%', color: '#ffedd5', accent: '#f97316', emoji: '🎯', href: '/courses' },
          ].map((kpi) => (
            <Link key={kpi.label} href={kpi.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{kpi.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', letterSpacing: '-1px', marginTop: 4 }}>{kpi.value}</div>
                    <div style={{ fontSize: 12, color: kpi.accent, fontWeight: 500, marginTop: 2 }}>{kpi.sub}</div>
                  </div>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{kpi.emoji}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 20 }}>

          {/* Weekly Bar Chart */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>Weekly Study Hours</h3>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>Hours spent learning per day</p>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['week', 'month'] as const).map(t => (
                  <button key={t} onClick={() => setActiveTab(t)} style={{
                    padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    background: activeTab === t ? '#3b82f6' : '#f1f5f9',
                    color: activeTab === t ? '#fff' : '#64748b',
                  }}>{t === 'week' ? 'Week' : 'Month'}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
              {weeklyData.map((d, i) => (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>{d.hours}h</div>
                  <div style={{
                    width: '100%', height: `${(d.hours / maxHours) * 110}px`,
                    background: i === 5 ? 'linear-gradient(180deg, #38bdf8, #3b82f6)' : '#dbeafe',
                    borderRadius: '6px 6px 0 0',
                  }} />
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{d.day}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Line Chart */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>Performance Trend</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>Average quiz score over months</p>
            </div>
            <svg width="100%" height="140" viewBox="0 0 300 140" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[25, 50, 75, 100].map(v => (
                <line key={v} x1="0" y1={140 - (v / 100) * 120} x2="300" y2={140 - (v / 100) * 120} stroke="#f1f5f9" strokeWidth="1" />
              ))}
              <path
                d={`M ${monthlyProgress.map((d, i) => `${(i / (monthlyProgress.length - 1)) * 290 + 5},${140 - (d.score / 100) * 120}`).join(' L ')} L 295,140 L 5,140 Z`}
                fill="url(#lineGrad)"
              />
              <polyline
                points={monthlyProgress.map((d, i) => `${(i / (monthlyProgress.length - 1)) * 290 + 5},${140 - (d.score / 100) * 120}`).join(' ')}
                fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
              />
              {monthlyProgress.map((d, i) => (
                <circle key={i} cx={(i / (monthlyProgress.length - 1)) * 290 + 5} cy={140 - (d.score / 100) * 120}
                  r="4" fill="#8b5cf6" stroke="#fff" strokeWidth="2" />
              ))}
              {monthlyProgress.map((d, i) => (
                <text key={i} x={(i / (monthlyProgress.length - 1)) * 290 + 5} y="155"
                  textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="DM Sans, sans-serif">{d.month}</text>
              ))}
            </svg>
          </div>
        </div>

        {/* Subject Breakdown — each row links to its course */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px 28px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>Subject Breakdown</h3>
            <Link href="/courses" style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>View All Courses →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {subjects.map((s) => (
              <Link key={s.name} href={`/course/${s.courseId}`} style={{ textDecoration: 'none' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{s.name}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{s.lessons} lessons</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.progress}%</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 99 }}>
                    <div style={{ height: '100%', width: `${s.progress}%`, background: s.color, borderRadius: 99 }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}