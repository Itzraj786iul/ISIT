'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type RevealOnViewProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  once?: boolean;
};

type ObserverEntry = {
  onShow: () => void;
  once: boolean;
};

let sharedObserver: IntersectionObserver | null = null;
const observerEntries = new Map<Element, ObserverEntry>();

function getSharedObserver() {
  if (typeof window === 'undefined') return null;
  if (sharedObserver) return sharedObserver;

  sharedObserver = new IntersectionObserver(
    (records) => {
      for (const record of records) {
        const entry = observerEntries.get(record.target);
        if (!entry || !record.isIntersecting) continue;
        entry.onShow();
        if (entry.once) {
          sharedObserver?.unobserve(record.target);
          observerEntries.delete(record.target);
        }
      }
    },
    { root: null, rootMargin: '0px 0px 8% 0px', threshold: 0.08 }
  );

  return sharedObserver;
}

function observeElement(el: Element, onShow: () => void, once: boolean) {
  const observer = getSharedObserver();
  if (!observer) return () => {};

  observerEntries.set(el, { onShow, once });
  observer.observe(el);

  return () => {
    observer.unobserve(el);
    observerEntries.delete(el);
  };
}

/**
 * Fades/slides content up when it enters the viewport.
 * Uses one shared IntersectionObserver for all reveal blocks on the page.
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

    return observeElement(el, () => setVisible(true), once);
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

    return observeElement(el, () => setVisible(true), true);
  }, []);

  return (
    <div ref={ref} className={`isit-reveal-stagger ${visible ? 'isit-reveal-stagger-visible' : ''} ${className}`.trim()}>
      {children}
    </div>
  );
}
