'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TeacherShell from '../_components/TeacherShell';
import { DollarSign } from 'lucide-react';

type User = { _id?: string; name: string; role: string };

export default function TeacherEarningsPage() {
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
        <div className="isit-app-panel rounded-xl p-12 shadow-sm text-center">
          <DollarSign className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800 mb-2">Earnings</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            Track your revenue and payouts. This section will be available in a future update when payment processing is integrated.
          </p>
        </div>
      </div>
    </TeacherShell>
  );
}
