'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Loader2, Heart, Lightbulb, CheckCircle2 } from 'lucide-react';
import { fetchChildren, fetchChildInsights, type ParentChild, type ParentChildInsights } from '@/lib/parent-children';
import ParentAssignedLearningSection from '@/app/parent/_components/ParentAssignedLearningSection';
import { engagementLabel } from '@/lib/parent-child-insights';

function trendPhrase(t: ParentChildInsights['improvement_trend']): string {
  if (t === 'up') return 'More learning time than last week';
  if (t === 'down') return 'A quieter week than before';
  return 'About the same pace as last week';
}

export default function ParentChildProgressPage() {
  const params = useParams();
  const id = params.id as string;
  const [child, setChild] = useState<ParentChild | null | undefined>(undefined);
  const [insights, setInsights] = useState<ParentChildInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    fetchChildren().then((kids) => {
      const found = kids.find((c) => c.id === id);
      setChild(found ?? null);
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setInsightsLoading(true);
      const data = await fetchChildInsights(id);
      if (!cancelled) {
        setInsights(data);
        setInsightsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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
        <p className="text-slate-500 dark:text-slate-400 mb-4">Child not found.</p>
        <Link href="/parent/children" className="text-violet-600 font-medium hover:underline">
          {"\u2190 Back to My Children"}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link href="/parent/children" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-violet-600 text-sm font-medium mb-6 no-underline">
        <ArrowLeft className="w-4 h-4" /> Back to My Children
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xl">
          {child.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{child.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{child.email}</p>
        </div>
      </div>

      <section className="mb-8" aria-label="Learning insights">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Learning snapshot</h2>
        {insightsLoading && (
          <div className="isit-app-panel rounded-xl p-6 text-slate-500 dark:text-slate-400 text-sm">Loading…</div>
        )}
        {!insightsLoading && insights && (
          <div className="space-y-5">
            <div className="isit-app-panel rounded-xl p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">This week</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">
                {insights.recent_activity === 0
                  ? 'No sessions yet'
                  : `${insights.recent_activity} learning ${insights.recent_activity === 1 ? 'session' : 'sessions'}`}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{trendPhrase(insights.improvement_trend)} · {engagementLabel(insights.engagement_score)}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">
                Overall progress:{' '}
                <span className="font-semibold text-slate-900">
                  {insights.linked_account ? `${insights.avg_mastery}%` : '—'}
                </span>
              </p>
            </div>

            <ParentAssignedLearningSection
              topics={insights.assigned_topics}
              variant="detailed"
              linkedAccount={insights.linked_account}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="isit-app-panel rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs mb-2">
                  <CheckCircle2 className="w-4 h-4" /> Strengths
                </div>
                {insights.strong_topics.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Highlights will appear with more learning.</p>
                ) : (
                  <ul className="text-sm text-slate-800 space-y-1">
                    {insights.strong_topics.map((t) => (
                      <li key={t}>• {t}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="isit-app-panel rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs mb-2">
                  <Lightbulb className="w-4 h-4" /> Extra support
                </div>
                {insights.weak_topics.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Nothing flagged yet.</p>
                ) : (
                  <ul className="text-sm text-slate-800 space-y-1">
                    {insights.weak_topics.map((t) => (
                      <li key={t}>• {t}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5">
              <div className="flex items-center gap-2 text-violet-800 font-semibold text-xs mb-2">
                <Heart className="w-4 h-4" /> For you
              </div>
              <p className="text-slate-800 text-sm leading-relaxed">{insights.ai_summary}</p>
            </div>

            <div className="isit-app-panel rounded-xl p-4">
              <h3 className="font-semibold text-slate-900 text-sm mb-2">Support ideas</h3>
              <ul className="text-sm text-slate-700 space-y-1">
                {insights.action_suggestions.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {!insightsLoading && !insights && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Insights are unavailable. Try again later.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Suggested for your child</h2>
        <Link href="/courses" className="flex items-center gap-4 p-4 isit-app-panel rounded-xl shadow-sm hover:border-violet-200 hover:shadow transition no-underline text-slate-800">
          <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <p className="font-semibold">Browse courses</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Find courses for {child.name} to enroll in</p>
          </div>
          <span className="text-violet-600 text-sm font-medium ml-auto">{"Explore \u2192"}</span>
        </Link>
      </section>
    </div>
  );
}
