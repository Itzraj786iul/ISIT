'use client';

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { setAppLanguage, type Language } from '@/lib/i18n/bind';

export const LANGUAGE_STORAGE_KEY = 'isit-language';
const LEGACY_LOCALE_KEY = 'isit-locale';

export type { Language };

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const v = localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? localStorage.getItem(LEGACY_LOCALE_KEY);
    if (v === 'hi' || v === 'en') return v;
  } catch {
    /* ignore */
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useLayoutEffect(() => {
    const lang = readStoredLanguage();
    setLanguageState(lang);
    setAppLanguage(lang);
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
    try {
      if (!localStorage.getItem(LANGUAGE_STORAGE_KEY) && localStorage.getItem(LEGACY_LOCALE_KEY) === lang) {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setAppLanguage(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
