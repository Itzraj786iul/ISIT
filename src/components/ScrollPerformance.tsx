'use client';

import { useEffect } from 'react';

const MOBILE_MQ = '(max-width: 1023px)';

/**
 * Sets `html.is-mobile` for global CSS that reduces decorative work on phones/tablets.
 * Scroll perf is handled in CSS (no runtime class toggling on scroll — that caused jank).
 */
export function ScrollPerformance() {
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const apply = () => {
      document.documentElement.classList.toggle('is-mobile', mq.matches);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => {
      mq.removeEventListener('change', apply);
      document.documentElement.classList.remove('is-mobile');
    };
  }, []);

  return null;
}
