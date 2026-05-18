'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TeacherShell from '../_components/TeacherShell';
import { Star } from 'lucide-react';

type User = { _id?: string; name: string; role: string };

export default function TeacherReviewsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const run = async () => {
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!meRes.ok) { router.push('/login'); return; }
      const meData = await meRes.json();
      const userData = meData.user as User;
      if (!userData || userData.role?.toLowerCase() !== 'teacher') { router.push('/dashboard'); return; }
      setUser(userData);
    };
    run();
  }, [router]);

  return (
    <TeacherShell user={user}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-12 shadow-sm text-center">
          <Star className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800 mb-2">Reviews</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            Student reviews and ratings for your courses. This section will be available once the review system is implemented.
          </p>
        </div>
      </div>
    </TeacherShell>
  );
}
