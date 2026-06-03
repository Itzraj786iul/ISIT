'use client';

import { useCallback } from 'react';
import { useLanguage } from '@/lib/language-context';
import { useT, type I18nKey } from '@/lib/t';
import { coreCoursesDetailEn, coreCoursesDetailHi, type CoreCourseDetailKey } from '@/lib/i18n/core-courses-detail';

export function useCoreCourseDetailT() {
  const tr = useT();
  const { language } = useLanguage();
  const fallbackDict = language === 'hi' ? coreCoursesDetailHi : coreCoursesDetailEn;

  return useCallback(
    (key: CoreCourseDetailKey) => {
      const fb = fallbackDict[key];
      const v = tr(key as I18nKey);
      if (typeof v === 'string' && v.length > 0 && v !== key) return v;
      return fb;
    },
    [tr, language]
  );
}
