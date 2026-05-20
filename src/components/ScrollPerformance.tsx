'use client';

import { useEffect } from 'react';
import { useMobileHtmlClass } from '@/lib/use-is-mobile';

const SCROLL_CLASS = 'is-scrolling';
const IDLE_MS = 100;

/**
 * Toggles `html.is-scrolling` only during real scroll (not wheel-hover).
 * Used solely to pause decorative CSS animations — no blur/visibility changes.
 */
export function ScrollPerformance() {
  useMobileHtmlClass();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let scrolling = false;

    const setScrolling = (on: boolean) => {
      if (scrolling === on) return;
      scrolling = on;
      document.documentElement.classList.toggle(SCROLL_CLASS, on);
    };

    const onScroll = () => {
      setScrolling(true);
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setScrolling(false);
        idleTimer = null;
      }, IDLE_MS);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (idleTimer) clearTimeout(idleTimer);
      setScrolling(false);
    };
  }, []);

  return null;
}
