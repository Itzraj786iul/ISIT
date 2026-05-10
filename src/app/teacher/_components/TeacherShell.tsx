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
  Building2,
  ClipboardList,
  Bot,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/t';
import type { I18nKey } from '@/lib/t';

const NAV_ITEMS: { labelKey: I18nKey; href: string; icon: typeof BookOpen }[] = [
  { labelKey: 'dashboard', href: '/teacher/dashboard', icon: BookOpen },
  { labelKey: 'organization', href: '/organization', icon: Building2 },
  { labelKey: 'aiTutor', href: '/ai-tutor', icon: Bot },
  { labelKey: 'subjects', href: '/teacher/subjects', icon: Layers },
  { labelKey: 'assignedTopics', href: '/teacher/assigned-topics', icon: ClipboardList },
  { labelKey: 'students', href: '/teacher/students', icon: Users },
  { labelKey: 'analytics', href: '/teacher/analytics', icon: TrendingUp },
  { labelKey: 'courses', href: '/teacher/create-course', icon: GraduationCap },
];

type User = { _id?: string; name?: string; role?: string; organization_id?: string } | null;

export default function TeacherShell({ children, user }: { children: React.ReactNode; user?: User }) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const tr = useT();

  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const teacherHome = isAdmin ? '/organization' : '/teacher/dashboard';
  const navEntries = NAV_ITEMS.flatMap((item) => {
    if (isAdmin && item.href === '/organization') return [];
    if (item.href === '/teacher/dashboard') return [{ ...item, href: teacherHome }];
    return [item];
  });

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
    <div className="isit-cosmic-bg min-h-screen flex font-sans text-cyan-100 relative">
      {open && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        className="bg-slate-950/95 border-r border-cyan-300/20 flex flex-col fixed h-screen z-30 overflow-hidden transition-[width] duration-200 shadow-lg md:shadow-none backdrop-blur-xl"
        style={{ width: open ? 240 : 0 }}
      >
        {/* Brand */}
        <div className="p-4 flex items-center justify-between gap-2 border-b border-cyan-300/20">
          <Link href={teacherHome} className="flex items-center gap-2 no-underline min-w-0">
            <div className="w-8 h-8 rounded-md bg-sky-600 flex items-center justify-center text-white font-bold text-xs shrink-0">I</div>
            <div className="min-w-0">
              <div className="font-bold text-cyan-100 text-sm">ISIC</div>
              <div className="text-[10px] text-cyan-200/70 font-medium">{tr('instructorPortal')}</div>
            </div>
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle className="!p-1.5" />
            <button type="button" onClick={() => setOpen(false)} className="p-1.5 text-cyan-200/70 hover:text-cyan-100 rounded">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User card */}
        {user?.name && (
          <div className="p-4 border-b border-cyan-300/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm font-bold flex-shrink-0 dark:bg-sky-900/50 dark:text-sky-300">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-cyan-100 text-sm truncate">{user.name}</p>
                <p className="text-[11px] text-cyan-200/70">
                  {user?.role?.toLowerCase() === 'admin' ? 'Admin' : tr('teacher')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
          {navEntries.map((item) => {
            const active =
              pathname === item.href || (item.href.length > 1 && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;
            return (
              <Link
                key={`${item.labelKey}-${item.href}`}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium no-underline transition-colors ${
                  active ? 'bg-cyan-400/15 text-cyan-200' : 'text-cyan-100/85 hover:bg-cyan-300/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{tr(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-cyan-300/20">
          <Link href="/teacher/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-cyan-100/85 hover:bg-cyan-300/10 no-underline">
            <Settings className="w-4 h-4 text-cyan-200/70" /> {tr('settings')}
          </Link>
          <button type="button" onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium text-red-300 hover:bg-red-500/10 border-0 bg-transparent cursor-pointer">
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
          className="fixed left-0 top-4 z-40 bg-slate-950/90 border border-cyan-300/20 border-l-0 rounded-r-lg p-2.5 text-cyan-100 shadow-sm hover:bg-cyan-300/10"
          aria-label="Open menu"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden relative z-[1]">
        {children}
      </main>
    </div>
  );
}
