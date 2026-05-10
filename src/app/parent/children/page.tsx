'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Plus, ChevronRight, Trash2 } from 'lucide-react';
import { fetchChildren, removeChild, type ParentChild } from '@/lib/parent-children';
import EmptyState from '@/components/EmptyState';

function ChildrenListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-[4.5rem] rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 animate-pulse shadow-sm"
        />
      ))}
    </div>
  );
}

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren().then((kids) => {
      setChildren(kids);
      setLoading(false);
    });
  }, []);

  const handleRemove = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from your list? You can add them again later.`)) return;
    const ok = await removeChild(id);
    if (ok) setChildren((prev) => prev.filter((c) => c.id !== id));
    else alert('Failed to remove child. Please try again.');
  };

  if (loading) {
    return (
      <div className="max-w-3xl min-w-0 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="h-9 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-11 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
        <ChildrenListSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-3xl min-w-0 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Children</h1>
        <Link
          href="/parent/children/add"
          className="btn-primary min-h-11 px-5 gap-2 no-underline w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4 shrink-0" /> Add Child
        </Link>
      </div>

      {children.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No children linked yet"
          description="Add your child's name and email to link their account and follow their learning progress from your parent dashboard."
          primaryAction={{ label: 'Add your first child', href: '/parent/children/add' }}
          secondaryAction={{ label: 'Parent dashboard', href: '/parent/dashboard' }}
        />
      ) : (
        <ul className="space-y-3">
          {children.map((c) => (
            <li key={c.id}>
              <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm min-w-0">
                <div className="w-11 h-11 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-violet-600 dark:text-violet-300 font-semibold shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{c.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{c.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/parent/children/${c.id}`}
                    className="inline-flex items-center gap-1 min-h-11 min-w-[44px] px-3 text-violet-600 dark:text-violet-400 text-sm font-medium hover:bg-violet-50 dark:hover:bg-violet-950/50 rounded-xl transition"
                  >
                    View progress <ChevronRight className="w-4 h-4 shrink-0" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(c.id, c.name)}
                    className="min-h-11 min-w-11 inline-flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition"
                    title="Remove"
                    aria-label={`Remove ${c.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
