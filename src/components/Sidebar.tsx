'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// ─── Route map matching your src/app folder structure ───────────────────────
// /dashboard        → src/app/dashboard/page.tsx   (exists)
// /courses          → src/app/courses/page.tsx      (exists)
// /analytics        → src/app/analytics/page.tsx    (NEW – add this file)
// /learning-path    → src/app/learning-path/page.tsx (NEW – add this file)
// /achievements     → src/app/achievements/page.tsx  (NEW – add this file)
// /schedule         → src/app/schedule/page.tsx      (NEW – add this file)
// /login            → src/app/login/page.tsx         (exists)
// /signup           → src/app/signup/page.tsx        (exists)
// ─────────────────────────────────────────────────────────────────────────────

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (c: string) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'My Courses',
    href: '/courses',         // ← src/app/courses/page.tsx (exists)
    icon: (c: string) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    label: 'Analytics',
    href: '/analytics',       // ← src/app/analytics/page.tsx (NEW)
    icon: (c: string) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: 'Learning Path',
    href: '/learning-path',   // ← src/app/learning-path/page.tsx (NEW)
    icon: (c: string) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: 'Achievements',
    href: '/achievements',    // ← src/app/achievements/page.tsx (NEW)
    icon: (c: string) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="8 21 12 21 16 21" />
        <line x1="12" y1="21" x2="12" y2="17" />
        <path d="M5 3h14v5a7 7 0 0 1-14 0V3z" />
        <path d="M5 7H3a2 2 0 0 0 0 4h2" />
        <path d="M19 7h2a2 2 0 0 1 0 4h-2" />
      </svg>
    ),
  },
  {
    label: 'Schedule',
    href: '/schedule',        // ← src/app/schedule/page.tsx (NEW)
    icon: (c: string) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');   // ← src/app/login/page.tsx (exists)
  };

  return (
    <>
      <aside style={{
        width: open ? 160 : 0,
        minWidth: open ? 160 : 0,
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
        {/* Logo → /dashboard */}
        <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#3b82f6', letterSpacing: '-0.5px' }}>ISIT</div>
            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>Student Portal</div>
          </Link>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, display: 'flex' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8,
                background: active ? '#eff6ff' : 'transparent',
                color: active ? '#3b82f6' : '#64748b',
                fontWeight: active ? 600 : 500,
                fontSize: 13, textDecoration: 'none',
                transition: 'background 0.15s',
                whiteSpace: 'nowrap',
              }}>
                {item.icon(active ? '#3b82f6' : '#94a3b8')}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Settings + Logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid #f1f5f9' }}>
          {/* Settings — no dedicated page found in your codebase yet, using # */}
          <Link href="#" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8,
            color: '#64748b', fontWeight: 500, fontSize: 13, textDecoration: 'none',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </Link>
          {/* Logout → clears localStorage → /login */}
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8,
            color: '#ef4444', fontWeight: 500, fontSize: 13,
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Sidebar-closed toggle button */}
      {!open && (
        <button onClick={() => setOpen(true)} style={{
          position: 'fixed', left: 0, top: 20, zIndex: 40,
          background: '#fff', border: '1px solid #e8ecf0', borderLeft: 'none',
          borderRadius: '0 8px 8px 0', padding: '10px 8px',
          cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center',
          boxShadow: '2px 2px 8px rgba(0,0,0,0.06)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* Flex spacer so main content shifts right */}
      <div style={{
        width: open ? 160 : 0,
        minWidth: open ? 160 : 0,
        flexShrink: 0,
        transition: 'width 0.25s ease, min-width 0.25s ease',
      }} />
    </>
  );
}