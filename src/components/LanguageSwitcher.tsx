'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage, type Language } from '@/lib/use-language';

const options: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी' },
];

type LanguageSwitcherProps = {
  /** Minimal styling for the public navbar utility row */
  compact?: boolean;
};

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: Language) => {
    setLanguage(value);
    setOpen(false);
  };

  const currentLabel = options.find((o) => o.value === language)?.label ?? 'English';
  const compactLabel = language === 'hi' ? 'हि' : 'EN';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          compact
            ? 'inline-flex h-8 min-w-[2.25rem] items-center justify-center gap-0.5 rounded-full px-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--isit-nav-text-muted)] transition hover:bg-[var(--isit-nav-hover-bg)] hover:text-[color:var(--isit-text)]'
            : 'inline-flex min-h-10 items-center gap-1 rounded-xl border border-[color:var(--isit-border)] bg-[var(--isit-surface)] px-2.5 py-2 text-sm font-medium text-[color:var(--isit-text-secondary)] shadow-sm transition hover:bg-[var(--isit-surface-muted)] hover:text-[color:var(--isit-text)]'
        }
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <span>{compact ? compactLabel : currentLabel}</span>
        <ChevronDown className={`w-4 h-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-1 min-w-[120px] bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 dark:bg-slate-800 dark:border-slate-600"
        >
          {options.map((opt) => (
            <li key={opt.value} role="option" aria-selected={language === opt.value}>
              <button
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition ${
                  language === opt.value
                    ? 'bg-sky-50 text-sky-700 font-medium dark:bg-sky-900/40 dark:text-sky-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
