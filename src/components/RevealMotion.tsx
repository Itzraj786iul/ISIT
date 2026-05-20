'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type RevealOnViewProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  once?: boolean;
};

/**
 * Fades/slides content up when it enters the viewport.
 * Content stays visible once revealed (no scroll-idle hiding).
 */
export function RevealOnView({ children, className = '', delayMs = 0, once = true }: RevealOnViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const ob = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            if (once) ob.disconnect();
            break;
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { root: null, rootMargin: '0px 0px 0px 0px', threshold: 0.08 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={`isit-reveal-block ${visible ? 'isit-reveal-block-visible' : ''} ${className}`.trim()}
      style={visible && delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}

type RevealStaggerProps = {
  children: ReactNode;
  className?: string;
};

export function RevealStagger({ children, className = '' }: RevealStaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const ob = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            ob.disconnect();
            break;
          }
        }
      },
      { root: null, rootMargin: '0px 0px 0px 0px', threshold: 0.08 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  return (
    <div ref={ref} className={`isit-reveal-stagger ${visible ? 'isit-reveal-stagger-visible' : ''} ${className}`.trim()}>
      {children}
    </div>
  );
}
