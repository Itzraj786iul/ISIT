'use client';

/**
 * @legacy MARKETPLACE_LMS — Course catalog (GET /api/courses). Prefer /subjects for AI-first learning.
 * Migration: docs/AI_FIRST_MIGRATION.md
 */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, BookOpen, ChevronRight } from 'lucide-react';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';
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
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
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

  return (
    <div className="isit-cosmic-bg flex min-h-screen flex-col text-cyan-50">
      <PublicNav active="courses" />

      <div className="border-b border-cyan-300/15 bg-slate-950/40">
        <nav aria-label="Breadcrumb" className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 text-sm sm:px-6">
          <Link href="/" className="font-medium text-sky-400 hover:underline">
            {tr('home')}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
          <span className="font-medium text-cyan-100">{tr('catalogPageShortTitle')}</span>
        </nav>
      </div>

      {/* ================= HERO SECTION ================= */}
      <section className="pb-10 sm:pb-12 pt-8 sm:pt-10">
        <RevealOnView>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="mb-4 sm:mb-6 text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl dark:text-slate-100">
            {tr('catalogHeroTitle')}
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-base text-gray-500 sm:mb-8 sm:text-lg dark:text-slate-400">
            {tr('catalogHeroLead')}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder={tr('catalogSearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-cyan-300/25 bg-slate-950/70 focus:bg-slate-950/85 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition text-cyan-50"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
               <Search size={20} />
            </div>
          </div>
        </div>
        </RevealOnView>
      </section>

      <div className="border-t border-cyan-300/20"></div>
      
      {/* ================= MAIN CONTENT ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 flex-1">
        <div className="lg:col-span-4 order-first">
          <LegacyMarketplaceBanner />
        </div>

        {loadErrorMessage && (
          <div className="lg:col-span-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {loadErrorMessage}
          </div>
        )}

        {/* ================= FILTER SIDEBAR ================= */}
        <aside className="isit-glass p-4 sm:p-6 rounded-2xl h-fit lg:order-2">
          <div className="flex items-center gap-2 mb-6">
            <SlidersHorizontal size={18} className="text-slate-600 dark:text-slate-400" />
            <h3 className="text-lg font-bold text-cyan-100">{tr('catalogFiltersTitle')}</h3>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
              {tr('catalogCategoriesHeading')}
            </h4>
            <div className="space-y-3 text-sm text-slate-600">
              {categoryOptions.map((cat) => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer hover:text-sky-500 transition">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="rounded border-gray-300 text-sky-500 focus:ring-sky-500"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="mb-8">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
              {tr('catalogPriceRangeHeading')}
            </h4>
            <input
              type="range"
              min={0}
              max={50000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              aria-label="Maximum price"
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-2 font-medium">
              <span>₹0</span>
              <span>₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-8">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
              {tr('catalogDifficultyHeading')}
            </h4>
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
                  className={`rounded-full border bg-slate-950/70 px-4 py-2 text-xs transition ${
                    difficulty === value
                      ? 'border-cyan-400 text-cyan-100 ring-1 ring-cyan-400/50'
                      : 'border-cyan-300/30 hover:border-cyan-300 hover:text-cyan-200'
                  }`}
                >
                  {tr(labelKey)}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="w-full rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800/80"
          >
            {tr('catalogClearFilters')}
          </button>
        </aside>

        {/* ================= COURSES GRID ================= */}
        <div className="lg:col-span-3 order-1 lg:order-1 min-w-0">

          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {loading ? tr('catalogResultsLoading') : tr('catalogResultsCount').replace(/\{count\}/g, String(filteredCourses.length))}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{tr('catalogResultsLead')}</p>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'popular' | 'newest' | 'price')}
              className="w-full rounded-xl border border-cyan-300/30 bg-slate-950/75 px-4 py-2 text-sm text-cyan-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 sm:w-auto"
            >
              <option value="popular">{tr('catalogSortPopular')}</option>
              <option value="newest">{tr('catalogSortNewest')}</option>
              <option value="price">{tr('catalogSortPrice')}</option>
            </select>
          </div>

          {/* Grid */}
          {loading ? (
             <div className="grid md:grid-cols-2 gap-6">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="bg-gray-100 h-80 rounded-2xl animate-pulse"></div>
               ))}
             </div>
          ) : filteredCourses.length === 0 ? (
             <div className="rounded-2xl border border-dashed border-cyan-300/30 bg-slate-950/65 px-6 py-12 text-center">
                <p className="font-medium text-cyan-100">
                  {courses.length === 0 ? tr('catalogEmptyNoCourses') : tr('catalogEmptyFiltered')}
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
                  {courses.length === 0 ? tr('catalogEmptyNoCoursesLead') : tr('catalogEmptyFilteredLead')}
                </p>
                <Link
                  href="/subjects"
                  className="btn-primary mt-5 inline-flex px-6 py-2.5 no-underline"
                >
                  {tr('browseSubjects')}
                </Link>
             </div>
          ) : (
            <RevealStagger className="grid md:grid-cols-2 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-slate-950/65 rounded-2xl shadow-sm border border-cyan-300/20 overflow-hidden hover:shadow-md hover:border-cyan-300/45 motion-safe-transition duration-300 hover:-translate-y-1 group"
                >
                  {/* Image */}
                  <div className="h-40 sm:h-48 bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center relative">
                    <span className="text-sky-300 text-4xl sm:text-5xl font-bold">
                      {course.title.charAt(0)}
                    </span>
                    {course.createdAt && (Date.now() - new Date(course.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000 && (
                      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-sky-600 shadow-sm backdrop-blur">
                        {tr('catalogCardNew')}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                      {course.level || tr('catalogAllLevels')}
                    </span>

                    <h4 className="font-bold text-lg sm:text-xl text-slate-900 mt-2 mb-2 leading-snug">
                      {course.title}
                    </h4>

                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                      {course.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-4 mb-4">
                      {course.category && (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                          {course.category}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} />{' '}
                        {tr('catalogLessonsCount').replace(
                          /\{count\}/g,
                          String(course.lessonCount ?? course.lessons?.length ?? 0)
                        )}
                      </span>
                    </div>

                    {/* Bottom */}
                    <div className="flex justify-between items-center">
                      <span className="text-sky-600 font-bold text-2xl">
                        ₹{course.price}
                      </span>

                      <Link
                        href={`/course/${course._id}`}
                        className="rounded-full bg-sky-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-600"
                      >
                        {tr('catalogEnrollNow')}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </RevealStagger>
          )}

        </div>
      </section>

      {/* ================= CTA SECTION (Common Part) ================= */}
      <section className="mt-10 px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-slate-100">{tr('catalogCtaTitle')}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-400">{tr('catalogCtaLead')}</p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-full bg-sky-500 px-8 py-3 font-medium text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-600"
          >
            {tr('catalogCtaSignup')}
          </Link>
          <Link href="/how-it-works" className="isit-btn-secondary">
            {tr('howItWorks')}
          </Link>
        </div>
      </section>

      <Footer />

    </div>
  );
}