'use client';

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { friendlyHttpMessage, friendlyNetworkMessage, isLikelyNetworkError } from '@/lib/api-error-messages';

type Props = {
  error: unknown;
  status?: number;
  serverMessage?: string | null;
  title?: string;
  onRetry?: () => void;
  className?: string;
};

export default function ApiErrorState({
  error,
  status,
  serverMessage,
  title = 'We hit a snag',
  onRetry,
  className = '',
}: Props) {
  const message =
    error != null && isLikelyNetworkError(error)
      ? friendlyNetworkMessage()
      : typeof status === 'number'
        ? friendlyHttpMessage(status, serverMessage)
        : friendlyNetworkMessage();

  return (
    <div
      className={`flex flex-col items-center justify-center py-14 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm ${className}`}
      role="alert"
    >
      <AlertCircle className="w-12 h-12 text-amber-500 mb-4" aria-hidden />
      <p className="text-slate-900 dark:text-slate-100 font-semibold">{title}</p>
      <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 text-center max-w-md">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        {onRetry ? (
          <button type="button" onClick={onRetry} className="btn-primary min-h-11 px-6">
            Try again
          </button>
        ) : null}
        {status === 401 ? (
          <Link href="/login" className="btn-primary min-h-11 px-6 no-underline text-center">
            Sign in
          </Link>
        ) : null}
        {status === 403 ? (
          <Link href="/dashboard" className="btn-secondary min-h-11 px-6 no-underline text-center">
            Back to dashboard
          </Link>
        ) : null}
      </div>
    </div>
  );
}
