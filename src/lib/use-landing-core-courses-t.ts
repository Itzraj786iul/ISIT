'use client';

import { useCallback } from 'react';
import { useLanguage } from '@/lib/language-context';
import { useT, type I18nKey } from '@/lib/t';
import { landingEn, landingHi } from '@/lib/i18n/landing';

export const LANDING_CORE_COURSES_KEYS = [
  'landingCoreEyebrow',
  'landingCoreCoursesTitle1',
  'landingCoreCoursesTitleAccent',
  'landingCoreCoursesLead',
  'landingCoreEnrollCta',
  'landingCourse1Lab',
  'landingCourse1Title',
  'landingCourse1Desc',
  'landingCourse2Lab',
  'landingCourse2Title',
  'landingCourse2Desc',
  'landingCourse3Lab',
  'landingCourse3Title',
  'landingCourse3Desc',
  'landingCourse4Lab',
  'landingCourse4Title',
  'landingCourse4Desc',
] as const;

export type LandingCoreCoursesKey = (typeof LANDING_CORE_COURSES_KEYS)[number];

/** Translator for core courses section — never surfaces raw key strings. */
export function useLandingCoreCoursesT() {
  const tr = useT();
  const { language } = useLanguage();
  const fallbackDict = language === 'hi' ? landingHi : landingEn;

  return useCallback(
    (key: LandingCoreCoursesKey) => {
      const fb = fallbackDict[key];
      const v = tr(key as I18nKey);
      if (typeof v === 'string' && v.length > 0 && v !== key) return v;
      return fb;
    },
    [tr, language]
  );
}
