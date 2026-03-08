'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const LOCALE_KEY = 'isit-locale';
const options = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी' },
];

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('en');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored && options.some((o) => o.value === stored)) setSelected(stored);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    setSelected(value);
    if (typeof window !== 'undefined') localStorage.setItem(LOCALE_KEY, value);
    setOpen(false);
  };

  const currentLabel = options.find((o) => o.value === selected)?.label ?? 'English';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition rounded-lg px-2 py-1.5 hover:bg-slate-100"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <span>{currentLabel}</span>
        <ChevronDown className={`w-4 h-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-1 min-w-[120px] bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50"
        >
          {options.map((opt) => (
            <li key={opt.value} role="option" aria-selected={selected === opt.value}>
              <button
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition ${
                  selected === opt.value ? 'bg-sky-50 text-sky-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
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
