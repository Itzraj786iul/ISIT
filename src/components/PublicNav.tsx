'use client';

/**
 * Public marketing navbar — primary links + More menu, underline active state.
 */
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  User,
  LayoutDashboard,
  BookOpen,
  Settings,
  LogOut,
  ChevronDown,
  Bot,
  Layers,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
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

const MAIN_NAV: NavItem[] = [
  { href: '/', key: 'home', labelKey: 'home' },
  { href: '/subjects', key: 'subjects', labelKey: 'subjects' },
  { href: '/how-it-works', key: 'how-it-works', labelKey: 'howItWorks' },
  { href: '/courses', key: 'courses', labelKey: 'courses' },
  { href: '/stories', key: 'stories', labelKey: 'stories' },
  { href: '/blog', key: 'blog', labelKey: 'blog' },
  { href: '/about-us', key: 'about-us', labelKey: 'aboutUs' },
];

const PRIMARY_NAV = MAIN_NAV.slice(0, 4);
const MORE_NAV = MAIN_NAV.slice(4);

const MOBILE_NAV_GROUPS: { sectionKey: I18nKey; items: NavItem[] }[] = [
  { sectionKey: 'navSectionLearn', items: MAIN_NAV.slice(0, 3) },
  { sectionKey: 'navSectionDiscover', items: MAIN_NAV.slice(3, 6) },
  { sectionKey: 'navSectionCatalog', items: MAIN_NAV.slice(6) },
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

function navLinkClass(isActive: boolean) {
  return isActive ? 'isit-public-nav-link isit-public-nav-link-active' : 'isit-public-nav-link';
}

function isMoreNavActive(active?: PublicNavProps['active']) {
  return MORE_NAV.some((item) => item.key === active);
}

export default function PublicNav({ active }: PublicNavProps) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openingTutor, setOpeningTutor] = useState(false);
  const { user, loading, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const tr = useT();

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
      if (moreRef.current && !moreRef.current.contains(target)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileNavOpen]);

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

  const renderNavLinks = (items: NavItem[]) =>
    items.map(({ href, key, labelKey }) => (
      <Link key={key} href={href} className={navLinkClass(active === key)}>
        {tr(labelKey)}
      </Link>
    ));

  return (
    <>
      <header className="isit-nav-enter isit-public-nav sticky top-0 z-50">
        <div className="isit-public-nav-inner mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileNavOpen((o) => !o)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[color:var(--isit-nav-text-muted)] transition hover:bg-[var(--isit-nav-hover-bg)] hover:text-[color:var(--isit-text)] active:scale-95 lg:hidden"
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileNavOpen}
              aria-controls={hydrated ? 'isit-mobile-nav-drawer' : undefined}
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <BrandLogo variant="lockup" href="/" showWordmark={false} priority />
          </div>

          <nav className="isit-public-nav-rail" aria-label="Main">
            {renderNavLinks(PRIMARY_NAV)}
            <div className="isit-public-nav-more" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((o) => !o)}
                className={navLinkClass(isMoreNavActive(active))}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
              >
                {tr('navMore')}
                <ChevronDown className={`h-3.5 w-3.5 opacity-70 transition ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreOpen && (
                <div className="isit-public-nav-more-menu" role="menu">
                  {MORE_NAV.map(({ href, key, labelKey }) => (
                    <Link
                      key={key}
                      href={href}
                      role="menuitem"
                      className={navLinkClass(active === key)}
                      onClick={() => setMoreOpen(false)}
                    >
                      {tr(labelKey)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="isit-public-nav-actions" ref={profileRef}>
            <div className="isit-public-nav-util">
              <ThemeToggle variant="ghost" />
              <span className="isit-public-nav-util-divider" aria-hidden />
              <LanguageSwitcher compact />
            </div>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  className="isit-public-nav-profile"
                  aria-label="Profile menu"
                  aria-expanded={profileOpen}
                >
                  <span className="isit-public-nav-profile-avatar">
                    <User className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate">{user.name || 'Profile'}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[color:var(--isit-text-muted)] transition ${profileOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[color:var(--isit-border)] bg-[var(--isit-surface)] py-1 shadow-lg">
                    <div className="border-b border-[color:var(--isit-border)] px-4 py-3">
                      <p className="truncate font-semibold text-[color:var(--isit-text)]">{user.name}</p>
                      <p className="truncate text-xs text-[color:var(--isit-text-muted)]">{user.email}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide isit-accent-text">
                        {tr(roleHintKey(user.role))}
                      </p>
                    </div>
                    <ProfileMenuLinks user={user} onClose={() => setProfileOpen(false)} tr={tr} />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" /> {tr('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="isit-public-nav-cta-row">
                <Link href="/login" className="isit-public-nav-login">
                  {tr('logIn')}
                </Link>
                <Link href="/signup" className="isit-public-nav-cta no-underline">
                  {tr('startLearning')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {hydrated ? (
      <div
        className={`fixed inset-0 z-40 lg:hidden ${mobileNavOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!mobileNavOpen}
      >
        <div
          className={`isit-mobile-nav-overlay absolute inset-0 bg-black/55 ${mobileNavOpen ? 'is-open' : ''}`}
          onClick={() => setMobileNavOpen(false)}
          aria-hidden
        />
        <div
          id="isit-mobile-nav-drawer"
          className={`isit-mobile-nav-drawer absolute left-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-r border-[color:var(--isit-border)] bg-[var(--isit-bg)] shadow-2xl ${mobileNavOpen ? 'is-open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
            <div className="flex h-16 items-center justify-between gap-3 border-b border-[color:var(--isit-border)] px-4">
              <BrandLogo
                variant="lockup"
                href="/"
                showWordmark={false}
                onClick={() => setMobileNavOpen(false)}
              />
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl hover:bg-[var(--isit-nav-hover-bg)] active:scale-95"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile main">
              {MOBILE_NAV_GROUPS.map((group) => (
                <div key={group.sectionKey} className="mb-4">
                  <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--isit-text-muted)]">
                    {tr(group.sectionKey)}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {group.items.map(({ href, key, labelKey }) => (
                      <Link
                        key={key}
                        href={href}
                        onClick={() => setMobileNavOpen(false)}
                        className={navLinkClass(active === key)}
                      >
                        {tr(labelKey)}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="space-y-4 border-t border-[color:var(--isit-border)] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--isit-text-muted)]">
                  {tr('language')}
                </span>
                <div className="isit-public-nav-util">
                  <ThemeToggle variant="ghost" />
                  <span className="isit-public-nav-util-divider" aria-hidden />
                  <LanguageSwitcher compact />
                </div>
              </div>

              {user ? (
                <>
                  <div className="rounded-xl border border-[color:var(--isit-border)] bg-[var(--isit-surface-muted)] px-3 py-2.5">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-[color:var(--isit-text-muted)]">{user.email}</p>
                  </div>
                  <ProfileMenuLinks user={user} onClose={() => setMobileNavOpen(false)} tr={tr} mobile />
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileNavOpen(false);
                    }}
                    className="w-full rounded-xl py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
                  >
                    {tr('logout')}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileNavOpen(false)}
                    className="isit-btn-secondary w-full py-2.5 text-center text-sm no-underline"
                  >
                    {tr('logIn')}
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileNavOpen(false)}
                    className="isit-btn-primary w-full py-2.5 text-center text-sm no-underline"
                  >
                    {tr('footerCta')}
                  </Link>
                </div>
              )}
            </div>
        </div>
      </div>
      ) : null}

      {hydrated ? (
      <button
        type="button"
        onClick={handleAskTutor}
        disabled={loading || openingTutor}
        aria-label={tr('askAiTutor')}
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 inline-flex max-w-[calc(100vw-2rem)] min-h-11 items-center gap-2 rounded-full border border-[color:var(--isit-border)] bg-[var(--isit-surface)] px-3.5 py-2.5 text-sm font-semibold text-[color:var(--isit-text)] shadow-lg transition hover:bg-[var(--isit-surface-muted)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 sm:bottom-5 sm:right-5 sm:px-4 dark:border-cyan-400/25 dark:bg-slate-900/90 dark:text-cyan-100 dark:shadow-cyan-950/40 dark:hover:bg-slate-800"
      >
        <Bot className="h-4 w-4 shrink-0 isit-accent-text" aria-hidden />
        <span className="hidden min-[400px]:inline">{openingTutor ? '…' : tr('askAiTutor')}</span>
      </button>
      ) : null}
    </>
  );
}

type ProfileUser = { name?: string; email?: string; role?: string };

function ProfileMenuLinks({
  user,
  onClose,
  tr,
  mobile = false,
}: {
  user: ProfileUser;
  onClose: () => void;
  tr: (key: I18nKey) => string;
  mobile?: boolean;
}) {
  const itemClass = mobile
    ? 'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[color:var(--isit-text)] hover:bg-[var(--isit-nav-hover-bg)]'
    : 'flex items-center gap-2 px-4 py-2.5 text-sm text-[color:var(--isit-text-secondary)] hover:bg-[var(--isit-nav-hover-bg)] hover:text-[color:var(--isit-text)]';

  return (
    <>
      <Link href={getDashboardHref(user.role)} onClick={onClose} className={itemClass}>
        <LayoutDashboard className="h-4 w-4 isit-accent-text" /> {tr('myDashboard')}
      </Link>
      <Link href="/subjects" onClick={onClose} className={itemClass}>
        <Layers className="h-4 w-4 isit-accent-text" /> {tr('browseSubjects')}
      </Link>
      <Link href="/my-courses" onClick={onClose} className={itemClass}>
        <BookOpen className="h-4 w-4 isit-accent-text" /> {tr('myCourses')}
      </Link>
      <Link href="/settings" onClick={onClose} className={itemClass}>
        <Settings className="h-4 w-4 isit-accent-text" /> {tr('settings')}
      </Link>
      {user.role?.toLowerCase() === 'teacher' && (
        <Link href="/teacher/dashboard" onClick={onClose} className={itemClass}>
          <LayoutDashboard className="h-4 w-4 isit-accent-text" /> {tr('teacherDashboard')}
        </Link>
      )}
    </>
  );
}
