'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, GraduationCap } from 'lucide-react';
import { useT } from '@/lib/t';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';

type Subject = {
  _id: string;
  name: string;
  grade: string;
  board: string;
  description?: string;
};

const CARD_GRADIENTS = [
  'from-violet-600 to-purple-400',
  'from-blue-600 to-cyan-400',
  'from-orange-500 to-fuchsia-500',
  'from-emerald-500 to-teal-400',
  'from-sky-600 to-indigo-600',
  'from-rose-500 to-amber-400',
  'from-teal-600 to-emerald-400',
  'from-fuchsia-600 to-pink-500',
] as const;

const pillGhost =
  'inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-cyan-400/30 dark:hover:text-cyan-200';

export default function LandingPublishedSubjects() {
  const tr = useT();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch('/api/subjects', { cache: 'no-store' })
      .then(async (res) => {
        const json = (await res.json()) as { success?: boolean; data?: Subject[] };
        if (!mounted) return;
        if (res.ok && json.success && Array.isArray(json.data)) {
          setSubjects(json.data.slice(0, 8));
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
  }, []);

  return (
    <section className="py-16 sm:py-24">
      <RevealOnView className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-400/90">{tr('landingLearnEyebrow')}</p>
        <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
          {tr('landingLearnTitle1')}{' '}
          <span className="isit-gradient-text-strong">{tr('landingLearnTitleAccent')}</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">{tr('landingLearnLead')}</p>

        {loading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 dark:border-white/[0.06] dark:bg-[#0a0c14]"
              />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <p className="mt-12 text-sm text-slate-500 dark:text-slate-400">{tr('landingSubjectsEmpty')}</p>
        ) : (
          <RevealStagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map((subject, index) => {
              const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
              const desc =
                typeof subject.description === 'string' && subject.description.trim()
                  ? subject.description.trim()
                  : `${subject.grade} · ${subject.board}`;
              return (
                <Link
                  key={subject._id}
                  href={`/subjects/${subject._id}`}
                  className="group block overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 text-left transition hover:border-sky-300 dark:border-white/[0.06] dark:bg-[#0a0c14] dark:hover:border-cyan-400/20"
                >
                  <div className={`relative h-36 bg-gradient-to-br ${gradient} px-4 pt-4`}>
                    <BookOpen className="absolute bottom-3 left-1/2 h-12 w-12 -translate-x-1/2 text-white/95" strokeWidth={1.15} />
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                        {subject.grade}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                        {subject.board}
                      </span>
                    </div>
                    <h3 className="mt-3 line-clamp-2 text-lg font-bold text-slate-900 dark:text-white">{subject.name}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{desc}</p>
                    <span className="mt-4 inline-flex items-center text-sm font-medium text-sky-600 dark:text-cyan-400">
                      {tr('landingSubjectsViewDetails')}
                      <ChevronRight className="ml-0.5 h-4 w-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </RevealStagger>
        )}

        {!loading && subjects.length > 0 && (
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/subjects" className={pillGhost}>
              <GraduationCap className="h-4 w-4" />
              {tr('landingSubjectsViewAll')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </RevealOnView>
    </section>
  );
}
