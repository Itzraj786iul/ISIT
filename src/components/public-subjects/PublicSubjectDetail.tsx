'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SiteShell from '@/components/SiteShell';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';
import {
  AlertCircle,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  GraduationCap,
  Layers,
  ListTodo,
  Lock,
  Play,
  Sparkles,
} from 'lucide-react';
import { useT } from '@/lib/t';
import { usePublicSubjectsT } from '@/lib/use-public-subjects-t';
import type { PublicSubject, PublicTopic } from './types';
import { SUBJECT_CARD_GRADIENTS } from './types';

type Props = {
  subjectId: string;
};

function difficultyBadge(level?: string) {
  if (!level) return null;
  const l = String(level).toLowerCase();
  const colors =
    l === 'beginner'
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
      : l === 'intermediate'
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors}`}>{level}</span>
  );
}

export default function PublicSubjectDetail({ subjectId }: Props) {
  const tr = usePublicSubjectsT();
  const trGlobal = useT();
  const [subject, setSubject] = useState<PublicSubject | null>(null);
  const [topics, setTopics] = useState<PublicTopic[]>([]);
  const [related, setRelated] = useState<PublicSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!subjectId) return;
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const [subjectRes, topicsRes, allRes] = await Promise.all([
          fetch(`/api/subjects/${subjectId}`, { cache: 'no-store' }),
          fetch(`/api/topics?subjectId=${encodeURIComponent(subjectId)}`, { cache: 'no-store' }),
          fetch('/api/subjects', { cache: 'no-store' }),
        ]);
        if (!mounted) return;

        if (!subjectRes.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const subjectJson = (await subjectRes.json()) as { success?: boolean; data?: PublicSubject };
        if (!subjectJson.success || !subjectJson.data) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const current = subjectJson.data;
        setSubject(current);

        if (topicsRes.ok) {
          const topicsJson = (await topicsRes.json()) as { success?: boolean; data?: PublicTopic[] };
          setTopics(Array.isArray(topicsJson?.data) ? topicsJson.data : []);
        } else {
          setTopics([]);
        }

        if (allRes.ok) {
          const allJson = (await allRes.json()) as { success?: boolean; data?: PublicSubject[] };
          const list = Array.isArray(allJson?.data) ? allJson.data : [];
          const peers = list
            .filter((s) => s._id !== subjectId)
            .filter((s) => s.grade === current.grade || s.board === current.board)
            .slice(0, 3);
          setRelated(peers.length > 0 ? peers : list.filter((s) => s._id !== subjectId).slice(0, 3));
        }
      } catch {
        if (mounted) setNotFound(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [subjectId]);

  const signupHref = `/signup?returnUrl=${encodeURIComponent(`/subject/${subjectId}`)}`;
  const loginHref = `/login?returnUrl=${encodeURIComponent(`/subject/${subjectId}`)}`;
  const totalMinutes = topics.reduce((sum, t) => sum + (t.estimated_time ?? 0), 0);

  const learningObjectives = useMemo(() => {
    const fromTopics = topics.flatMap((t) => t.learning_objectives ?? []).filter(Boolean);
    return [...new Set(fromTopics)].slice(0, 6);
  }, [topics]);

  const quickLinks = [
    { href: '/how-it-works', label: tr('publicSubjectsQuickHowItWorks'), icon: Sparkles },
    { href: '/ai-tutor', label: tr('publicSubjectsQuickAiTutor'), icon: Bot },
    { href: '/watch-demo', label: tr('publicSubjectsQuickWatchDemo'), icon: Play },
    { href: '/subjects', label: tr('publicSubjectBack'), icon: BookOpen },
  ] as const;

  return (
    <SiteShell active="subjects" variant="public">
      {/* Breadcrumb */}
      <div className="border-b border-[color:var(--isit-border)] bg-[var(--isit-surface-muted)]">
        <nav aria-label="Breadcrumb" className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 text-sm sm:px-6">
          <Link href="/" className="font-medium isit-accent-text hover:underline">
            {trGlobal('home')}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[color:var(--isit-text-muted)]" aria-hidden />
          <Link href="/subjects" className="font-medium isit-accent-text hover:underline">
            {trGlobal('subjects')}
          </Link>
          {!loading && subject ? (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[color:var(--isit-text-muted)]" aria-hidden />
              <span className="truncate font-medium isit-text-primary">{subject.name}</span>
            </>
          ) : null}
        </nav>
      </div>

      {loading ? (
        <div className="mx-auto max-w-7xl animate-pulse px-4 py-12 sm:px-6">
          <div className="card-surface h-40" />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="card-surface h-64 lg:col-span-2" />
            <div className="card-surface h-64" />
          </div>
        </div>
      ) : notFound || !subject ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
          <AlertCircle className="mb-4 h-12 w-12 isit-accent-text opacity-70" />
          <h1 className="text-xl font-bold isit-text-primary">{tr('publicSubjectNotFoundTitle')}</h1>
          <p className="mt-2 max-w-md text-sm isit-body">{tr('publicSubjectNotFoundLead')}</p>
          <Link href="/subjects" className="isit-btn-secondary mt-6 px-5 no-underline">
            ← {tr('publicSubjectBack')}
          </Link>
        </div>
      ) : (
        <>
          {/* Hero — light semantic tokens */}
          <section className="border-b border-[color:var(--isit-border)] bg-[var(--isit-bg)] pb-10 pt-8 sm:pb-12 sm:pt-10">
            <RevealOnView className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="flex flex-wrap gap-2">
                <span className="isit-chip">{subject.grade}</span>
                <span className="isit-chip">{subject.board}</span>
                {subject.academic_year ? (
                  <span className="isit-chip text-xs opacity-80">{subject.academic_year}</span>
                ) : null}
              </div>

              <h1 className="mt-4 text-3xl font-bold isit-text-primary sm:text-4xl lg:text-5xl">{subject.name}</h1>
              {subject.description ? (
                <p className="mt-4 max-w-3xl text-base leading-relaxed isit-body sm:text-lg">{subject.description}</p>
              ) : (
                <p className="mt-4 max-w-3xl text-base isit-body">{tr('publicSubjectsCardFallbackDesc')}</p>
              )}

              <div className="mt-6 flex flex-wrap gap-4 text-sm isit-body">
                <span className="inline-flex items-center gap-2">
                  <ListTodo className="h-4 w-4 isit-accent-text" />
                  {topics.length} {tr('publicSubjectTopicsLabel')}
                </span>
                {totalMinutes > 0 ? (
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 isit-accent-text" />
                    {totalMinutes} {tr('publicSubjectMinutesLabel')}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 isit-accent-text" />
                  {tr('publicSubjectAiTutorIncluded')}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {quickLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[color:var(--isit-border)] bg-[var(--isit-surface)] px-4 py-2 text-sm font-medium isit-text-secondary no-underline transition hover:border-sky-300"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </div>
            </RevealOnView>
          </section>

          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:gap-10">
              <div>
                {/* What you'll learn */}
                {learningObjectives.length > 0 ? (
                  <section className="card-surface mb-8 p-6">
                    <h2 className="text-lg font-bold isit-text-primary">{tr('publicSubjectWhatYouLearn')}</h2>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {learningObjectives.map((obj) => (
                        <li key={obj} className="flex items-start gap-2 text-sm isit-body">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <h2 className="flex items-center gap-2 text-xl font-bold isit-text-primary">
                  <Layers className="h-5 w-5 isit-accent-text" />
                  {tr('publicSubjectTopicsHeading')}
                </h2>
                <p className="mt-1 text-sm isit-body">{tr('publicSubjectTopicsLead')}</p>

                {topics.length === 0 ? (
                  <div className="card-surface mt-8 p-10 text-center">
                    <BookOpen className="mx-auto h-10 w-10 text-[color:var(--isit-text-muted)]" />
                    <p className="mt-2 text-sm isit-body">{tr('publicSubjectNoTopics')}</p>
                    <Link href="/how-it-works" className="isit-btn-secondary mt-4 inline-flex px-5 no-underline">
                      {tr('publicSubjectsQuickHowItWorks')}
                    </Link>
                  </div>
                ) : (
                  <RevealStagger className="mt-6 space-y-4">
                    {topics.map((topic, index) => (
                      <article key={topic._id} className="card-surface p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-950/60 dark:text-cyan-300">
                                {index + 1}
                              </span>
                              <h3 className="text-base font-bold isit-text-primary">{topic.topic_name}</h3>
                            </div>
                            {topic.topic_description ? (
                              <p className="mt-2 text-sm leading-relaxed isit-body">{topic.topic_description}</p>
                            ) : null}
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {difficultyBadge(topic.difficulty_level)}
                              {topic.estimated_time != null && topic.estimated_time > 0 ? (
                                <span className="inline-flex items-center gap-1 text-xs isit-body">
                                  <Clock className="h-3.5 w-3.5" />
                                  {topic.estimated_time} min
                                </span>
                              ) : null}
                            </div>
                            {topic.learning_objectives && topic.learning_objectives.length > 0 ? (
                              <ul className="mt-4 space-y-1.5">
                                {topic.learning_objectives.slice(0, 4).map((obj) => (
                                  <li key={obj} className="flex items-start gap-2 text-xs isit-body">
                                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                    {obj}
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                          <Link
                            href={signupHref}
                            className="isit-btn-secondary inline-flex shrink-0 items-center gap-1.5 self-start px-4 py-2.5 text-xs no-underline"
                          >
                            <Lock className="h-3.5 w-3.5" />
                            {tr('publicSubjectTopicSignIn')}
                          </Link>
                        </div>
                      </article>
                    ))}
                  </RevealStagger>
                )}
              </div>

              <aside className="lg:sticky lg:top-24 lg:self-start">
                <div className="card-surface border-sky-200/80 p-6 dark:border-cyan-500/25">
                  <GraduationCap className="h-8 w-8 isit-accent-text" />
                  <h3 className="mt-3 text-lg font-bold isit-text-primary">{tr('publicSubjectSignInTitle')}</h3>
                  <p className="mt-2 text-sm leading-relaxed isit-body">{tr('publicSubjectSignInLead')}</p>
                  <ul className="mt-4 space-y-2 text-xs isit-body">
                    {[tr('publicSubjectSidebarPoint1'), tr('publicSubjectSidebarPoint2'), tr('publicSubjectSidebarPoint3')].map(
                      (point) => (
                        <li key={point} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 isit-accent-text" />
                          {point}
                        </li>
                      )
                    )}
                  </ul>
                  <Link href={signupHref} className="isit-btn-primary mt-6 flex min-h-11 w-full items-center justify-center gap-2 no-underline">
                    <Bot className="h-4 w-4" />
                    {tr('publicSubjectSignInCta')}
                  </Link>
                  <Link
                    href={loginHref}
                    className="isit-btn-secondary mt-3 flex min-h-11 w-full items-center justify-center no-underline"
                  >
                    {tr('publicSubjectLoginCta')}
                  </Link>
                  <Link href="/ai-tutor" className="mt-3 block text-center text-xs font-medium isit-accent-text hover:underline">
                    {tr('publicSubjectsQuickAiTutor')} →
                  </Link>
                  <Link href="/subjects" className="mt-4 block text-center text-xs font-medium isit-accent-text hover:underline">
                    ← {tr('publicSubjectBack')}
                  </Link>
                </div>
              </aside>
            </div>
          </div>

          {/* Related subjects */}
          {related.length > 0 ? (
            <section className="border-t border-[color:var(--isit-border)] bg-[var(--isit-surface-muted)] py-12">
              <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <h2 className="text-xl font-bold isit-text-primary">{tr('publicSubjectRelatedTitle')}</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((s, index) => {
                    const gradient = SUBJECT_CARD_GRADIENTS[index % SUBJECT_CARD_GRADIENTS.length];
                    return (
                      <Link
                        key={s._id}
                        href={`/subjects/${s._id}`}
                        className="card-surface group flex overflow-hidden no-underline transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className={`h-full w-24 shrink-0 bg-gradient-to-br ${gradient}`} aria-hidden />
                        <div className="min-w-0 flex-1 p-4">
                          <span className="text-xs font-semibold isit-accent-text">{s.grade}</span>
                          <p className="mt-0.5 line-clamp-2 font-bold isit-text-primary group-hover:text-[color:var(--isit-accent)]">
                            {s.name}
                          </p>
                          <span className="mt-2 inline-flex items-center text-xs font-semibold isit-accent-text">
                            {tr('landingSubjectsViewDetails')}
                            <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-6 text-center">
                  <Link href="/subjects" className="isit-btn-secondary inline-flex px-6 no-underline">
                    {tr('publicSubjectBack')}
                  </Link>
                </div>
              </div>
            </section>
          ) : null}

          {/* Bottom CTA */}
          <section className="border-t border-[color:var(--isit-border)] py-14">
            <RevealOnView className="mx-auto max-w-3xl px-4 text-center sm:px-6">
              <h2 className="text-2xl font-bold isit-text-primary">{tr('publicSubjectsCtaTitle')}</h2>
              <p className="mt-3 text-sm isit-body">{tr('publicSubjectsCtaLead')}</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href={signupHref} className="isit-btn-primary px-8 py-3 no-underline">
                  {tr('publicSubjectSignInCta')}
                </Link>
                <Link href="/how-it-works" className="isit-btn-secondary px-8 py-3 no-underline">
                  {tr('publicSubjectsQuickHowItWorks')}
                </Link>
              </div>
            </RevealOnView>
          </section>
        </>
      )}
    </SiteShell>
  );
}
