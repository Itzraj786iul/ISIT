'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

type PublicNavProps = {
  active?: 'home' | 'courses' | 'how-it-works' | 'stories' | 'blog';
};

const navLinks = [
  { href: '/', label: 'Home', key: 'home' as const },
  { href: '/courses', label: 'Courses', key: 'courses' as const },
  { href: '/how-it-works', label: 'How it Works', key: 'how-it-works' as const },
  { href: '/stories', label: 'Stories', key: 'stories' as const },
  { href: '/blog', label: 'Blog', key: 'blog' as const },
];

export default function PublicNav({ active }: PublicNavProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen((o) => !o)}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-lg"
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
                className={active === key ? 'text-black border-b-2 border-sky-500 pb-1' : 'hover:text-sky-500 transition'}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <span className="text-sm text-gray-500">LAN ▾</span>
            <Link href="/signup" className="bg-black text-white px-5 py-2 rounded-full text-sm hover:bg-gray-800 transition">
              Sign Up
            </Link>
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
                  className="px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-slate-100"
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/signup"
                onClick={() => setMobileNavOpen(false)}
                className="mx-4 mt-4 py-3 rounded-lg font-medium text-center bg-black text-white"
              >
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
