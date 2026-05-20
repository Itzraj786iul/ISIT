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
  const isAuth = variant === 'auth';

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden isit-app-bg ${isApp ? 'flex' : ''} ${isAuth ? 'flex flex-col' : ''} ${className}`.trim()}
    >
      {isPublic && <PublicNav active={active} />}
      <div
        className={`relative z-10 ${isPublic ? 'isit-public-content' : ''} ${isApp ? 'flex min-h-screen min-w-0 w-full flex-1' : ''} ${contentClassName}`.trim()}
      >
        {children}
      </div>
      {isPublic && showFooter && <Footer />}
    </div>
  );
}
