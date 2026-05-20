'use client';

/**
 * Public marketing subject catalog at /subjects (no login).
 * Logged-in learners use /learn/subjects for org-scoped study list.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PublicSubjectsCatalog from '@/components/public-subjects/PublicSubjectsCatalog';

export default function SubjectsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    const role = user.role?.toLowerCase();
    if (role === 'teacher') {
      router.replace('/teacher/subjects');
      return;
    }
    if (role === 'admin') {
      router.replace('/organization');
      return;
    }
    if (role === 'parent') {
      router.replace('/parent/dashboard');
      return;
    }
    if (role === 'student') {
      router.replace('/learn/subjects');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="isit-app-bg flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="isit-app-bg flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  return <PublicSubjectsCatalog />;
}
