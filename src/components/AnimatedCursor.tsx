'use client';

import { useEffect, useState } from 'react';

export function AnimatedCursor() {
  const [enabled, setEnabled] = useState(false);
  const [dot, setDot] = useState({ x: -100, y: -100 });
  const [ring, setRing] = useState({ x: -100, y: -100 });
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updateEnabled = () => setEnabled(media.matches);
    updateEnabled();
    media.addEventListener('change', updateEnabled);
    return () => media.removeEventListener('change', updateEnabled);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;
    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;

    const onMove = (event: MouseEvent) => {
      mx = event.clientX;
      my = event.clientY;
      setDot({ x: mx, y: my });
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    const tick = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      setRing({ x: rx, y: ry });
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        className="isit-cursor-dot"
        style={{ transform: `translate3d(${dot.x}px, ${dot.y}px, 0)` }}
      />
      <div
        className={`isit-cursor-ring ${pressed ? 'is-pressed' : ''}`}
        style={{ transform: `translate3d(${ring.x}px, ${ring.y}px, 0)` }}
      />
    </>
  );
}
