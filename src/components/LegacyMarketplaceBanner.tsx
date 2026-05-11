'use client';

/**
 * Course marketplace (`/courses`, paid `Course` / `Lesson`) is legacy.
 * AI-first learning: `/subjects` → topic → session. See docs/AI_FIRST_MIGRATION.md
 */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Info } from 'lucide-react';
import { useT } from '@/lib/t';

const DISMISS_KEY = 'isit_legacy_marketplace_banner_dismissed';

export default function LegacyMarketplaceBanner() {
  const tr = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(sessionStorage.getItem(DISMISS_KEY) !== '1');
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      role="note"
      className="mb-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 motion-safe-transition dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100"
    >
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-amber-900 dark:text-amber-100">{tr('legacyMarketplaceBannerTitle')}</p>
        <p className="mt-0.5 leading-snug text-amber-900/90 dark:text-amber-100/90">
          {tr('legacyMarketplaceBannerLine1')}{' '}
          {tr('legacyMarketplaceBannerLine2Before')}{' '}
          <Link href="/subjects" className="font-medium text-amber-800 underline hover:text-amber-950 dark:text-amber-200 dark:hover:text-amber-50">
            {tr('subjects')}
          </Link>
          {tr('legacyMarketplaceBannerLine2After')}
        </p>
      </div>
      <button
        type="button"
        aria-label={tr('legacyMarketplaceDismissAria')}
        className="shrink-0 rounded-lg p-1 text-amber-700 hover:bg-amber-100/80 dark:text-amber-300 dark:hover:bg-amber-900/50"
        onClick={() => {
          try {
            sessionStorage.setItem(DISMISS_KEY, '1');
          } catch {
            /* ignore */
          }
          setVisible(false);
        }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
