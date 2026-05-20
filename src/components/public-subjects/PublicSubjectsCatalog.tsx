'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SiteShell from '@/components/SiteShell';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';
import {
  BookOpen,
  Bot,
  ChevronRight,
  GraduationCap,
  Layers,
  Mail,
  Play,
  Search,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/t';
import { usePublicSubjectsT } from '@/lib/use-public-subjects-t';
import type { PublicSubject } from './types';
import { SUBJECT_CARD_GRADIENTS } from './types';

export default function PublicSubjectsCatalog() {
  const tr = usePublicSubjectsT();
  const trGlobal = useT();
  const { user, loading: authLoading } = useAuth();
  const [subjects, setSubjects] = useState<PublicSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [boardFilter, setBoardFilter] = useState('');

  useEffect(() => {
    let mounted = true;
    const params = new URLSearchParams();
    if (gradeFilter) params.set('grade', gradeFilter);
    if (boardFilter) params.set('board', boardFilter);
    const qs = params.toString();

    fetch(`/api/subjects${qs ? `?${qs}` : ''}`, { cache: 'no-store' })
      .then(async (res) => {
        const json = (await res.json()) as { success?: boolean; data?: PublicSubject[] };
        if (!mounted) return;
        if (res.ok && json.success && Array.isArray(json.data)) {
          setSubjects(json.data);
        } else {
          setSubjects([]);
        }
      })
      .catch(() => {
        if (mounted) setSubjects([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [gradeFilter, boardFilter]);

  const grades = useMemo(
    () => [...new Set(subjects.map((s) => s.grade).filter(Boolean))].sort(),
    [subjects]
  );
  const boards = useMemo(
    () => [...new Set(subjects.map((s) => s.board).filter(Boolean))].sort(),
    [subjects]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q) ||
        s.grade.toLowerCase().includes(q) ||
        s.board.toLowerCase().includes(q)
    );
  }, [subjects, search]);

  const dashboardHref =
    user?.role?.toLowerCase() === 'teacher'
      ? '/teacher/dashboard'
      : user?.role?.toLowerCase() === 'parent'
        ? '/parent/dashboard'
        : user?.role?.toLowerCase() === 'admin'
          ? '/organization'
          : '/dashboard';

  const quickLinks = [
    { href: '/how-it-works', label: tr('publicSubjectsQuickHowItWorks'), icon: Sparkles },
    { href: '/ai-tutor', label: tr('publicSubjectsQuickAiTutor'), icon: Bot },
    { href: '/signup', label: tr('publicSubjectsQuickSignup'), icon: GraduationCap },
    { href: '/watch-demo', label: tr('publicSubjectsQuickWatchDemo'), icon: Play },
  ] as const;

  const highlights = [
    {
      href: '/how-it-works',
      icon: BookOpen,
      title: tr('publicSubjectsHighlight1Title'),
      desc: tr('publicSubjectsHighlight1Desc'),
    },
    {
      href: '/subjects',
      icon: GraduationCap,
      title: tr('publicSubjectsHighlight2Title'),
      desc: tr('publicSubjectsHighlight2Desc'),
    },
    {
      href: '/ai-tutor',
      icon: Bot,
      title: tr('publicSubjectsHighlight3Title'),
      desc: tr('publicSubjectsHighlight3Desc'),
    },
  ] as const;

  const steps = [
    { n: '01', title: tr('publicSubjectsStep1Title'), desc: tr('publicSubjectsStep1Desc'), href: '/subjects' },
    { n: '02', title: tr('publicSubjectsStep2Title'), desc: tr('publicSubjectsStep2Desc'), href: '/signup' },
    { n: '03', title: tr('publicSubjectsStep3Title'), desc: tr('publicSubjectsStep3Desc'), href: '/how-it-works' },
  ] as const;

  const exploreMore = [
    { href: '/courses', label: tr('publicSubjectsExploreCourses'), icon: BookOpen },
    { href: '/stories', label: tr('publicSubjectsExploreStories'), icon: Users },
    { href: '/contact', label: tr('publicSubjectsExploreContact'), icon: Mail },
  ] as const;

  return (
    <SiteShell active="subjects" variant="public">
      {/* Breadcrumb */}
      <div className="border-b border-[color:var(--isit-border)] bg-[var(--isit-surface-muted)]">
        <nav aria-label="Breadcrumb" className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 text-sm sm:px-6">
          <Link href="/" className="font-medium isit-accent-text hover:underline">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[color:var(--isit-text-muted)]" aria-hidden />
          <span className="font-medium isit-text-primary">{trGlobal('subjects')}</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="border-b border-[color:var(--isit-border)] bg-[var(--isit-bg)] pb-10 pt-8 sm:pb-12 sm:pt-10">
        <RevealOnView className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <span className="isit-chip mx-auto inline-flex">
            <Layers className="h-3.5 w-3.5 text-sky-600 dark:text-cyan-300" />
            {tr('publicSubjectsEyebrow')}
          </span>
          <h1 className="mt-4 text-3xl font-bold isit-text-primary sm:text-4xl md:text-5xl">
            {tr('publicSubjectsHeroTitle1')}{' '}
            <span className="isit-gradient-text-strong">{tr('publicSubjectsHeroTitleAccent')}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base isit-body sm:text-lg">{tr('publicSubjectsHeroLead')}</p>

          <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--isit-text-muted)]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tr('publicSubjectsSearchPlaceholder')}
                className="isit-input w-full py-3.5 pl-12 pr-4 shadow-sm"
              />
            </div>
            {!authLoading && user ? (
              <Link href={dashboardHref} className="isit-btn-secondary shrink-0 px-5 no-underline">
                <Target className="h-4 w-4" />
                {tr('publicSubjectsGoToDashboard')}
              </Link>
            ) : (
              <Link href="/signup" className="isit-btn-primary shrink-0 px-6 no-underline">
                <Bot className="h-4 w-4" />
                {tr('publicSubjectSignInCta')}
              </Link>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="isit-input max-w-[10rem] py-2 text-sm"
              aria-label={tr('publicSubjectsFilterGrade')}
            >
              <option value="">{tr('publicSubjectsAllGrades')}</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <select
              value={boardFilter}
              onChange={(e) => setBoardFilter(e.target.value)}
              className="isit-input max-w-[10rem] py-2 text-sm"
              aria-label={tr('publicSubjectsFilterBoard')}
            >
              <option value="">{tr('publicSubjectsAllBoards')}</option>
              {boards.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {quickLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[color:var(--isit-border)] bg-[var(--isit-surface)] px-4 py-2 text-sm font-medium isit-text-secondary no-underline transition hover:border-sky-300 hover:text-[color:var(--isit-accent)]"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </RevealOnView>
      </section>

      {/* Highlight cards — linked */}
      <section className="border-b border-[color:var(--isit-border)] bg-[var(--isit-surface-muted)] py-8">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-3 sm:px-6">
          {highlights.map(({ href, icon: Icon, title, desc }) => (
            <Link
              key={href}
              href={href}
              className="card-surface block p-5 no-underline transition hover:border-sky-300 hover:shadow-md"
            >
              <Icon className="h-5 w-5 isit-accent-text" />
              <p className="mt-2 text-sm font-semibold isit-text-primary">{title}</p>
              <p className="mt-1 text-xs leading-relaxed isit-body">{desc}</p>
              <span className="mt-3 inline-flex items-center text-xs font-semibold isit-accent-text">
                {tr('landingSubjectsViewDetails')}
                <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Subject grid */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card-surface h-72 animate-pulse" aria-hidden />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card-surface mx-auto max-w-lg p-8 text-center">
              <BookOpen className="mx-auto h-12 w-12 isit-accent-text opacity-70" />
              <h2 className="mt-4 text-lg font-bold isit-text-primary">{tr('publicSubjectsEmptyTitle')}</h2>
              <p className="mt-2 text-sm isit-body">{tr('publicSubjectsEmptyLead')}</p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link href="/how-it-works" className="isit-btn-secondary px-5 no-underline">
                  {tr('publicSubjectsQuickHowItWorks')}
                </Link>
                <Link href="/signup" className="isit-btn-primary px-5 no-underline">
                  {tr('publicSubjectSignInCta')}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm isit-body">
                {tr('publicSubjectsResultsCount').replace('{count}', String(filtered.length))}
              </p>
              <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((subject, index) => {
                  const gradient = SUBJECT_CARD_GRADIENTS[index % SUBJECT_CARD_GRADIENTS.length];
                  return (
                    <Link
                      key={subject._id}
                      href={`/subjects/${subject._id}`}
                      className="card-surface group flex flex-col overflow-hidden no-underline transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg"
                    >
                      <div className={`relative h-32 bg-gradient-to-br ${gradient} p-4`}>
                        <span className="inline-flex rounded-full bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/95">
                          {subject.board}
                        </span>
                        <BookOpen className="absolute bottom-3 right-3 h-10 w-10 text-white/90 transition group-hover:scale-105" strokeWidth={1.2} />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <span className="text-xs font-semibold isit-accent-text">{subject.grade}</span>
                        <h2 className="mt-1 line-clamp-2 text-lg font-bold isit-text-primary group-hover:text-[color:var(--isit-accent)]">
                          {subject.name}
                        </h2>
                        <p className="mt-2 line-clamp-3 flex-1 text-sm isit-body">
                          {subject.description?.trim() || tr('publicSubjectsCardFallbackDesc')}
                        </p>
                        <span className="mt-4 inline-flex items-center text-sm font-semibold isit-accent-text">
                          {tr('publicSubjectsViewFullDetails')}
                          <ChevronRight className="ml-0.5 h-4 w-4 transition group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </RevealStagger>
            </>
          )}
        </div>
      </section>

      {/* How it works — 3 steps */}
      <section className="border-y border-[color:var(--isit-border)] bg-[var(--isit-surface-muted)] py-12 sm:py-16">
        <RevealOnView className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] isit-accent-text">
            {tr('publicSubjectsStepsEyebrow')}
          </p>
          <h2 className="mt-2 text-center text-2xl font-bold isit-text-primary sm:text-3xl">{tr('publicSubjectsStepsTitle')}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map(({ n, title, desc, href }) => (
              <Link key={n} href={href} className="card-surface block p-6 no-underline transition hover:shadow-md">
                <span className="text-3xl font-black text-sky-200 dark:text-cyan-900/80">{n}</span>
                <h3 className="mt-2 text-base font-bold isit-text-primary">{title}</h3>
                <p className="mt-2 text-sm isit-body">{desc}</p>
              </Link>
            ))}
          </div>
        </RevealOnView>
      </section>

      {/* Explore more */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-lg font-bold isit-text-primary">{tr('publicSubjectsExploreMoreTitle')}</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {exploreMore.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[color:var(--isit-border)] bg-[var(--isit-surface)] px-5 py-2.5 text-sm font-medium isit-text-secondary no-underline shadow-sm hover:border-sky-300"
              >
                <Icon className="h-4 w-4 isit-accent-text" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[color:var(--isit-border)] bg-[var(--isit-surface-muted)] py-14">
        <RevealOnView className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold isit-text-primary sm:text-3xl">{tr('publicSubjectsCtaTitle')}</h2>
          <p className="mt-3 text-sm isit-body sm:text-base">{tr('publicSubjectsCtaLead')}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="isit-btn-primary px-8 py-3 no-underline">
              {tr('publicSubjectSignInCta')}
            </Link>
            <Link href="/how-it-works" className="isit-btn-secondary px-8 py-3 no-underline">
              {trGlobal('howItWorks')}
            </Link>
          </div>
        </RevealOnView>
      </section>
    </SiteShell>
  );
}
