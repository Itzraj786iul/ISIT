'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const SCROLL_IDLE_MS = 120;

const ScrollIdleContext = createContext(true);

export function ScrollIdleProvider({ children }: { children: ReactNode }) {
  const [idle, setIdle] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const onScroll = () => {
      setIdle(false);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setIdle(true);
        timer = null;
      }, SCROLL_IDLE_MS);
    };

    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('wheel', onScroll, { passive: true, capture: true });
    window.addEventListener('touchmove', onScroll, { passive: true, capture: true });

    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('wheel', onScroll, true);
      window.removeEventListener('touchmove', onScroll, true);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return <ScrollIdleContext.Provider value={idle}>{children}</ScrollIdleContext.Provider>;
}

/** True when the user is not actively scrolling (single shared listener). */
export function useScrollIdle() {
  return useContext(ScrollIdleContext);
}
