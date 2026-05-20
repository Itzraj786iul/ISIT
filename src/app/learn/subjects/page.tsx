'use client';

import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/use-require-auth';
import StudentSubjectsCatalog from '@/components/public-subjects/StudentSubjectsCatalog';

type User = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  organization_id?: string;
};

export default function LearnSubjectsPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="isit-cosmic-bg flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const role = user.role?.toLowerCase();
  if (role === 'teacher') {
    router.replace('/teacher/subjects');
    return null;
  }
  if (role === 'admin') {
    router.replace('/organization');
    return null;
  }
  if (role === 'parent') {
    router.replace('/parent/dashboard');
    return null;
  }

  return <StudentSubjectsCatalog user={user as User} />;
}
