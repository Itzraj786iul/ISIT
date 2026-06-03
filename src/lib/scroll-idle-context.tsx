'use client';

import { useSyncExternalStore, type ReactNode } from 'react';

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};

  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

function getSnapshot() {
  if (typeof document === 'undefined') return true;
  return !document.documentElement.classList.contains('is-scrolling');
}

function getServerSnapshot() {
  return true;
}

/** True when the user is not actively scrolling (reads `html.is-scrolling` from ScrollPerformance). */
export function useScrollIdle() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** @deprecated ScrollPerformance toggles `html.is-scrolling` — provider not required. */
export function ScrollIdleProvider({ children }: { children: ReactNode }) {
  return children;
}
