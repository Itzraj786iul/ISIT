'use client';

/**
 * Public nav — Part 1 IA: Learn → Discover → Catalog (legacy marketplace).
 * Profile links unchanged; copy clarifies roles and marketplace courses (docs/AI_FIRST_MIGRATION.md).
 */
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, User, LayoutDashboard, BookOpen, Settings, LogOut, ChevronDown, Bot, Sparkles, Layers } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/t';
import type { I18nKey } from '@/lib/t';

type PublicNavProps = {
  active?: 'home' | 'subjects' | 'courses' | 'how-it-works' | 'stories' | 'blog' | 'about-us';
};

type NavItem = {
  href: string;
  key: NonNullable<PublicNavProps['active']>;
  labelKey: I18nKey;
};

const NAV_GROUPS: { sectionKey: I18nKey; items: NavItem[] }[] = [
  {
    sectionKey: 'navSectionLearn',
    items: [
      { href: '/', key: 'home', labelKey: 'home' },
      { href: '/subjects', key: 'subjects', labelKey: 'subjects' },
      { href: '/how-it-works', key: 'how-it-works', labelKey: 'howItWorks' },
    ],
  },
  {
    sectionKey: 'navSectionDiscover',
    items: [
      { href: '/stories', key: 'stories', labelKey: 'stories' },
      { href: '/blog', key: 'blog', labelKey: 'blog' },
      { href: '/about-us', key: 'about-us', labelKey: 'aboutUs' },
    ],
  },
  {
    sectionKey: 'navSectionCatalog',
    items: [{ href: '/courses', key: 'courses', labelKey: 'courseCatalog' }],
  },
];

function getDashboardHref(role?: string) {
  const r = role?.toLowerCase();
  if (r === 'admin') return '/organization';
  if (r === 'teacher') return '/teacher/dashboard';
  if (r === 'parent') return '/parent/dashboard';
  return '/dashboard';
}

function roleHintKey(role?: string): I18nKey {
  const r = role?.toLowerCase();
  if (r === 'teacher') return 'roleTeacher';
  if (r === 'parent') return 'roleParent';
  if (r === 'admin') return 'roleAdmin';
  return 'roleStudent';
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

  const navLinkClass = (isActive: boolean) =>
    isActive ? 'border-b-2 border-cyan-300 pb-1 text-cyan-200' : 'text-slate-300 transition hover:text-cyan-200';

  return (
    <>
      <header className="isit-nav-enter sticky top-0 z-50 border-b border-cyan-400/15 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen((o) => !o)}
              className="shrink-0 rounded-lg p-2 text-cyan-100 transition hover:bg-cyan-300/10 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link
              href="/"
              className="flex min-w-0 items-center gap-2 sm:gap-3 text-cyan-100"
              title="Indian School of Innovation and Curiosity (ISIC)"
              aria-label="ISIC — Indian School of Innovation and Curiosity — Home"
            >
              <span className="animate-pulse-cyan flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/20 text-cyan-200">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="text-lg font-extrabold tracking-wide sm:text-xl">ISIC</span>
                <span className="hidden truncate text-[10px] font-medium uppercase tracking-wide text-cyan-300/75 sm:block">
                  Indian School of Innovation & Curiosity
                </span>
              </span>
              <span className="hidden max-w-[11rem] border-l border-cyan-400/25 pl-3 text-xs leading-snug text-cyan-200/70 xl:block">
                {tr('taglineShort')}
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-2 text-xs font-medium md:flex lg:gap-4 lg:text-sm" aria-label="Main">
            {NAV_GROUPS.map((group, gi) => (
              <div key={group.sectionKey} className="flex items-center gap-2 lg:gap-4">
                {gi > 0 && <span className="mx-0.5 h-4 w-px shrink-0 bg-cyan-400/25 lg:mx-1 lg:h-5" aria-hidden />}
                <div className="flex items-center gap-2 lg:gap-4">
                  {group.items.map(({ href, key, labelKey }) => (
                    <Link key={key} href={href} className={`shrink-0 whitespace-nowrap ${navLinkClass(active === key)}`}>
                      {tr(labelKey)}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 sm:gap-3 md:flex" ref={profileRef}>
            <ThemeToggle />
            <LanguageSwitcher />
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-cyan-200/30 bg-slate-900/70 py-2 pl-3 pr-2 text-sm font-medium text-cyan-100 transition hover:bg-slate-900"
                  aria-label="Profile menu"
                  aria-expanded={profileOpen}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/80 text-slate-950">
                    <User className="h-4 w-4" />
                  </span>
                  <span className="max-w-[100px] truncate lg:max-w-[120px]">{user.name || 'Profile'}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-cyan-200 transition ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-cyan-300/25 bg-slate-950/95 py-1 shadow-lg shadow-cyan-950/60 backdrop-blur">
                    <div className="border-b border-cyan-400/15 px-4 py-2">
                      <p className="truncate font-medium text-cyan-50">{user.name}</p>
                      <p className="truncate text-xs text-cyan-200/70">{user.email}</p>
                      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-cyan-300/90">{tr(roleHintKey(user.role))}</p>
                    </div>
                    <Link
                      href={getDashboardHref(user.role)}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-cyan-100 hover:bg-cyan-300/10"
                    >
                      <LayoutDashboard className="h-4 w-4 text-cyan-300" /> {tr('myDashboard')}
                    </Link>
                    <Link href="/subjects" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-cyan-100 hover:bg-cyan-300/10">
                      <Layers className="h-4 w-4 text-cyan-300" /> {tr('browseSubjects')}
                    </Link>
                    <Link href="/my-courses" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm text-cyan-100 hover:bg-cyan-300/10">
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 shrink-0 text-cyan-300" /> {tr('myCourses')}
                      </span>
                      <span className="mt-0.5 block pl-7 text-[11px] text-cyan-200/55">{tr('myCoursesMarketplaceHint')}</span>
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
                <Link href="/login" className="rounded-full border border-cyan-300/30 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/10 lg:px-5">
                  {tr('logIn')}
                </Link>
                <Link href="/signup" className="isit-btn-primary px-4 py-2 text-sm no-underline lg:px-5">
                  {tr('footerCta')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-30 md:hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute top-0 left-0 h-full w-full max-w-sm overflow-y-auto border-r border-cyan-400/20 bg-slate-950 px-4 py-6 shadow-xl">
            <nav className="flex flex-col gap-1 pt-4" aria-label="Mobile main">
              {NAV_GROUPS.map((group) => (
                <div key={group.sectionKey} className="mb-2">
                  <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-400/80">{tr(group.sectionKey)}</p>
                  <div className="flex flex-col gap-0.5">
                    {group.items.map(({ href, labelKey }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileNavOpen(false)}
                        className="rounded-lg px-4 py-2.5 font-medium text-cyan-100 hover:bg-cyan-300/10"
                      >
                        {tr(labelKey)}
                      </Link>
                    ))}
                  </div>
                </div>
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
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-cyan-300/90">{tr(roleHintKey(user.role))}</p>
                  </div>
                  <Link href={getDashboardHref(user.role)} onClick={() => setMobileNavOpen(false)} className="rounded-lg px-4 py-3 font-medium text-cyan-100 hover:bg-cyan-300/10">
                    {tr('myDashboard')}
                  </Link>
                  <Link href="/subjects" onClick={() => setMobileNavOpen(false)} className="rounded-lg px-4 py-3 font-medium text-cyan-100 hover:bg-cyan-300/10">
                    {tr('browseSubjects')}
                  </Link>
                  <Link href="/my-courses" onClick={() => setMobileNavOpen(false)} className="rounded-lg px-4 py-3 font-medium text-cyan-100 hover:bg-cyan-300/10">
                    <span className="block">{tr('myCourses')}</span>
                    <span className="mt-0.5 block text-xs text-cyan-200/55">{tr('myCoursesMarketplaceHint')}</span>
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
                <>
                  <div className="mt-4 flex flex-col gap-2 border-t border-cyan-300/20 px-4 pt-4">
                    <Link href="/login" onClick={() => setMobileNavOpen(false)} className="rounded-lg border border-cyan-300/30 py-3 text-center font-semibold text-cyan-100">
                      {tr('logIn')}
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileNavOpen(false)}
                      className="block rounded-lg bg-cyan-400 py-3 text-center font-semibold text-slate-950 no-underline"
                    >
                      {tr('footerCta')}
                    </Link>
                  </div>
                </>
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
        {openingTutor ? '…' : tr('askAiTutor')}
      </button>
    </>
  );
}
