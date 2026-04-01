'use client';

import { useCallback } from 'react';
import { en } from '@/lib/i18n/en';
import { hi } from '@/lib/i18n/hi';
import { getAppLanguage, type Language } from '@/lib/i18n/bind';
import { useLanguage } from '@/lib/language-context';

export type I18nKey = keyof typeof en;

const dicts = { en, hi } as const;

/** Pure lookup: use `useT()` in components so the UI updates when language changes. */
export function translate(key: I18nKey, lang: Language): string {
  const row = dicts[lang];
  const val = row[key];
  if (typeof val === 'string' && val.length > 0) return val;
  const fallback = dicts.en[key];
  return typeof fallback === 'string' ? fallback : String(key);
}

/**
 * Current-app-language string from `getAppLanguage()` (kept in sync by `LanguageProvider`).
 * In React UI, prefer `useT()` so components re-render when language changes.
 */
export function t(key: string): string {
  if (key in en) return translate(key as I18nKey, getAppLanguage());
  return key;
}

/**
 * Reactive translator bound to the current language from `LanguageProvider`.
 */
export function useT(): (key: I18nKey) => string {
  const { language } = useLanguage();
  return useCallback((key: I18nKey) => translate(key, language), [language]);
}
