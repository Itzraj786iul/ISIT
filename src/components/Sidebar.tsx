'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'My Courses', href: '/my-courses' },
  { label: 'Subjects', href: '/subjects' },
  { label: 'Browse All', href: '/courses' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Learning Path', href: '/learning-path' },
  { label: 'Achievements', href: '/achievements' },
  { label: 'Schedule', href: '/schedule' },
];

function SidebarIcon({ name, color }: { name: string; color: string }) {
  const size = 16;
  if (name === 'Dashboard') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
  if (name === 'My Courses') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
  if (name === 'Subjects') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M12 6v6" /><path d="M9 9h6" /></svg>;
  if (name === 'Browse All') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
  if (name === 'Analytics') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
  if (name === 'Learning Path') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M20 19.5a2.5 2.5 0 0 1-2.5 2.5H2" /><path d="M6.5 2H2v20" /><path d="M8 7l3-3 3 3" /><path d="M12 10v12" /></svg>;
  if (name === 'Achievements') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21l4 0" /><path d="M12 21v-4" /><path d="M5 3h14v5a7 7 0 0 1-14 0V3z" /><path d="M5 7H3a2 2 0 0 0 0 4h2" /><path d="M19 7h2a2 2 0 0 1 0 4h-2" /></svg>;
  if (name === 'Schedule') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
  return null;
}

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) setOpen(false);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) setOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile backdrop when sidebar open */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className="w-[var(--sidebar-w)] min-w-[var(--sidebar-w)] bg-white border-r border-slate-200 flex flex-col fixed h-screen z-30 overflow-hidden transition-[width,min-width] duration-200 shadow-lg md:shadow-none" style={{ '--sidebar-w': open ? '220px' : '0' } as React.CSSProperties}>
        <div className="p-4 flex items-center justify-between border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 rounded-md bg-sky-500 flex items-center justify-center text-white font-bold text-xs">I</div>
            <div>
              <div className="font-bold text-slate-800 text-sm">ISIT</div>
              <div className="text-[10px] text-slate-500 font-medium">Student Portal</div>
            </div>
          </Link>
          <button type="button" onClick={() => setOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        </div>

        {user && (
          <Link href="/dashboard" className="p-4 flex items-center gap-3 border-b border-slate-100 no-underline hover:bg-slate-50 transition">
            <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800 text-sm truncate">{user.name || 'Student'}</p>
              <p className="text-xs text-slate-500 truncate">{user.email || ''}</p>
            </div>
          </Link>
        )}

        <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const color = active ? '#2563eb' : '#64748b';
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium no-underline transition-colors ${active ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <SidebarIcon name={item.label} color={color} />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-slate-100">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-50 no-underline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            Settings
          </Link>
          <Link href="/help" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-50 no-underline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Help
          </Link>
          <button type="button" onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium text-red-600 hover:bg-red-50 border-0 bg-transparent cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Logout
          </button>
        </div>
      </aside>

      {!open && (
        <button type="button" onClick={() => setOpen(true)} className="fixed left-0 top-4 z-40 bg-white border border-slate-200 border-l-0 rounded-r-lg p-2.5 text-slate-500 shadow-sm hover:bg-slate-50 md:top-5" aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      )}

      <div className="flex-shrink-0 transition-[width,min-width] duration-200" style={{ width: open ? 220 : 0, minWidth: open ? 220 : 0 }} />
    </>
  );
}
