'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled page error:', error);
  }, [error]);

  return (
    <div className="isit-app-bg min-h-screen flex flex-col items-center justify-center px-4 relative">
      <div className="isit-glass max-w-md w-full rounded-3xl p-8 text-center">
        <div
          className="w-16 h-16 rounded-2xl border border-red-400/30 bg-red-950/40 text-red-300 flex items-center justify-center mx-auto mb-6"
          aria-hidden
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold isit-text-primary mb-3">Something went wrong</h2>
        <p className="/75 text-sm mb-8 leading-relaxed">
          An unexpected error occurred. You can try again, or return home if the problem persists.
        </p>
        <button type="button" onClick={reset} className="isit-btn-primary w-full min-h-11 cursor-pointer border-0">
          Try again
        </button>
        <p className="mt-6 text-xs text-slate-600 dark:text-cyan-200/55">
          If this keeps happening, email{' '}
          <a href="mailto:hello@isic.in" className="text-sky-600 dark:text-cyan-300 underline-offset-2 hover:underline">
            hello@isic.in
          </a>{' '}
          with what you were doing.
        </p>
      </div>
    </div>
  );
}
