'use client';

import ParentNav from '@/components/ParentNav';
import AppShellSkeleton from '@/components/AppShellSkeleton';
import { useRequireAuth } from '@/lib/use-require-auth';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { ready, loading } = useRequireAuth({ roles: ['parent'] });

  if (loading || !ready) {
    return <AppShellSkeleton variant="dashboard" />;
  }

  return (
    <div className="isit-app-bg relative flex min-h-screen overflow-x-hidden">
      <ParentNav />
      <main className="isit-app-main isit-app-main--with-nav-toggle">{children}</main>
    </div>
  );
}
