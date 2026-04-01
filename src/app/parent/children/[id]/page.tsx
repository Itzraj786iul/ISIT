'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, TrendingUp, Loader2 } from 'lucide-react';
import { fetchChildren, type ParentChild } from '@/lib/parent-children';

export default function ParentChildProgressPage() {
  const params = useParams();
  const id = params.id as string;
  const [child, setChild] = useState<ParentChild | null | undefined>(undefined);

  useEffect(() => {
    fetchChildren().then((kids) => {
      const found = kids.find((c) => c.id === id);
      setChild(found ?? null);
    });
  }, [id]);

  if (child === undefined) {
    return (
      <div className="max-w-2xl flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!child) {
    return (
      <div className="max-w-2xl">
        <p className="text-slate-500 mb-4">Child not found.</p>
        <Link href="/parent/children" className="text-violet-600 font-medium hover:underline">
          {"\u2190 Back to My Children"}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link href="/parent/children" className="inline-flex items-center gap-2 text-slate-600 hover:text-violet-600 text-sm font-medium mb-6 no-underline">
        <ArrowLeft className="w-4 h-4" /> Back to My Children
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xl">
          {child.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{child.name}</h1>
          <p className="text-slate-500 text-sm">{child.email}</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Progress overview</h2>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 text-slate-500">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            <p className="text-sm">
              Progress will appear here once your child signs in with <strong className="text-slate-700">{child.email}</strong> and starts learning.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Suggested for your child</h2>
        <Link href="/courses" className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-violet-200 hover:shadow transition no-underline text-slate-800">
          <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <p className="font-semibold">Browse courses</p>
            <p className="text-xs text-slate-500">Find courses for {child.name} to enroll in</p>
          </div>
          <span className="text-violet-600 text-sm font-medium ml-auto">{"Explore \u2192"}</span>
        </Link>
      </section>
    </div>
  );
}
