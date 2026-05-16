'use client';

/**
 * Student nav: includes @legacy MARKETPLACE_LMS links ("My Courses", "Browse All" → /courses).
 * AI-first primary: Subjects + Learning Path. Migration: docs/AI_FIRST_MIGRATION.md
 */
import { useState, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/t';
import { getLearningMode } from '@/lib/learning-mode';
import type { I18nKey } from '@/lib/t';

/** AI-first order: core path first; marketplace & extras grouped below (Part 4). */
const primaryNavItems: { iconId: string; href: string; labelKey: I18nKey }[] = [
  { iconId: 'Dashboard', href: '/dashboard', labelKey: 'dashboard' },
  { iconId: 'Subjects', href: '/subjects', labelKey: 'subjects' },
  { iconId: 'AI Tutor', href: '/ai-tutor', labelKey: 'aiTutor' },
];

const moreNavItems: { iconId: string; href: string; labelKey: I18nKey }[] = [
  { iconId: 'My Courses', href: '/my-courses', labelKey: 'myCourses' },
  { iconId: 'Browse All', href: '/courses', labelKey: 'browseAll' },
  { iconId: 'Analytics', href: '/analytics', labelKey: 'analytics' },
  { iconId: 'Learning Path', href: '/learning-path', labelKey: 'learningPath' },
  { iconId: 'Achievements', href: '/achievements', labelKey: 'achievements' },
  { iconId: 'Schedule', href: '/schedule', labelKey: 'schedule' },
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
  if (name === 'AI Tutor') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="8" width="12" height="10" rx="3"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><circle cx="10" cy="13" r="1"/><circle cx="14" cy="13" r="1"/><path d="M10 16h4"/></svg>;
  return null;
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const tr = useT();

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth >= 768) setOpen(true);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth < 768) setOpen(false);
    };
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
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden motion-safe-transition"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        id="student-sidebar"
        className={`flex flex-col fixed left-0 top-0 h-dvh z-30 border-white/[0.08] bg-[#050510]/95 shadow-lg md:shadow-none transition-[width] duration-200 ease-out overflow-hidden backdrop-blur-xl ${
          open ? 'w-[min(85vw,260px)] md:w-[220px] border-r' : 'w-0 border-r-0'
        }`}
      >
        <div className="p-4 flex items-center justify-between gap-2 border-b border-cyan-300/20 w-[min(85vw,260px)] md:w-[220px] shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 no-underline min-w-0" onClick={() => window.innerWidth < 768 && setOpen(false)}>
            <div className="w-8 h-8 rounded-md bg-sky-500 flex items-center justify-center text-white font-bold text-xs shrink-0">I</div>
            <div className="min-w-0">
              <div className="font-bold text-cyan-100 text-sm">ISIC</div>
              <div className="text-[10px] text-cyan-200/70 font-medium">{tr('studentPortal')}</div>
              {user && user.role?.toLowerCase() === 'student' ? (
                <div className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold mt-0.5">
                  {getLearningMode(user) === 'teacher_learning' ? tr('teacherLearningMode') : tr('freeLearningMode')}
                </div>
              ) : null}
            </div>
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle className="!p-1.5" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="md:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-500 hover:text-slate-800 rounded-xl dark:hover:text-slate-200 active:scale-95 transition-transform"
              aria-label="Close menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="hidden md:inline-flex p-1.5 text-slate-400 hover:text-slate-600 rounded dark:hover:text-slate-300"
              aria-label="Collapse sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          </div>
        </div>

        {user && (
          <Link
            href="/dashboard"
            className="p-4 flex items-center gap-3 border-b border-cyan-300/20 no-underline hover:bg-cyan-300/10 transition w-[min(85vw,260px)] md:w-[220px] shrink-0"
            onClick={() => window.innerWidth < 768 && setOpen(false)}
          >
            <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 dark:bg-sky-900/50 dark:text-sky-300">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-cyan-100 text-sm truncate">{user.name || 'Student'}</p>
              <p className="text-xs text-cyan-200/70 truncate">{user.email || ''}</p>
            </div>
          </Link>
        )}

        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2 w-[min(85vw,260px)] md:w-[220px]" aria-label="Student navigation">
          <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {tr('sidebarGroupStart')}
          </p>
          {primaryNavItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const color = active ? '#2563eb' : '#64748b';
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => window.innerWidth < 768 && setOpen(false)}
                className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium no-underline transition-colors active:scale-[0.99] ${active ? 'border border-white/[0.1] bg-white/[0.06] text-cyan-300' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'}`}
              >
                <SidebarIcon name={item.iconId} color={color} />
                <span className="whitespace-nowrap">{tr(item.labelKey)}</span>
              </Link>
            );
          })}
          <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {tr('sidebarGroupMore')}
          </p>
          {moreNavItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const color = active ? '#2563eb' : '#64748b';
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => window.innerWidth < 768 && setOpen(false)}
                className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium no-underline transition-colors active:scale-[0.99] ${active ? 'border border-white/[0.1] bg-white/[0.06] text-cyan-300' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'}`}
              >
                <SidebarIcon name={item.iconId} color={color} />
                <span className="whitespace-nowrap">{tr(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-cyan-300/20 w-[min(85vw,260px)] md:w-[220px] shrink-0">
          <Link
            href="/settings"
            onClick={() => window.innerWidth < 768 && setOpen(false)}
            className="flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-xl text-[13px] font-medium text-slate-600 hover:bg-slate-50 no-underline dark:text-slate-300 dark:hover:bg-slate-800 active:scale-[0.99]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            {tr('settings')}
          </Link>
          <Link
            href="/help"
            onClick={() => window.innerWidth < 768 && setOpen(false)}
            className="flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-xl text-[13px] font-medium text-slate-600 hover:bg-slate-50 no-underline dark:text-slate-300 dark:hover:bg-slate-800 active:scale-[0.99]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            {tr('help')}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-3 min-h-[44px] rounded-xl text-[13px] font-medium text-red-600 hover:bg-red-50 border-0 bg-transparent cursor-pointer dark:hover:bg-red-950/40 active:scale-[0.99]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            {tr('logout')}
          </button>
        </div>
      </aside>

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed top-[max(0.75rem,env(safe-area-inset-top))] left-[max(0.75rem,env(safe-area-inset-left))] z-40 md:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-slate-950/90 border border-cyan-300/25 text-cyan-100 shadow-md hover:bg-cyan-300/10 active:scale-95 transition-transform"
          aria-label="Open menu"
          aria-controls="student-sidebar"
          aria-expanded={false}
        >
          <Menu className="w-6 h-6" strokeWidth={2} />
        </button>
      )}

      <div
        className="hidden md:block flex-shrink-0 transition-[width] duration-200 ease-out"
        style={{ width: open ? 220 : 0, minWidth: open ? 220 : 0 }}
        aria-hidden
      />
    </>
  );
}
