'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { addChild } from '@/lib/parent-children';

export default function ParentAddChildPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName) { setError("Please enter your child's name."); return; }
    if (!trimmedEmail) { setError("Please enter your child's email."); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) { setError('Please enter a valid email address.'); return; }

    setLoading(true);
    try {
      const result = await addChild({ name: trimmedName, email: trimmedEmail });
      if (result) {
        router.push('/parent/children');
      } else {
        setError('Failed to add child. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <Link href="/parent/children" className="inline-flex items-center gap-2 text-slate-600 hover:text-violet-600 text-sm font-medium mb-6 no-underline">
        <ArrowLeft className="w-4 h-4" /> Back to My Children
      </Link>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Add Child</h1>
      <p className="text-slate-600 text-sm mb-6">
        {"Add your child's name and email. You'll be able to track their progress once they sign in with this email."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">{error}</div>
        )}
        <div>
          <label htmlFor="child-name" className="block text-sm font-medium text-slate-700 mb-1.5">{"Child's name"}</label>
          <input id="child-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Riya" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" autoComplete="off" />
        </div>
        <div>
          <label htmlFor="child-email" className="block text-sm font-medium text-slate-700 mb-1.5">{"Child's email"}</label>
          <input id="child-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. riya@example.com" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" autoComplete="off" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="flex-1 py-3 bg-violet-500 text-white font-medium rounded-xl hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition">
            {loading ? 'Adding...' : 'Add Child'}
          </button>
          <Link href="/parent/children" className="py-3 px-4 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition no-underline text-center">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
