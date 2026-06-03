'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  BookOpen,
  Bot,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Lightbulb,
  Target,
} from 'lucide-react';
import SiteShell from '@/components/SiteShell';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';
import { useT } from '@/lib/t';
import { useLanguage } from '@/lib/language-context';
import { buildCoreCourses } from '@/lib/landing-content';
import { useLandingCoreCoursesT } from '@/lib/use-landing-core-courses-t';
import { useCoreCourseDetailT } from '@/lib/use-core-course-detail-t';
import { coreCourseDetailKeys } from '@/lib/i18n/core-courses-detail';
import { CORE_COURSE_GRADIENTS, getCoreCourseVisual, isCoreCourseSlug } from '@/lib/core-courses-data';

const ICONS = {
  'brain-lab': Brain,
  'learning-intelligence-lab': BookOpen,
  'creative-thinking-lab': Lightbulb,
  'action-exploration-lab': Target,
} as const;

export default function CoreCourseDetailView() {
  const params = useParams();
  const slugParam = params.slug as string;
  const trGlobal = useT();
  const trLanding = useLandingCoreCoursesT();
  const trDetail = useCoreCourseDetailT();
  const { language } = useLanguage();

  const allCourses = useMemo(() => buildCoreCourses(trGlobal), [trGlobal, language]);

  if (!isCoreCourseSlug(slugParam)) {
    return (
      <SiteShell variant="public" active="courses">
        <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
          <h1 className="text-2xl font-bold isit-text-primary">{trDetail('coreCourseDetailNotFoundTitle')}</h1>
          <p className="mt-3 text-sm isit-body">{trDetail('coreCourseDetailNotFoundLead')}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/" className="isit-btn-primary px-6 py-2.5 no-underline">
              {trGlobal('home')}
            </Link>
            <Link href="/courses" className="isit-btn-secondary px-6 py-2.5 no-underline">
              {trGlobal('courseCatalog')}
            </Link>
          </div>
        </div>
      </SiteShell>
    );
  }

  const course = allCourses.find((c) => c.slug === slugParam);
  const visual = getCoreCourseVisual(slugParam);
  if (!course || !visual) return null;

  const Icon = ICONS[slugParam];
  const detail = coreCourseDetailKeys(visual.detailPrefix);
  const related = allCourses.filter((c) => c.slug !== slugParam).slice(0, 3);

  return (
    <SiteShell variant="public" active="courses">
      <div className="border-b border-[color:var(--isit-border)] bg-[var(--isit-surface-muted)]">
        <nav aria-label="Breadcrumb" className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 text-sm sm:px-6">
          <Link href="/" className="font-medium isit-accent-text hover:underline">
            {trGlobal('home')}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[color:var(--isit-text-muted)]" aria-hidden />
          <Link href="/courses" className="font-medium isit-accent-text hover:underline">
            {trDetail('coreCourseDetailBreadcrumb')}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[color:var(--isit-text-muted)]" aria-hidden />
          <span className="font-medium isit-text-primary">{course.title}</span>
        </nav>
      </div>

      <section className="isit-core-course-detail-hero" style={{ background: CORE_COURSE_GRADIENTS[slugParam] }}>
        <RevealOnView className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs font-semibold text-white/90">
                {course.lab}
              </span>
              <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">{course.title}</h1>
              <p className="mt-4 text-base leading-relaxed text-white/85 sm:text-lg">{trDetail(detail.lead)}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm text-white/75">
                <Clock className="h-4 w-4" aria-hidden />
                {trDetail('coreCourseDetailFormatValue')}
              </div>
            </div>
            <Icon className="hidden h-28 w-28 text-white/20 lg:block" strokeWidth={1} aria-hidden />
          </div>
        </RevealOnView>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2 space-y-10">
            <RevealOnView>
              <h2 className="text-xl font-bold isit-text-primary sm:text-2xl">{trDetail('coreCourseDetailModulesTitle')}</h2>
              <ul className="mt-5 space-y-3">
                {detail.mods.map((key, i) => (
                  <li
                    key={key}
                    className="flex gap-3 rounded-xl border border-[color:var(--isit-border)] bg-[var(--isit-surface-muted)] p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sm font-bold text-sky-600 dark:text-cyan-400">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed isit-body sm:text-base">{trDetail(key)}</span>
                  </li>
                ))}
              </ul>
            </RevealOnView>

            <RevealOnView>
              <h2 className="text-xl font-bold isit-text-primary sm:text-2xl">{trDetail('coreCourseDetailOutcomesTitle')}</h2>
              <ul className="mt-5 space-y-3">
                {detail.outs.map((key) => (
                  <li key={key} className="flex items-start gap-3 text-sm isit-body sm:text-base">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
                    {trDetail(key)}
                  </li>
                ))}
              </ul>
            </RevealOnView>
          </div>

          <aside className="space-y-6">
            <RevealOnView className="isit-card rounded-2xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide isit-muted">{trDetail('coreCourseDetailWhoTitle')}</h3>
              <p className="mt-3 text-sm leading-relaxed isit-body">{trDetail(detail.who)}</p>
              <p className="mt-4 text-xs isit-muted">
                <span className="font-semibold">{trDetail('coreCourseDetailFormatLabel')}:</span>{' '}
                {trDetail('coreCourseDetailFormatValue')}
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link href="/signup" className="isit-btn-primary w-full justify-center py-3 no-underline">
                  {trDetail('coreCourseDetailEnrollCta')}
                </Link>
                <Link href="/ai-tutor" className="isit-btn-secondary w-full justify-center gap-2 py-3 no-underline">
                  <Bot className="h-4 w-4" />
                  {trDetail('coreCourseDetailAiTutorCta')}
                </Link>
              </div>
            </RevealOnView>
          </aside>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-[color:var(--isit-border)] bg-[var(--isit-surface-muted)] py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-xl font-bold isit-text-primary sm:text-2xl">{trDetail('coreCourseDetailRelatedTitle')}</h2>
            <RevealStagger className="mt-8 grid gap-5 sm:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={item.href}
                  className="isit-card group rounded-2xl p-5 transition hover:border-sky-300 dark:hover:border-cyan-400/30"
                >
                  <span className="text-xs font-semibold isit-accent-text">{item.lab}</span>
                  <h3 className="mt-2 font-bold isit-text-primary">{item.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm isit-body">{item.desc}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-semibold isit-accent-text">
                    {trLanding('landingCoreEnrollCta')}
                    <ChevronRight className="ml-0.5 h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </RevealStagger>
          </div>
        </section>
      ) : null}
    </SiteShell>
  );
}
