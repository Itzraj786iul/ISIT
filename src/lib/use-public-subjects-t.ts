'use client';

import { useCallback } from 'react';
import { useLanguage } from '@/lib/language-context';
import { useT, type I18nKey } from '@/lib/t';
import { publicSubjectsEn, publicSubjectsHi, type PublicSubjectsI18nKey } from '@/lib/i18n/public-subjects';

/** Translator for public subjects pages with guaranteed fallback strings. */
export function usePublicSubjectsT() {
  const tr = useT();
  const { language } = useLanguage();
  const fallbackDict = language === 'hi' ? publicSubjectsHi : publicSubjectsEn;

  return useCallback(
    (key: PublicSubjectsI18nKey) => {
      const fb = fallbackDict[key];
      const v = tr(key as I18nKey);
      if (typeof v === 'string' && v.length > 0 && v !== key) return v;
      return fb;
    },
    [tr, language]
  );
}
