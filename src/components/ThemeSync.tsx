'use client';

import { useEffect } from 'react';
import { applyThemeClass, getStoredTheme, getSystemTheme, THEME_STORAGE_KEY } from '@/lib/theme';

/** Keeps `html.dark` in sync with storage and system preference when no explicit choice. */
export default function ThemeSync() {
  useEffect(() => {
    const sync = () => {
      const stored = getStoredTheme();
      applyThemeClass(stored ?? getSystemTheme());
    };
    sync();

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystem = () => {
      if (!getStoredTheme()) applyThemeClass(getSystemTheme());
    };
    mq.addEventListener('change', onSystem);

    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY) sync();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      mq.removeEventListener('change', onSystem);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return null;
}
