import Link from 'next/link';
import { ShieldOff } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <div className="isit-cosmic-bg min-h-screen text-cyan-50 flex flex-col items-center justify-center px-4 py-12 relative">
      <div className="isit-glass max-w-md w-full rounded-3xl p-8 text-center">
        <ShieldOff className="w-14 h-14 text-amber-400 mx-auto mb-4" aria-hidden />
        <h1 className="text-xl font-bold text-cyan-50 text-center">Access denied</h1>
        <p className="text-cyan-100/80 text-sm text-center mt-2 leading-relaxed">
          You do not have permission to view this page or resource.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
          <Link href="/dashboard" className="isit-btn-primary min-h-11 px-6 no-underline inline-flex items-center justify-center">
            Back to dashboard
          </Link>
          <Link href="/login" className="isit-btn-secondary min-h-11 px-6 no-underline inline-flex items-center justify-center">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
