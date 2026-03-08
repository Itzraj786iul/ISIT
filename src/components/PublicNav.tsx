'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, User, LayoutDashboard, BookOpen, Settings, LogOut, ChevronDown } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

type PublicNavProps = {
  active?: 'home' | 'courses' | 'how-it-works' | 'stories' | 'blog';
};

type LoggedInUser = { name?: string; email?: string; role?: string };

const navLinks = [
  { href: '/', label: 'Home', key: 'home' as const },
  { href: '/courses', label: 'Courses', key: 'courses' as const },
  { href: '/how-it-works', label: 'How it Works', key: 'how-it-works' as const },
  { href: '/stories', label: 'Stories', key: 'stories' as const },
  { href: '/blog', label: 'Blog', key: 'blog' as const },
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
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    localStorage.removeItem('user');
    setUser(null);
    setProfileOpen(false);
    router.push('/');
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen((o) => !o)}
              className="md:hidden p-2 -ml-2 text-slate-700 hover:text-slate-900 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" className="text-sky-500 font-bold text-lg sm:text-xl hover:text-sky-600">
              ISIT
            </Link>
          </div>

          <nav className="hidden md:flex gap-8 lg:gap-10 text-sm font-medium">
            {navLinks.map(({ href, label, key }) => (
              <Link
                key={key}
                href={href}
                className={active === key ? 'text-slate-900 border-b-2 border-sky-500 pb-1' : 'text-slate-700 hover:text-sky-600 transition'}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-6" ref={profileRef}>
            <LanguageSwitcher />
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 rounded-full pl-3 pr-2 py-2 text-sm font-medium text-slate-800 transition"
                  aria-label="Profile menu"
                >
                  <span className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </span>
                  <span className="max-w-[120px] truncate">{user.name || 'Profile'}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-medium text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <Link href={getDashboardHref(user.role)} onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><LayoutDashboard className="w-4 h-4 text-sky-500" /> My Dashboard</Link>
                    <Link href="/my-courses" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><BookOpen className="w-4 h-4 text-sky-500" /> My Courses</Link>
                    <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><Settings className="w-4 h-4 text-sky-500" /> Settings</Link>
                    {user.role?.toLowerCase() === 'teacher' && <Link href="/teacher/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><LayoutDashboard className="w-4 h-4 text-sky-500" /> Teacher Dashboard</Link>}
                    <button type="button" onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" /> Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-slate-700 hover:text-sky-600 text-sm font-medium transition">Log in</Link>
                <Link href="/signup" className="bg-black text-white px-5 py-2 rounded-full text-sm hover:bg-gray-800 transition">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-30 md:hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute top-0 left-0 w-full max-w-sm bg-white shadow-xl h-full py-6 px-4">
            <nav className="flex flex-col gap-1 pt-4">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileNavOpen(false)}
                  className="px-4 py-3 rounded-lg font-medium text-slate-700 hover:bg-slate-100"
                >
                  {label}
                </Link>
              ))}
              <div className="px-4 py-3 border-t border-slate-100 mt-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-2">Language</span>
                <LanguageSwitcher />
              </div>
              {user ? (
                <>
                  <div className="px-4 py-2 border-t border-slate-100 mt-2">
                    <p className="font-medium text-slate-800 text-sm truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <Link href={getDashboardHref(user.role)} onClick={() => setMobileNavOpen(false)} className="px-4 py-3 rounded-lg font-medium text-slate-700 hover:bg-slate-100">My Dashboard</Link>
                  <Link href="/my-courses" onClick={() => setMobileNavOpen(false)} className="px-4 py-3 rounded-lg font-medium text-slate-700 hover:bg-slate-100">My Courses</Link>
                  <Link href="/settings" onClick={() => setMobileNavOpen(false)} className="px-4 py-3 rounded-lg font-medium text-slate-700 hover:bg-slate-100">Settings</Link>
                  {user.role?.toLowerCase() === 'teacher' && <Link href="/teacher/dashboard" onClick={() => setMobileNavOpen(false)} className="px-4 py-3 rounded-lg font-medium text-slate-700 hover:bg-slate-100">Teacher Dashboard</Link>}
                  <button type="button" onClick={() => { handleLogout(); setMobileNavOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50">Logout</button>
                </>
              ) : (
                <Link href="/signup" onClick={() => setMobileNavOpen(false)} className="mx-4 mt-4 py-3 rounded-lg font-medium text-center bg-black text-white block">
                  Sign Up
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
