'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { ScrollPerformance } from '@/components/ScrollPerformance';

const AnimatedCursor = dynamic(
  () => import('@/components/AnimatedCursor').then((m) => ({ default: m.AnimatedCursor })),
  { ssr: false }
);

const NavigationProgress = dynamic(
  () => import('@/components/NavigationProgress').then((m) => ({ default: m.NavigationProgress })),
  { ssr: false }
);

/** Non-critical UI loaded after first paint (cursor, route progress, scroll perf). */
export function ClientLayoutChrome() {
  return (
    <>
      <ScrollPerformance />
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <AnimatedCursor />
    </>
  );
}
