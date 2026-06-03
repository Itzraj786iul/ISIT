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
    let moving = false;
    let scrollIdleTimer: ReturnType<typeof setTimeout> | null = null;
    let scrolling = false;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const stopLoop = () => {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const tick = () => {
      if (!moving && !scrolling) {
        stopLoop();
        return;
      }
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (Math.abs(mx - rx) > 0.05 || Math.abs(my - ry) > 0.05) {
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      }
      raf = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (!raf && !document.hidden && !scrolling) {
        raf = window.requestAnimationFrame(tick);
      }
    };

    const onMove = (event: MouseEvent) => {
      mx = event.clientX;
      my = event.clientY;
      moving = true;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      startLoop();
    };

    const onScroll = () => {
      scrolling = true;
      stopLoop();
      if (scrollIdleTimer) clearTimeout(scrollIdleTimer);
      scrollIdleTimer = setTimeout(() => {
        scrolling = false;
        scrollIdleTimer = null;
        if (moving) startLoop();
      }, 150);
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else if (moving && !scrolling) startLoop();
    };

    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stopLoop();
      if (scrollIdleTimer) clearTimeout(scrollIdleTimer);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
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
