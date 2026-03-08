'use client';

import Link from 'next/link';
import { TrendingUp, ArrowLeft } from 'lucide-react';

export default function TeacherAnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/teacher/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-sky-600 text-sm font-medium mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center">
          <TrendingUp className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800 mb-2">Analytics</h1>
          <p className="text-slate-500 text-sm">Course performance and engagement metrics. This section will be available in a future update.</p>
        </div>
      </div>
    </div>
  );
}
