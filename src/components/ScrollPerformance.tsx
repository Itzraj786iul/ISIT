'use client';

import { useEffect } from 'react';

const MOBILE_MQ = '(max-width: 1023px)';
const SCROLL_IDLE_MS = 150;

/**
 * Sets performance classes on `<html>` without React re-renders:
 * - `is-mobile` — lighter decorative CSS on phones/tablets
 * - `is-scrolling` — pauses infinite animations while the user scrolls
 */
export function ScrollPerformance() {
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const applyMobile = () => {
      document.documentElement.classList.toggle('is-mobile', mq.matches);
    };
    applyMobile();
    mq.addEventListener('change', applyMobile);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return () => {
        mq.removeEventListener('change', applyMobile);
        document.documentElement.classList.remove('is-mobile');
      };
    }

    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const markScrolling = () => {
      document.documentElement.classList.add('is-scrolling');
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        document.documentElement.classList.remove('is-scrolling');
        idleTimer = null;
      }, SCROLL_IDLE_MS);
    };

    window.addEventListener('scroll', markScrolling, { passive: true, capture: true });
    window.addEventListener('wheel', markScrolling, { passive: true, capture: true });
    window.addEventListener('touchmove', markScrolling, { passive: true, capture: true });

    return () => {
      mq.removeEventListener('change', applyMobile);
      document.documentElement.classList.remove('is-mobile', 'is-scrolling');
      window.removeEventListener('scroll', markScrolling, true);
      window.removeEventListener('wheel', markScrolling, true);
      window.removeEventListener('touchmove', markScrolling, true);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  return null;
}
