'use client';

import { useCallback } from 'react';
import { useLanguage } from '@/lib/language-context';
import { useT, type I18nKey } from '@/lib/t';
import { landingEn, landingHi } from '@/lib/i18n/landing';

/** Keys used by the homepage / ai-tutor chat shell mock UI */
export const LANDING_TUTOR_MOCK_KEYS = [
  'landingTutorMockName',
  'landingTutorMockStatus',
  'landingTutorMockPowered',
  'landingTutorMockVoiceMode',
  'landingTutorMockGreeting',
  'landingTutorMockAudioCaption',
  'landingTutorMockUserMsg',
  'landingTutorMockReply',
  'landingTutorInputPlaceholder',
  'landingTutorSendAria',
  'landingTutorMicAria',
  'landingTutorMicHint',
] as const;

export type LandingTutorMockKey = (typeof LANDING_TUTOR_MOCK_KEYS)[number];

/** Translator for AI tutor mock UI — never surfaces raw key strings. */
export function useLandingTutorT() {
  const tr = useT();
  const { language } = useLanguage();
  const fallbackDict = language === 'hi' ? landingHi : landingEn;

  return useCallback(
    (key: LandingTutorMockKey) => {
      const fb = fallbackDict[key];
      const v = tr(key as I18nKey);
      if (typeof v === 'string' && v.length > 0 && v !== key) return v;
      return fb;
    },
    [tr, language]
  );
}
