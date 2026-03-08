'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, BookOpen, Plus, ChevronRight, Sparkles } from 'lucide-react';
import { getStoredChildren } from '@/lib/parent-children';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function ParentDashboardPage() {
  const [userName, setUserName] = useState<string>('');
  const [children, setChildren] = useState<{ id: string; name: string; email: string }[]>([]);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (raw) {
      try {
        const u = JSON.parse(raw);
        setUserName(u.name || '');
      } catch {}
    }
    setChildren(getStoredChildren());
  }, []);

  const childCount = children.length;

  return (
    <div className="max-w-4xl">
      {/* Welcome */}
      <section className="mb-8">
        <div className="bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold">{getGreeting()}{userName ? `, ${userName.split(' ')[0]}` : ''}</h1>
          <p className="mt-2 text-violet-100 text-sm sm:text-base">
            Track your child’s learning and support their growth.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="font-semibold">{childCount} {childCount === 1 ? 'Child' : 'Children'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/parent/children"
            className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-violet-200 hover:shadow-md transition no-underline text-slate-800"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center group-hover:bg-violet-200 transition">
              <Users className="w-6 h-6 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">My Children</p>
              <p className="text-xs text-slate-500">View and manage linked accounts</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-violet-500 shrink-0" />
          </Link>
          <Link
            href="/parent/children/add"
            className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-violet-200 hover:shadow-md transition no-underline text-slate-800"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition">
              <Plus className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Add Child</p>
              <p className="text-xs text-slate-500">Link a child’s account</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 shrink-0" />
          </Link>
          <Link
            href="/courses"
            className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-sky-200 hover:shadow-md transition no-underline text-slate-800"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition">
              <BookOpen className="w-6 h-6 text-sky-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Browse Courses</p>
              <p className="text-xs text-slate-500">Find courses for your child</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-sky-500 shrink-0" />
          </Link>
        </div>
      </section>

      {/* Recent children / empty state */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Your children</h2>
        {children.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 border-dashed p-8 text-center">
            <Sparkles className="w-10 h-10 text-violet-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No children linked yet</p>
            <p className="text-sm text-slate-500 mt-1">Add your first child to start tracking their learning.</p>
            <Link
              href="/parent/children/add"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-violet-500 text-white rounded-xl text-sm font-medium hover:bg-violet-600 transition"
            >
              <Plus className="w-4 h-4" /> Add Child
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {children.slice(0, 3).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/parent/children/${c.id}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-violet-200 hover:shadow transition no-underline text-slate-800"
                >
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{c.name}</p>
                    <p className="text-xs text-slate-500 truncate">{c.email}</p>
                  </div>
                  <span className="text-violet-600 text-sm font-medium">View progress →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {children.length > 3 && (
          <Link href="/parent/children" className="inline-flex items-center gap-1 mt-3 text-violet-600 text-sm font-medium hover:underline">
            View all children <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </section>
    </div>
  );
}
