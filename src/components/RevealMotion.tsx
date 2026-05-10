'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type RevealOnViewProps = {
  children: ReactNode;
  className?: string;
  /** Extra wait after intersect before animating (ms) */
  delayMs?: number;
  once?: boolean;
};

/**
 * Fades/slides content up when it enters the viewport. Respects prefers-reduced-motion.
 */
export function RevealOnView({ children, className = '', delayMs = 0, once = true }: RevealOnViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActive(true);
      return;
    }

    const ob = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(true);
            if (once) ob.disconnect();
            break;
          }
        }
      },
      { root: null, rootMargin: '0px 0px -6% 0px', threshold: 0.05 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={`isit-reveal-block ${active ? 'isit-reveal-block-visible' : ''} ${className}`.trim()}
      style={active ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}

type RevealStaggerProps = {
  children: ReactNode;
  className?: string;
};

/** Staggers direct children when the block scrolls into view. */
export function RevealStagger({ children, className = '' }: RevealStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActive(true);
      return;
    }

    const ob = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(true);
            ob.disconnect();
            break;
          }
        }
      },
      { root: null, rootMargin: '0px 0px -5% 0px', threshold: 0.06 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  return (
    <div ref={ref} className={`isit-reveal-stagger ${active ? 'isit-reveal-stagger-visible' : ''} ${className}`.trim()}>
      {children}
    </div>
  );
}
