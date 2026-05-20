'use client';

/** Parent nav — mobile drawer + desktop sidebar (mirrors student Sidebar). */
import { useState, useEffect, useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Users, Plus, Settings, LogOut, Heart, Bot, Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/t';
import type { I18nKey } from '@/lib/t';

const SIDEBAR_WIDTH = 250;

export default function ParentNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const tr = useT();

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth >= 768) setOpen(true);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) setOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const closeOnMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) setOpen(false);
  };

  const navItems: { href: string; labelKey: I18nKey; icon: ReactNode }[] = [
    { href: '/parent/dashboard', labelKey: 'dashboard', icon: <Heart size={18} /> },
    { href: '/ai-tutor', labelKey: 'aiTutor', icon: <Bot size={18} /> },
    { href: '/parent/children', labelKey: 'myChildren', icon: <Users size={18} /> },
    { href: '/parent/children/add', labelKey: 'addChild', icon: <Plus size={18} /> },
    { href: '/courses', labelKey: 'browseCourses', icon: <BookOpen size={18} /> },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden motion-safe-transition"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        id="parent-sidebar"
        className={`isit-shell-aside fixed left-0 top-0 z-30 flex h-dvh flex-col overflow-hidden shadow-lg backdrop-blur-xl transition-[width] duration-200 ease-out md:shadow-none ${
          open ? 'border-r' : 'w-0 border-r-0'
        }`}
        style={{ width: open ? `min(85vw, ${SIDEBAR_WIDTH}px)` : 0 }}
      >
        <div
          className="flex w-[min(85vw,250px)] shrink-0 items-center justify-between gap-2 border-b border-[color:var(--isit-shell-border)] p-4 md:w-[250px]"
        >
          <Link href="/parent/dashboard" className="flex min-w-0 items-center gap-3 no-underline" onClick={closeOnMobile}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500 font-bold text-white">
              I
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold isit-text-primary">ISIC</p>
              <p className="text-[10px] font-medium isit-muted">{tr('parentPortal')}</p>
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle className="!p-1.5" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-500 transition-transform hover:text-slate-800 active:scale-95 md:hidden dark:text-slate-200 dark:hover:text-slate-400"
              aria-label="Close menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="flex min-h-0 w-[min(85vw,250px)] flex-1 flex-col gap-1 overflow-y-auto p-3 md:w-[250px]" aria-label="Parent navigation">
          {navItems.map(({ href, labelKey, icon }) => {
            const active =
              pathname === href ||
              (href === '/parent/children' &&
                pathname.startsWith('/parent/children/') &&
                pathname !== '/parent/children/add');
            return (
              <Link
                key={href}
                href={href}
                onClick={closeOnMobile}
                className={`flex min-h-[44px] items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium no-underline transition ${
                  active ? 'bg-cyan-400/15 text-slate-600 dark:text-cyan-200' : 'isit-nav-link dark:hover:bg-cyan-300/10'
                }`}
              >
                {icon}
                {tr(labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="w-[min(85vw,250px)] shrink-0 space-y-1 border-t border-[color:var(--isit-shell-border)] p-3 md:w-[250px]">
          <Link
            href="/settings"
            onClick={closeOnMobile}
            className={`flex min-h-[44px] items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium no-underline isit-nav-link dark:hover:bg-cyan-300/10 ${
              pathname === '/settings' ? 'bg-cyan-400/15' : ''
            }`}
          >
            <Settings size={18} /> {tr('settings')}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
          >
            <LogOut size={18} /> {tr('logout')}
          </button>
        </div>
      </aside>

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed left-[max(0.75rem,env(safe-area-inset-left))] top-[max(0.75rem,env(safe-area-inset-top))] z-40 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl isit-card shadow-md isit-text-primary transition-transform hover:bg-[var(--isit-nav-hover-bg)] active:scale-95 md:hidden"
          aria-label="Open menu"
          aria-controls="parent-sidebar"
          aria-expanded={false}
        >
          <Menu className="h-6 w-6" strokeWidth={2} />
        </button>
      )}

      <div
        className="hidden shrink-0 transition-[width] duration-200 ease-out md:block"
        style={{ width: open ? SIDEBAR_WIDTH : 0, minWidth: open ? SIDEBAR_WIDTH : 0 }}
        aria-hidden
      />
    </>
  );
}
