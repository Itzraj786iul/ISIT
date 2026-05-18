'use client';

/** Parent dashboard links to @legacy MARKETPLACE_LMS /courses; consider /subjects for AI-first browsing. */
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Users, BookOpen, Plus, ChevronRight, Sparkles, Heart, Lightbulb, CheckCircle2 } from 'lucide-react';
import { fetchChildren, fetchChildInsights, type ParentChild, type ParentChildInsights } from '@/lib/parent-children';
import ParentAssignedLearningSection from '@/app/parent/_components/ParentAssignedLearningSection';
import { engagementLabel } from '@/lib/parent-child-insights';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function trendPhrase(t: ParentChildInsights['improvement_trend']): string {
  if (t === 'up') return 'More learning time than last week';
  if (t === 'down') return 'A quieter week than before';
  return 'About the same pace as last week';
}

export default function ParentDashboardPage() {
  const [userName, setUserName] = useState<string>('');
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [insights, setInsights] = useState<ParentChildInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (meRes.ok) {
        const meData = await meRes.json();
        setUserName(meData.user?.name || '');
      }
      const kids = await fetchChildren();
      setChildren(kids);
      if (kids.length > 0) {
        setSelectedChildId((prev) => (prev && kids.some((k) => k.id === prev) ? prev : kids[0].id));
      } else {
        setSelectedChildId(null);
      }
      setLoading(false);
    };
    run();
  }, []);

  useEffect(() => {
    if (!selectedChildId) {
      setInsights(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setInsightsLoading(true);
      const data = await fetchChildInsights(selectedChildId);
      if (!cancelled) {
        setInsights(data);
        setInsightsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedChildId]);

  const selectedChild = useMemo(
    () => children.find((c) => c.id === selectedChildId) ?? null,
    [children, selectedChildId]
  );

  const childCount = children.length;

  return (
    <div className="max-w-4xl">
      <section className="mb-8">
        <div className="bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold">{getGreeting()}{userName ? `, ${userName.split(' ')[0]}` : ''}</h1>
          <p className="mt-2 text-violet-100 text-sm sm:text-base">
            {"Track your child's learning and support their growth."}
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="font-semibold">{childCount} {childCount === 1 ? 'Child' : 'Children'}</span>
            </div>
          </div>
        </div>
      </section>

      {!loading && children.length > 0 && (
        <section className="mb-8" aria-label="Learning insights">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-slate-800">How they are doing</h2>
            {children.length > 1 && (
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Choose child">
                {children.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={selectedChildId === c.id}
                    onClick={() => setSelectedChildId(c.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedChildId === c.id
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'bg-white text-slate-600 dark:text-slate-300 border border-slate-200 hover:border-violet-200'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {insightsLoading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              Gathering a gentle snapshot…
            </div>
          )}

          {!insightsLoading && insights && selectedChild && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xl shrink-0">
                    {selectedChild.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-slate-900">{insights.child_name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{trendPhrase(insights.improvement_trend)}</p>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Overall progress</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">
                          {insights.linked_account ? `${insights.avg_mastery}%` : '—'}
                        </p>
                        {!insights.linked_account && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Shows once they learn with this account</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">This week</p>
                        <p className="text-lg font-semibold text-slate-900 mt-1">
                          {insights.recent_activity === 0
                            ? 'No sessions yet'
                            : `${insights.recent_activity} learning ${insights.recent_activity === 1 ? 'session' : 'sessions'}`}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{engagementLabel(insights.engagement_score)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <ParentAssignedLearningSection
                topics={insights.assigned_topics}
                variant="compact"
                linkedAccount={insights.linked_account}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-3">
                    <CheckCircle2 className="w-4 h-4" /> Strengths
                  </div>
                  {insights.strong_topics.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">We will highlight wins here as they learn.</p>
                  ) : (
                    <ul className="space-y-2">
                      {insights.strong_topics.map((t) => (
                        <li key={t} className="text-sm text-slate-800 pl-3 border-l-2 border-emerald-200">
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-3">
                    <Lightbulb className="w-4 h-4" /> Where a little help goes far
                  </div>
                  {insights.weak_topics.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No focus areas flagged yet—that is okay.</p>
                  ) : (
                    <ul className="space-y-2">
                      {insights.weak_topics.map((t) => (
                        <li key={t} className="text-sm text-slate-800 pl-3 border-l-2 border-amber-200">
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-rose-50/40 p-6 sm:p-7 shadow-sm">
                <div className="flex items-center gap-2 text-violet-800 font-semibold text-sm mb-3">
                  <Heart className="w-4 h-4" /> A note for you
                </div>
                <p className="text-slate-800 text-base leading-relaxed">{insights.ai_summary}</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h3 className="font-semibold text-slate-900 text-sm mb-3">Ways you can support</h3>
                <ul className="space-y-2">
                  {insights.action_suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-violet-500 shrink-0">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-center">
                <Link
                  href={`/parent/children/${selectedChild.id}`}
                  className="text-violet-600 text-sm font-medium hover:underline"
                >
                  Open full profile for {selectedChild.name}
                </Link>
              </p>
            </div>
          )}

          {!insightsLoading && !insights && selectedChildId && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-sm text-slate-500 dark:text-slate-400">
              We could not load insights right now. Please try again later.
            </div>
          )}
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/parent/children" className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-violet-200 hover:shadow-md transition no-underline text-slate-800">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center group-hover:bg-violet-200 transition">
              <Users className="w-6 h-6 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">My Children</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">View and manage linked accounts</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-violet-500 shrink-0" />
          </Link>
          <Link href="/parent/children/add" className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-violet-200 hover:shadow-md transition no-underline text-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition">
              <Plus className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Add Child</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{"Link a child's account"}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-emerald-500 shrink-0" />
          </Link>
          <Link href="/courses" className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-sky-200 hover:shadow-md transition no-underline text-slate-800">
            <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition">
              <BookOpen className="w-6 h-6 text-sky-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Browse Courses</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Find courses for your child</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-sky-500 shrink-0" />
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Your children</h2>
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
            <div className="h-5 bg-slate-100 rounded w-1/3 mb-3" />
            <div className="h-4 bg-slate-100 rounded w-1/2" />
          </div>
        ) : children.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 border-dashed p-8 text-center">
            <Sparkles className="w-10 h-10 text-violet-300 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-medium">No children linked yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add your first child to start tracking their learning.</p>
            <Link href="/parent/children/add" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-violet-500 text-white rounded-xl text-sm font-medium hover:bg-violet-600 transition">
              <Plus className="w-4 h-4" /> Add Child
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {children.slice(0, 3).map((c) => (
              <li key={c.id}>
                <Link href={`/parent/children/${c.id}`} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-violet-200 hover:shadow transition no-underline text-slate-800">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{c.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.email}</p>
                  </div>
                  <span className="text-violet-600 text-sm font-medium">{"View progress \u2192"}</span>
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
