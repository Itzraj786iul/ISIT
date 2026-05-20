'use client';

import dynamic from 'next/dynamic';
import SiteShell from '@/components/SiteShell';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/t';

const LandingHomeContent = dynamic(() => import('@/components/home/LandingHomeContent'), {
  loading: () => (
    <div className="isit-landing-replica min-h-[60vh] animate-pulse px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-12 max-w-xl rounded-xl bg-slate-200/80 dark:bg-slate-700/40" />
        <div className="h-6 max-w-lg rounded-lg bg-slate-100 dark:bg-slate-800/50" />
        <div className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800/40" />
      </div>
    </div>
  ),
});

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const tr = useT();

  const getDashboardHref = () => {
    const role = user?.role?.toLowerCase();
    if (role === 'admin') return '/organization';
    if (role === 'teacher') return '/teacher/dashboard';
    if (role === 'parent') return '/parent/dashboard';
    return '/dashboard';
  };

  const isAuthed = !authLoading && !!user;
  const primaryCtaHref = isAuthed ? getDashboardHref() : '/signup';
  const primaryCtaLabel = isAuthed ? tr('continueLearning') : tr('footerCta');

  return (
    <SiteShell active="home" variant="public">
      <LandingHomeContent
        authLoading={authLoading}
        isAuthed={isAuthed}
        primaryCtaHref={primaryCtaHref}
        primaryCtaLabel={primaryCtaLabel}
      />
    </SiteShell>
  );
}
