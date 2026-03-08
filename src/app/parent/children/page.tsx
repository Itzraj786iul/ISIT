'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Plus, ChevronRight, Trash2 } from 'lucide-react';
import { getStoredChildren, removeStoredChild, type ParentChild } from '@/lib/parent-children';

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<ParentChild[]>([]);

  useEffect(() => {
    setChildren(getStoredChildren());
  }, []);

  const handleRemove = (id: string, name: string) => {
    if (!confirm(`Remove ${name} from your list? You can add them again later.`)) return;
    removeStoredChild(id);
    setChildren(getStoredChildren());
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Children</h1>
        <Link
          href="/parent/children/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-500 text-white rounded-xl text-sm font-medium hover:bg-violet-600 transition no-underline"
        >
          <Plus className="w-4 h-4" /> Add Child
        </Link>
      </div>

      {children.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 border-dashed p-10 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No children added yet</p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Add your child’s name and email to link their account and track their progress.
          </p>
          <Link
            href="/parent/children/add"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-violet-500 text-white rounded-xl text-sm font-medium hover:bg-violet-600 transition no-underline"
          >
            <Plus className="w-4 h-4" /> Add your first child
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {children.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm"
            >
              <div className="w-11 h-11 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold shrink-0">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800">{c.name}</p>
                <p className="text-sm text-slate-500 truncate">{c.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/parent/children/${c.id}`}
                  className="inline-flex items-center gap-1 px-3 py-2 text-violet-600 text-sm font-medium hover:bg-violet-50 rounded-lg transition"
                >
                  View progress <ChevronRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleRemove(c.id, c.name)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Remove"
                  aria-label={`Remove ${c.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
