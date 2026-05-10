import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="isit-cosmic-bg min-h-screen flex flex-col items-center justify-center px-4 py-12 text-cyan-50 relative">
      <div className="isit-glass relative z-[1] max-w-md w-full rounded-3xl p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300/90 mb-2">Error 404</p>
        <h1 className="text-6xl sm:text-7xl font-bold text-cyan-300 mb-2">404</h1>
        <h2 className="text-xl font-bold text-cyan-50 mb-3">Page not found</h2>
        <p className="text-cyan-100/75 text-sm mb-8 leading-relaxed">
          The link may be outdated or the page was moved. Try the homepage or contact us if you need help finding something.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="isit-btn-primary inline-flex min-h-11 flex-1 items-center justify-center px-6 no-underline sm:flex-none">
            Go home
          </Link>
          <Link href="/contact" className="isit-btn-secondary inline-flex min-h-11 flex-1 items-center justify-center px-6 no-underline sm:flex-none">
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
