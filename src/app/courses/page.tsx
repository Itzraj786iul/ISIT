'use client';

import SiteShell from '@/components/SiteShell';
/**
 * @legacy MARKETPLACE_LMS — Course catalog (GET /api/courses). Prefer /subjects for AI-first learning.
 * Migration: docs/AI_FIRST_MIGRATION.md
 */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, BookOpen, ChevronRight } from 'lucide-react';
import LegacyMarketplaceBanner from '@/components/LegacyMarketplaceBanner';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';
import { useT } from '@/lib/t';

type Course = {
  _id: string;
  title: string;
  description: string;
  price: number;
  level?: string;
  category?: string;
  lessons?: { _id: string }[];
  lessonCount?: number;
  createdAt?: string;
};

export default function CoursesPage() {
  const tr = useT();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErrorKind, setLoadErrorKind] = useState<'http' | 'network' | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced' | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price'>('popular');

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadErrorKind(null);
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : []);
        } else {
          setLoadErrorKind('http');
        }
      } catch {
        setLoadErrorKind('network');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const categoryOptions = useMemo(() => {
    const s = new Set<string>();
    courses.forEach((c) => {
      if (c.category) s.add(c.category);
    });
    const sorted = [...s].sort();
    return sorted.length > 0 ? sorted : ['Development', 'Design', 'Business', 'Marketing', 'Photography', 'Music'];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    let list = courses.slice();
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q) ||
          (c.category || '').toLowerCase().includes(q)
      );
    }
    if (selectedCategories.length > 0) {
      list = list.filter((c) => selectedCategories.includes(c.category || ''));
    }
    list = list.filter((c) => (c.price ?? 0) <= maxPrice);
    if (difficulty) {
      list = list.filter((c) => (c.level || 'Beginner') === difficulty);
    }
    if (sortBy === 'newest') {
      list.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
    } else if (sortBy === 'price') {
      list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    }
    return list;
  }, [courses, searchQuery, selectedCategories, maxPrice, difficulty, sortBy]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setMaxPrice(50000);
    setSelectedCategories([]);
    setDifficulty(null);
    setSortBy('popular');
  };

  const loadErrorMessage =
    loadErrorKind === 'network' ? tr('catalogNetworkError') : loadErrorKind === 'http' ? tr('catalogLoadError') : null;

  const isNewCourse = (createdAt?: string) =>
    createdAt && Date.now() - new Date(createdAt).getTime() < 30 * 24 * 60 * 60 * 1000;

  return (
    <SiteShell variant="public" active="courses">
      <div className="border-b border-[color:var(--isit-border)] bg-[var(--isit-surface-muted)]">
        <nav aria-label="Breadcrumb" className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 text-sm sm:px-6">
          <Link href="/" className="font-medium isit-accent-text hover:underline">
            {tr('home')}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[color:var(--isit-text-muted)]" aria-hidden />
          <span className="font-medium isit-text-primary">{tr('catalogPageShortTitle')}</span>
        </nav>
      </div>

      <section className="pb-10 pt-8 sm:pb-12 sm:pt-10">
        <RevealOnView>
                    <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
            <h1 className="mb-4 text-3xl font-bold isit-text-primary sm:mb-6 sm:text-4xl md:text-5xl">{tr('catalogHeroTitle')}</h1>
            <p className="mx-auto mb-6 max-w-2xl text-base isit-body sm:mb-8 sm:text-lg">{tr('catalogHeroLead')}</p>
            <div className="relative mx-auto max-w-2xl">
              <input
                type="search"
                placeholder={tr('catalogSearchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="isit-input w-full py-3.5 pl-12 pr-4 shadow-sm"
              />
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--isit-text-muted)]" />
            </div>
                              </div>
        </RevealOnView>
      </section>

            <div className="border-t border-[color:var(--isit-border)]" />

      <section className="mx-auto grid max-w-7xl flex-1 grid-cols-1 gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-12 lg:grid-cols-4">
        <div className="lg:col-span-4">
          <LegacyMarketplaceBanner />
        </div>

        {loadErrorMessage && (
          <div className="lg:col-span-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200">
            {loadErrorMessage}
          </div>
        )}

        <aside className="isit-catalog-filter h-fit p-4 sm:p-6 lg:order-2">
          <div className="mb-6 flex items-center gap-2">
            <SlidersHorizontal className="h-[18px] w-[18px] isit-accent-text" />
            <h3 className="text-lg font-bold isit-text-primary">{tr('catalogFiltersTitle')}</h3>
          </div>

          <div className="mb-8">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide isit-muted">{tr('catalogCategoriesHeading')}</h4>
                        <div className="space-y-3 text-sm isit-body">
              {categoryOptions.map((cat) => (
                <label key={cat} className="flex cursor-pointer items-center gap-3 transition hover:text-[color:var(--isit-text)]">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="rounded border-[color:var(--isit-border)] text-[color:var(--isit-accent)] focus:ring-[color:var(--isit-ring)]"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide isit-muted">{tr('catalogPriceRangeHeading')}</h4>
            <input
              type="range"
              min={0}
              max={50000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              aria-label="Maximum price"
              className="w-full cursor-pointer"
            />
            <div className="mt-2 flex justify-between text-xs font-medium isit-muted">
              <span>₹0</span>
              <span>₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide isit-muted">{tr('catalogDifficultyHeading')}</h4>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: 'Beginner' as const, labelKey: 'difficultyBeginner' as const },
                  { value: 'Intermediate' as const, labelKey: 'difficultyIntermediate' as const },
                  { value: 'Advanced' as const, labelKey: 'difficultyAdvanced' as const },
                ] as const
              ).map(({ value, labelKey }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDifficulty((d) => (d === value ? null : value))}
                  className={difficulty === value ? 'isit-filter-chip isit-filter-chip-active' : 'isit-filter-chip'}
                >
                  {tr(labelKey)}
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={clearFilters} className="isit-btn-secondary w-full py-2.5 text-sm">
            {tr('catalogClearFilters')}
          </button>
        </aside>

        <div className="min-w-0 lg:col-span-3 lg:order-1">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-2xl font-bold isit-text-primary">
                {loading ? tr('catalogResultsLoading') : tr('catalogResultsCount').replace(/\{count\}/g, String(filteredCourses.length))}
              </h3>
              <p className="mt-1 text-sm isit-muted">{tr('catalogResultsLead')}</p>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'popular' | 'newest' | 'price')}
              className="isit-input w-full py-2 text-sm sm:w-auto"
            >
              <option value="popular">{tr('catalogSortPopular')}</option>
              <option value="newest">{tr('catalogSortNewest')}</option>
              <option value="price">{tr('catalogSortPrice')}</option>
            </select>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-80 animate-pulse rounded-2xl bg-[var(--isit-surface-muted)]" />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="isit-card rounded-2xl border-dashed px-6 py-12 text-center">
              <p className="font-medium isit-text-primary">
                {courses.length === 0 ? tr('catalogEmptyNoCourses') : tr('catalogEmptyFiltered')}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm isit-body">
                {courses.length === 0 ? tr('catalogEmptyNoCoursesLead') : tr('catalogEmptyFilteredLead')}
              </p>
              <Link href="/subjects" className="isit-btn-primary mt-5 inline-flex px-6 py-2.5 no-underline">
                {tr('browseSubjects')}
              </Link>
            </div>
          ) : (
            <RevealStagger className="grid gap-6 md:grid-cols-2">
              {filteredCourses.map((course) => (
                <article key={course._id} className="isit-course-card group">
                  <div className="isit-course-card-media">
                    <span className="isit-course-card-letter" aria-hidden>
                      {course.title.charAt(0).toUpperCase()}
                    </span>
                    {isNewCourse(course.createdAt) && (
                      <span className="absolute left-3 top-3 rounded-full border border-[color:var(--isit-border)] bg-[var(--isit-surface)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide isit-accent-text shadow-sm">
                        {tr('catalogCardNew')}
                      </span>
                    )}
                  </div>

                  <div className="isit-course-card-body">
                    <span className="isit-course-card-level">{course.level || tr('catalogAllLevels')}</span>
                    <h4 className="mt-2 line-clamp-2 text-lg font-bold leading-snug isit-text-primary sm:text-xl">{course.title}</h4>
                    <p className="mt-2 line-clamp-2 flex-1 text-sm isit-body">{course.description}</p>

                    <div className="isit-course-card-meta">
                      {course.category && <span className="isit-course-card-tag">{course.category}</span>}
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" aria-hidden />
                        {tr('catalogLessonsCount').replace(
                          /\{count\}/g,
                          String(course.lessonCount ?? course.lessons?.length ?? 0)
                        )}
                      </span>
                    </div>

                    <div className="isit-course-card-footer">
                      <span className="isit-course-card-price">₹{course.price.toLocaleString('en-IN')}</span>
                      <Link href={`/course/${course._id}`} className="isit-btn-primary shrink-0 px-5 py-2.5 text-sm no-underline">
                        {tr('catalogEnrollNow')}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </RevealStagger>
          )}
        </div>
      </section>

      <section className="border-t border-[color:var(--isit-border)] bg-[var(--isit-surface-muted)] px-6 py-16 text-center sm:py-20">
        <h2 className="text-3xl font-bold isit-text-primary">{tr('catalogCtaTitle')}</h2>
        <p className="mx-auto mt-4 max-w-2xl isit-body">{tr('catalogCtaLead')}</p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/signup" className="isit-btn-primary px-8 py-3 no-underline">
            {tr('catalogCtaSignup')}
          </Link>
          <Link href="/how-it-works" className="isit-btn-secondary px-8 py-3 no-underline">
            {tr('howItWorks')}
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
