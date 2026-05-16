'use client';

import type { ReactNode } from 'react';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';

type PublicNavActive = NonNullable<React.ComponentProps<typeof PublicNav>['active']>;

type SiteShellProps = {
  children: ReactNode;
  variant?: 'public' | 'app' | 'auth' | 'bare';
  active?: PublicNavActive;
  showFooter?: boolean;
  className?: string;
  contentClassName?: string;
};

function SiteGlows({ subtle }: { subtle?: boolean }) {
  return (
    <>
      <div
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(99,102,241,0.22),transparent)] ${subtle ? 'opacity-70' : ''}`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-40 top-1/3 h-[420px] w-[420px] rounded-full bg-cyan-500/5 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/4 h-[360px] w-[360px] rounded-full bg-fuchsia-600/5 blur-3xl"
        aria-hidden
      />
    </>
  );
}

export default function SiteShell({
  children,
  variant = 'bare',
  active,
  showFooter = true,
  className = '',
  contentClassName = '',
}: SiteShellProps) {
  const isPublic = variant === 'public';
  const isApp = variant === 'app';

  return (
    <div
      className={`relative min-h-screen overflow-hidden isit-cosmic-bg text-slate-200 ${isApp ? 'flex' : ''} ${className}`.trim()}
    >
      <SiteGlows subtle={variant === 'auth'} />
      {isPublic && <PublicNav active={active} />}
      <div
        className={`relative z-10 ${isApp ? 'flex min-h-screen min-w-0 w-full flex-1' : ''} ${contentClassName}`.trim()}
      >
        {children}
      </div>
      {isPublic && showFooter && <Footer />}
    </div>
  );
}
