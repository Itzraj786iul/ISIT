'use client';

/**
 * Public nav: "Courses" + profile "My Courses" point at @legacy MARKETPLACE_LMS routes.
 * Prefer highlighting /subjects for AI-first onboarding when ready (docs/AI_FIRST_MIGRATION.md).
 */
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, User, LayoutDashboard, BookOpen, Settings, LogOut, ChevronDown, Bot, Sparkles } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/t';
import type { I18nKey } from '@/lib/t';

type PublicNavProps = {
  active?: 'home' | 'courses' | 'how-it-works' | 'stories' | 'blog' | 'about-us';
};

const navLinks: { href: string; key: PublicNavProps['active']; labelKey?: I18nKey; label?: string }[] = [
  { href: '/', key: 'home', labelKey: 'home' },
  { href: '/courses', key: 'courses', labelKey: 'courses' },
  { href: '/how-it-works', key: 'how-it-works', labelKey: 'howItWorks' },
  { href: '/stories', key: 'stories', labelKey: 'stories' },
  { href: '/blog', key: 'blog', labelKey: 'blog' },
  { href: '/about-us', key: 'about-us', label: 'About Us' },
];

function getDashboardHref(role?: string) {
  const r = role?.toLowerCase();
  if (r === 'admin') return '/organization';
  if (r === 'teacher') return '/teacher/dashboard';
  if (r === 'parent') return '/parent/dashboard';
  return '/dashboard';
}

export default function PublicNav({ active }: PublicNavProps) {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openingTutor, setOpeningTutor] = useState(false);
  const { user, loading, logout } = useAuth();
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

  const handleAskTutor = async () => {
    if (loading || openingTutor) return;
    setOpeningTutor(true);
    try {
      if (!user) {
        router.push('/login?returnUrl=%2Fai-tutor');
        return;
      }
      router.push('/ai-tutor');
    } finally {
      setOpeningTutor(false);
    }
  };

  return (
    <>
      <header className="isit-nav-enter sticky top-0 z-50 border-b border-cyan-400/15 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen((o) => !o)}
              className="rounded-lg p-2 text-cyan-100 transition hover:bg-cyan-300/10 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" className="flex items-center gap-2 text-cyan-100">
              <span className="animate-pulse-cyan flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-200">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-lg font-extrabold tracking-wide sm:text-xl">ISIC</span>
            </Link>
          </div>

          <nav className="hidden gap-8 text-sm font-medium md:flex">
            {navLinks.map(({ href, key, labelKey, label }) => (
              <Link
                key={key}
                href={href}
                className={
                  active === key
                    ? 'border-b-2 border-cyan-300 pb-1 text-cyan-200'
                    : 'text-slate-300 transition hover:text-cyan-200'
                }
              >
                {key === 'courses' ? (
                  <span className="inline-flex items-center gap-1">
                    Programs <ChevronDown className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  label ?? tr(labelKey as I18nKey)
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 sm:gap-4 md:flex" ref={profileRef}>
            <ThemeToggle />
            <LanguageSwitcher />
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-cyan-200/30 bg-slate-900/70 py-2 pl-3 pr-2 text-sm font-medium text-cyan-100 transition hover:bg-slate-900"
                  aria-label="Profile menu"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/80 text-slate-950">
                    <User className="w-4 h-4" />
                  </span>
                  <span className="max-w-[120px] truncate">{user.name || 'Profile'}</span>
                  <ChevronDown className={`h-4 w-4 text-cyan-200 transition ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-cyan-300/25 bg-slate-950/95 py-1 shadow-lg shadow-cyan-950/60 backdrop-blur">
                    <div className="border-b border-cyan-400/15 px-4 py-2">
                      <p className="truncate font-medium text-cyan-50">{user.name}</p>
                      <p className="truncate text-xs text-cyan-200/70">{user.email}</p>
                    </div>
                    <Link href={getDashboardHref(user.role)} onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-cyan-100 hover:bg-cyan-300/10">
                      <LayoutDashboard className="h-4 w-4 text-cyan-300" /> {tr('myDashboard')}
                    </Link>
                    <Link href="/my-courses" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-cyan-100 hover:bg-cyan-300/10">
                      <BookOpen className="h-4 w-4 text-cyan-300" /> {tr('myCourses')}
                    </Link>
                    <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-cyan-100 hover:bg-cyan-300/10">
                      <Settings className="h-4 w-4 text-cyan-300" /> {tr('settings')}
                    </Link>
                    {user.role?.toLowerCase() === 'teacher' && (
                      <Link href="/teacher/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-cyan-100 hover:bg-cyan-300/10">
                        <LayoutDashboard className="h-4 w-4 text-cyan-300" /> {tr('teacherDashboard')}
                      </Link>
                    )}
                    <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/10">
                      <LogOut className="h-4 w-4" /> {tr('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="rounded-full border border-cyan-300/30 px-5 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/10">
                  {tr('logIn')}
                </Link>
                <button type="button" onClick={handleAskTutor} className="isit-btn-primary px-5 py-2 text-sm">
                  Try AI Tutor Now
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-30 md:hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute top-0 left-0 h-full w-full max-w-sm border-r border-cyan-400/20 bg-slate-950 px-4 py-6 shadow-xl">
            <nav className="flex flex-col gap-1 pt-4">
              {navLinks.map(({ href, labelKey, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-lg px-4 py-3 font-medium text-cyan-100 hover:bg-cyan-300/10"
                >
                  {label ?? tr(labelKey as I18nKey)}
                </Link>
              ))}
              <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-cyan-300/20 px-4 py-3">
                <span className="w-full text-xs font-medium uppercase tracking-wide text-cyan-200/80">{tr('language')}</span>
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
              {user ? (
                <>
                  <div className="mt-2 border-t border-cyan-300/20 px-4 py-2">
                    <p className="truncate text-sm font-medium text-cyan-100">{user.name}</p>
                    <p className="truncate text-xs text-cyan-200/75">{user.email}</p>
                  </div>
                  <Link href={getDashboardHref(user.role)} onClick={() => setMobileNavOpen(false)} className="rounded-lg px-4 py-3 font-medium text-cyan-100 hover:bg-cyan-300/10">
                    {tr('myDashboard')}
                  </Link>
                  <Link href="/my-courses" onClick={() => setMobileNavOpen(false)} className="rounded-lg px-4 py-3 font-medium text-cyan-100 hover:bg-cyan-300/10">
                    {tr('myCourses')}
                  </Link>
                  <Link href="/settings" onClick={() => setMobileNavOpen(false)} className="rounded-lg px-4 py-3 font-medium text-cyan-100 hover:bg-cyan-300/10">
                    {tr('settings')}
                  </Link>
                  {user.role?.toLowerCase() === 'teacher' && (
                    <Link href="/teacher/dashboard" onClick={() => setMobileNavOpen(false)} className="rounded-lg px-4 py-3 font-medium text-cyan-100 hover:bg-cyan-300/10">
                      {tr('teacherDashboard')}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileNavOpen(false);
                    }}
                    className="w-full rounded-lg px-4 py-3 text-left font-medium text-red-300 hover:bg-red-500/10"
                  >
                    {tr('logout')}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    handleAskTutor();
                  }}
                  className="mx-4 mt-4 block w-[calc(100%-2rem)] rounded-lg bg-cyan-400 py-3 text-center font-semibold text-slate-950"
                >
                  Try AI Tutor Now
                </button>
              )}
            </nav>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleAskTutor}
        disabled={loading || openingTutor}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-slate-900/90 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-lg shadow-cyan-900/40 backdrop-blur transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Bot className="h-4 w-4 text-cyan-300" />
        {openingTutor ? 'Opening Tutor...' : 'Ask AI Tutor'}
      </button>
    </>
  );
}
