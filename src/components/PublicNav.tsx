'use client';

/**
 * Public nav: "Courses" + profile "My Courses" point at @legacy MARKETPLACE_LMS routes.
 * Prefer highlighting /subjects for AI-first onboarding when ready (docs/AI_FIRST_MIGRATION.md).
 */
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, User, LayoutDashboard, BookOpen, Settings, LogOut, ChevronDown } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/t';
import type { I18nKey } from '@/lib/t';

type PublicNavProps = {
  active?: 'home' | 'courses' | 'how-it-works' | 'stories' | 'blog';
};

const navLinks: { href: string; key: PublicNavProps['active']; labelKey: I18nKey }[] = [
  { href: '/', key: 'home', labelKey: 'home' },
  { href: '/courses', key: 'courses', labelKey: 'courses' },
  { href: '/how-it-works', key: 'how-it-works', labelKey: 'howItWorks' },
  { href: '/stories', key: 'stories', labelKey: 'stories' },
  { href: '/blog', key: 'blog', labelKey: 'blog' },
];

function getDashboardHref(role?: string) {
  const r = role?.toLowerCase();
  if (r === 'teacher') return '/teacher/dashboard';
  if (r === 'parent') return '/parent/dashboard';
  return '/dashboard';
}

export default function PublicNav({ active }: PublicNavProps) {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);
  const tr = useT();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    router.push('/');
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 dark:bg-slate-900 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen((o) => !o)}
              className="md:hidden p-2 -ml-2 text-slate-700 hover:text-slate-900 rounded-lg dark:text-slate-200 dark:hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" className="text-sky-500 font-bold text-lg sm:text-xl hover:text-sky-600 dark:text-sky-400">
              ISIT
            </Link>
          </div>

          <nav className="hidden md:flex gap-8 lg:gap-10 text-sm font-medium">
            {navLinks.map(({ href, key, labelKey }) => (
              <Link
                key={key}
                href={href}
                className={
                  active === key
                    ? 'text-slate-900 border-b-2 border-sky-500 pb-1 dark:text-slate-100'
                    : 'text-slate-700 hover:text-sky-600 transition dark:text-slate-300 dark:hover:text-sky-400'
                }
              >
                {tr(labelKey)}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3 sm:gap-4" ref={profileRef}>
            <ThemeToggle />
            <LanguageSwitcher />
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 rounded-full pl-3 pr-2 py-2 text-sm font-medium text-slate-800 transition dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100"
                  aria-label="Profile menu"
                >
                  <span className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </span>
                  <span className="max-w-[120px] truncate">{user.name || 'Profile'}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 dark:bg-slate-800 dark:border-slate-600">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="font-medium text-slate-900 truncate dark:text-slate-100">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate dark:text-slate-400">{user.email}</p>
                    </div>
                    <Link href={getDashboardHref(user.role)} onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700">
                      <LayoutDashboard className="w-4 h-4 text-sky-500" /> {tr('myDashboard')}
                    </Link>
                    <Link href="/my-courses" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700">
                      <BookOpen className="w-4 h-4 text-sky-500" /> {tr('myCourses')}
                    </Link>
                    <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700">
                      <Settings className="w-4 h-4 text-sky-500" /> {tr('settings')}
                    </Link>
                    {user.role?.toLowerCase() === 'teacher' && (
                      <Link href="/teacher/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700">
                        <LayoutDashboard className="w-4 h-4 text-sky-500" /> {tr('teacherDashboard')}
                      </Link>
                    )}
                    <button type="button" onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">
                      <LogOut className="w-4 h-4" /> {tr('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-slate-700 hover:text-sky-600 text-sm font-medium transition dark:text-slate-300 dark:hover:text-sky-400">
                  {tr('logIn')}
                </Link>
                <Link href="/signup" className="bg-black text-white px-5 py-2 rounded-full text-sm hover:bg-gray-800 transition dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
                  {tr('signUp')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-30 md:hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute top-0 left-0 w-full max-w-sm bg-white shadow-xl h-full py-6 px-4 dark:bg-slate-900 dark:border-slate-700">
            <nav className="flex flex-col gap-1 pt-4">
              {navLinks.map(({ href, labelKey }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileNavOpen(false)}
                  className="px-4 py-3 rounded-lg font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {tr(labelKey)}
                </Link>
              ))}
              <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 mt-2 flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide w-full dark:text-slate-400">{tr('language')}</span>
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
              {user ? (
                <>
                  <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 mt-2">
                    <p className="font-medium text-slate-800 text-sm truncate dark:text-slate-100">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate dark:text-slate-400">{user.email}</p>
                  </div>
                  <Link href={getDashboardHref(user.role)} onClick={() => setMobileNavOpen(false)} className="px-4 py-3 rounded-lg font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                    {tr('myDashboard')}
                  </Link>
                  <Link href="/my-courses" onClick={() => setMobileNavOpen(false)} className="px-4 py-3 rounded-lg font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                    {tr('myCourses')}
                  </Link>
                  <Link href="/settings" onClick={() => setMobileNavOpen(false)} className="px-4 py-3 rounded-lg font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                    {tr('settings')}
                  </Link>
                  {user.role?.toLowerCase() === 'teacher' && (
                    <Link href="/teacher/dashboard" onClick={() => setMobileNavOpen(false)} className="px-4 py-3 rounded-lg font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                      {tr('teacherDashboard')}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileNavOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    {tr('logout')}
                  </button>
                </>
              ) : (
                <Link href="/signup" onClick={() => setMobileNavOpen(false)} className="mx-4 mt-4 py-3 rounded-lg font-medium text-center bg-black text-white block dark:bg-slate-100 dark:text-slate-900">
                  {tr('signUp')}
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
