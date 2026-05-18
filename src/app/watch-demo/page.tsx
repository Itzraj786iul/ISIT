'use client';

import Link from 'next/link';
import { ArrowLeft, Play } from 'lucide-react';
import SiteShell from '@/components/SiteShell';

const DEMO_EMBED_URL = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL?.trim();

export default function WatchDemoPage() {
  return (
    <SiteShell variant="public">
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium isit-accent-text transition hover:text-slate-600 dark:text-cyan-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Watch the 90-second demo</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
          See how ISIC combines an adaptive AI tutor, curriculum-aligned practice, and insights for students, parents, and schools — in under two
          minutes.
        </p>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.1] bg-black/40 shadow-[0_0_60px_rgba(99,102,241,0.12)]">
          {DEMO_EMBED_URL ? (
            <div className="aspect-video w-full">
              <iframe
                title="ISIC product demo"
                src={DEMO_EMBED_URL}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-950 to-indigo-950/80 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 ring-2 ring-violet-400/30">
                <Play className="ml-1 h-8 w-8 fill-current" />
              </div>
              <p className="max-w-md text-sm text-slate-400">
                Add a hosted demo URL in{' '}
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-slate-600 dark:text-cyan-200">NEXT_PUBLIC_DEMO_VIDEO_URL</code> (YouTube embed, Loom,
                or similar) to show your video here.
              </p>
              <Link
                href="/how-it-works"
                className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
              >
                Read how it works
              </Link>
            </div>
          )}
        </div>
      </main>
    </SiteShell>
  );
}
