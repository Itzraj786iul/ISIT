'use client';

/**
 * Course marketplace (`/courses`, paid `Course` / `Lesson`) is legacy.
 * AI-first learning: `/subjects` → topic → session. See docs/AI_FIRST_MIGRATION.md
 */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Info } from 'lucide-react';

const DISMISS_KEY = 'isit_legacy_marketplace_banner_dismissed';

export default function LegacyMarketplaceBanner() {
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
      className="mb-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 motion-safe-transition"
    >
      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-amber-900">Course marketplace (legacy)</p>
        <p className="text-amber-900/90 mt-0.5 leading-snug">
          Paid courses here are the older catalog. For AI-guided learning by subject and topic, use{' '}
          <Link href="/subjects" className="font-medium text-amber-800 underline hover:text-amber-950">
            Subjects
          </Link>
          .
        </p>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        className="p-1 rounded-lg text-amber-700 hover:bg-amber-100/80 shrink-0"
        onClick={() => {
          try {
            sessionStorage.setItem(DISMISS_KEY, '1');
          } catch {
            /* ignore */
          }
          setVisible(false);
        }}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
