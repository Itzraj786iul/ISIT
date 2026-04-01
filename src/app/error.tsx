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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Something Went Wrong</h2>
        <p className="text-gray-500 mb-8">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        <button
          onClick={reset}
          className="inline-block bg-sky-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-sky-600 transition cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
