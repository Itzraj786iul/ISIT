'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/use-theme';

type Props = {
  className?: string;
  variant?: 'default' | 'ghost';
};

export function ThemeToggle({ className = '', variant = 'default' }: Props) {
  const { theme, toggleTheme, mounted } = useTheme();

  const base =
    variant === 'ghost'
      ? 'inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--isit-nav-text-muted)] transition hover:bg-[var(--isit-nav-hover-bg)] hover:text-[color:var(--isit-text)]'
      : 'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`${base} ${className}`}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {!mounted ? (
        <Sun className="h-4 w-4 opacity-50" aria-hidden />
      ) : theme === 'dark' ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
