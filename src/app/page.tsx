'use client';

import SiteShell from '@/components/SiteShell';
import LandingHomeContent from '@/components/home/LandingHomeContent';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/t';

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
        tr={tr}
      />
    </SiteShell>
  );
}
