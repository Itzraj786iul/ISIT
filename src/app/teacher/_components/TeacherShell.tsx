'use client';

/**
 * Teacher shell: "Courses" → /teacher/create-course is @legacy MARKETPLACE_LMS.
 * Curriculum work lives under /teacher/subjects (AI-first). See docs/AI_FIRST_MIGRATION.md
 */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  Users,
  TrendingUp,
  Layers,
  LogOut,
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/t';
import type { I18nKey } from '@/lib/t';

const NAV_ITEMS: { labelKey: I18nKey; href: string; icon: typeof BookOpen }[] = [
  { labelKey: 'dashboard', href: '/teacher/dashboard', icon: BookOpen },
  { labelKey: 'subjects', href: '/teacher/subjects', icon: Layers },
  { labelKey: 'students', href: '/teacher/students', icon: Users },
  { labelKey: 'analytics', href: '/teacher/analytics', icon: TrendingUp },
  { labelKey: 'courses', href: '/teacher/create-course', icon: GraduationCap },
];

type User = { _id?: string; name?: string; role?: string } | null;

export default function TeacherShell({ children, user }: { children: React.ReactNode; user?: User }) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const tr = useT();

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
    <div className="min-h-screen bg-slate-50 flex font-sans dark:bg-slate-950">
      {open && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        className="bg-white border-r border-slate-200 flex flex-col fixed h-screen z-30 overflow-hidden transition-[width] duration-200 shadow-lg md:shadow-none dark:bg-slate-900 dark:border-slate-700"
        style={{ width: open ? 240 : 0 }}
      >
        {/* Brand */}
        <div className="p-4 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700">
          <Link href="/teacher/dashboard" className="flex items-center gap-2 no-underline min-w-0">
            <div className="w-8 h-8 rounded-md bg-sky-600 flex items-center justify-center text-white font-bold text-xs shrink-0">I</div>
            <div className="min-w-0">
              <div className="font-bold text-slate-800 text-sm dark:text-slate-100">ISIT</div>
              <div className="text-[10px] text-slate-500 font-medium dark:text-slate-400">{tr('instructorPortal')}</div>
            </div>
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle className="!p-1.5" />
            <button type="button" onClick={() => setOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded dark:hover:text-slate-300">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User card */}
        {user?.name && (
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm font-bold flex-shrink-0 dark:bg-sky-900/50 dark:text-sky-300">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate dark:text-slate-100">{user.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{tr('teacher')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/teacher/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium no-underline transition-colors ${
                  active ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{tr(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-slate-100 dark:border-slate-700">
          <Link href="/teacher/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-50 no-underline dark:text-slate-300 dark:hover:bg-slate-800">
            <Settings className="w-4 h-4 text-slate-400" /> {tr('settings')}
          </Link>
          <button type="button" onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium text-red-600 hover:bg-red-50 border-0 bg-transparent cursor-pointer dark:hover:bg-red-950/40">
            <LogOut className="w-4 h-4" /> {tr('logout')}
          </button>
        </div>
      </aside>

      {/* Sidebar spacer */}
      <div className="flex-shrink-0 transition-[width] duration-200" style={{ width: open ? 240 : 0, minWidth: open ? 240 : 0 }} />

      {/* Toggle button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed left-0 top-4 z-40 bg-white border border-slate-200 border-l-0 rounded-r-lg p-2.5 text-slate-500 shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700"
          aria-label="Open menu"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
