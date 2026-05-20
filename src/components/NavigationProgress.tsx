'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Lightweight top progress bar during client-side route transitions.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setActive(true);
    setWidth(12);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (tickRef.current) clearInterval(tickRef.current);

    tickRef.current = setInterval(() => {
      setWidth((w) => (w >= 88 ? w : w + Math.random() * 12));
    }, 140);

    timerRef.current = setTimeout(() => {
      if (tickRef.current) clearInterval(tickRef.current);
      setWidth(100);
      const done = setTimeout(() => {
        setActive(false);
        setWidth(0);
      }, 220);
      return () => clearTimeout(done);
    }, 420);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [pathname, searchParams]);

  if (!active && width === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-0.5 overflow-hidden"
      role="progressbar"
      aria-hidden
    >
      <div
        className="h-full w-full origin-left bg-gradient-to-r from-sky-500 via-cyan-400 to-violet-500 shadow-[0_0_12px_rgba(34,211,238,0.45)] transition-transform duration-200 ease-out will-change-transform"
        style={{ transform: `scaleX(${Math.max(0.001, width / 100)})` }}
      />
    </div>
  );
}
