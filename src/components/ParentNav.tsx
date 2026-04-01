'use client';

/** Parent nav includes @legacy MARKETPLACE_LMS "Browse Courses" (/courses). See docs/AI_FIRST_MIGRATION.md */
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Users, Plus, Settings, LogOut, Heart } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/t';
import type { I18nKey } from '@/lib/t';

export default function ParentNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const tr = useT();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navItems: { href: string; labelKey: I18nKey; icon: ReactNode }[] = [
    { href: '/parent/dashboard', labelKey: 'dashboard', icon: <Heart size={18} /> },
    { href: '/parent/children', labelKey: 'myChildren', icon: <Users size={18} /> },
    { href: '/parent/children/add', labelKey: 'addChild', icon: <Plus size={18} /> },
    { href: '/courses', labelKey: 'browseCourses', icon: <BookOpen size={18} /> },
  ];

  return (
    <aside className="w-[250px] min-w-[250px] bg-white border-r border-slate-200 flex flex-col fixed h-screen top-0 z-10 dark:bg-slate-900 dark:border-slate-700">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-2 dark:border-slate-700">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-violet-500 flex items-center justify-center text-white font-bold shrink-0">
            I
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 text-sm dark:text-slate-100">ISIT</p>
            <p className="text-[10px] text-slate-500 font-medium dark:text-slate-400">{tr('parentPortal')}</p>
          </div>
        </div>
        <ThemeToggle className="!p-1.5 shrink-0" />
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map(({ href, labelKey, icon }) => {
          const active =
            pathname === href ||
            (href === '/parent/children' && pathname.startsWith('/parent/children/') && pathname !== '/parent/children/add');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium no-underline transition ${
                active ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {icon}
              {tr(labelKey)}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-100 space-y-1 dark:border-slate-700">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 no-underline dark:text-slate-300 dark:hover:bg-slate-800 ${
            pathname === '/settings' ? 'bg-slate-100 dark:bg-slate-800' : ''
          }`}
        >
          <Settings size={18} /> {tr('settings')}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border-0 bg-transparent cursor-pointer dark:hover:bg-red-950/40"
        >
          <LogOut size={18} /> {tr('logout')}
        </button>
      </div>
    </aside>
  );
}
