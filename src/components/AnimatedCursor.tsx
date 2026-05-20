'use client';

import { useEffect, useRef, useState } from 'react';

export function AnimatedCursor() {
  const [enabled, setEnabled] = useState(false);
  const [pressed, setPressed] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateEnabled = () => setEnabled(media.matches && !reduced.matches);
    updateEnabled();
    media.addEventListener('change', updateEnabled);
    reduced.addEventListener('change', updateEnabled);
    return () => {
      media.removeEventListener('change', updateEnabled);
      reduced.removeEventListener('change', updateEnabled);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;
    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const onMove = (event: MouseEvent) => {
      mx = event.clientX;
      my = event.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (Math.abs(mx - rx) > 0.05 || Math.abs(my - ry) > 0.05) {
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      }
      raf = window.requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      } else if (!document.documentElement.classList.contains('is-scrolling')) {
        raf = window.requestAnimationFrame(tick);
      }
    };

    const onScrollState = () => {
      const scrolling = document.documentElement.classList.contains('is-scrolling');
      if (scrolling) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      } else if (!document.hidden && !raf) {
        raf = window.requestAnimationFrame(tick);
      }
    };

    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    if (!document.documentElement.classList.contains('is-scrolling')) {
      raf = window.requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('visibilitychange', onVisibility);

    const scrollObs = new MutationObserver(onScrollState);
    scrollObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      window.cancelAnimationFrame(raf);
      scrollObs.disconnect();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="isit-cursor-layer" aria-hidden>
      <div ref={dotRef} className="isit-cursor-dot" />
      <div ref={ringRef} className={`isit-cursor-ring ${pressed ? 'is-pressed' : ''}`} />
    </div>
  );
}
