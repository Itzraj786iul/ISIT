'use client';

import { useCallback, useLayoutEffect, useState } from 'react';
import {
  THEME_STORAGE_KEY,
  type ThemeMode,
  applyThemeClass,
} from '@/lib/theme';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    const initial = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    setThemeState(initial);
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    applyThemeClass(next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      applyThemeClass(next);
      return next;
    });
  }, []);

  return { theme, setTheme, toggleTheme, mounted };
}
