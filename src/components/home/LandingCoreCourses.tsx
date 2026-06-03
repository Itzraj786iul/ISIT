'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, Brain, ChevronRight, Lightbulb, Target } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useT } from '@/lib/t';
import { buildCoreCourses } from '@/lib/landing-content';
import { CORE_COURSE_BORDER_COLORS, CORE_COURSE_GRADIENTS } from '@/lib/core-courses-data';
import { useLandingCoreCoursesT } from '@/lib/use-landing-core-courses-t';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';

const CORE_COURSE_ICONS = [Brain, BookOpen, Lightbulb, Target] as const;

export default function LandingCoreCourses() {
  const tr = useLandingCoreCoursesT();
  const trGlobal = useT();
  const { language } = useLanguage();
  const courses = useMemo(() => buildCoreCourses(trGlobal), [trGlobal, language]);

  return (
    <section className="isit-landing-core-courses-section pb-16 sm:pb-24">
      <RevealOnView className="relative mx-auto max-w-7xl px-4 text-center sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-400">
          {tr('landingCoreEyebrow')}
        </p>
        <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.75rem]">
          <span className="inline-block whitespace-nowrap">
            {tr('landingCoreCoursesTitle1')}{' '}
            <span className="isit-gradient-text-strong">{tr('landingCoreCoursesTitleAccent')}</span>
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
          {tr('landingCoreCoursesLead')}
        </p>

        <RevealStagger className="mt-12 grid gap-6 text-left sm:grid-cols-2 xl:grid-cols-4">
          {courses.map((course, index) => {
            const Icon = CORE_COURSE_ICONS[index];
            return (
              <Link
                key={course.slug}
                href={course.href}
                className="isit-core-course-card group flex min-h-[17.5rem] flex-col rounded-3xl border p-5 transition hover:-translate-y-0.5 sm:min-h-[18.5rem] sm:p-6"
                style={{
                  background: CORE_COURSE_GRADIENTS[course.slug],
                  borderColor: CORE_COURSE_BORDER_COLORS[course.slug],
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="isit-core-course-card__lab inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                    {course.lab}
                  </span>
                  <span
                    className="isit-core-course-card__num text-3xl font-black tabular-nums sm:text-4xl"
                    aria-hidden
                  >
                    {course.n}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold leading-snug text-white">{course.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/75">{course.desc}</p>

                <div className="mt-5 flex items-end justify-between gap-3">
                  <span className="inline-flex items-center text-sm font-semibold text-sky-300">
                    {tr('landingCoreEnrollCta')}
                    <ChevronRight className="ml-0.5 h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                  <Icon
                    className="h-10 w-10 shrink-0 text-white/90 transition group-hover:scale-105 sm:h-11 sm:w-11"
                    strokeWidth={1.15}
                    aria-hidden
                  />
                </div>
              </Link>
            );
          })}
        </RevealStagger>
      </RevealOnView>
    </section>
  );
}
