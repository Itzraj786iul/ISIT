'use client';

/**
 * @legacy MARKETPLACE_LMS — Course catalog (GET /api/courses). Prefer /subjects for AI-first learning.
 * Migration: docs/AI_FIRST_MIGRATION.md
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, BookOpen } from 'lucide-react';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';
import LegacyMarketplaceBanner from '@/components/LegacyMarketplaceBanner';

type Course = {
  _id: string;
  title: string;
  description: string;
  price: number;
  level?: string;
  category?: string;
  lessons?: { _id: string }[];
  createdAt?: string;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadError(null);
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : []);
        } else {
          setLoadError('We could not load courses. Please try again.');
        }
      } catch {
        setLoadError('Network error. Check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 flex flex-col">
      <PublicNav active="courses" />

      {/* ================= HERO SECTION ================= */}
      <section className="bg-white pb-10 sm:pb-12 pt-8 sm:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Unlock Your Potential
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-8">
            Discover thousands of courses taught by expert instructors. Start your journey today.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="Search for courses..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-[#F8FAFC] focus:bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
               <Search size={20} />
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-200"></div>
      
      {/* ================= MAIN CONTENT ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 flex-1">
        <div className="lg:col-span-4 order-first">
          <LegacyMarketplaceBanner />
        </div>

        {loadError && (
          <div className="lg:col-span-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {loadError}
          </div>
        )}

        {/* ================= FILTER SIDEBAR ================= */}
        <aside className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 h-fit lg:order-2">
          <div className="flex items-center gap-2 mb-6">
            <SlidersHorizontal size={18} className="text-slate-600" />
            <h3 className="font-bold text-lg text-slate-900">Filters</h3>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h4 className="font-semibold mb-4 text-sm text-slate-700 uppercase tracking-wide">Categories</h4>
            <div className="space-y-3 text-sm text-slate-600">
              {['Development', 'Design', 'Business', 'Marketing', 'Photography', 'Music'].map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer hover:text-sky-500 transition">
                  <input type="checkbox" className="rounded border-gray-300 text-sky-500 focus:ring-sky-500" />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="mb-8">
            <h4 className="font-semibold mb-4 text-sm text-slate-700 uppercase tracking-wide">Price Range</h4>
            <input type="range" className="w-full accent-sky-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between text-xs text-slate-600 mt-2 font-medium">
              <span>₹0</span>
              <span>₹50,000</span>
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-8">
            <h4 className="font-semibold mb-4 text-sm text-slate-700 uppercase tracking-wide">Difficulty Level</h4>
            <div className="flex flex-wrap gap-2">
              {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                <button
                  key={level}
                  className="px-4 py-2 text-xs border border-slate-200 rounded-full hover:border-sky-500 hover:text-sky-600 bg-white transition"
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button className="w-full text-sm border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 text-gray-600 transition">
            Clear All Filters
          </button>
        </aside>

        {/* ================= COURSES GRID ================= */}
        <div className="lg:col-span-3 order-1 lg:order-1 min-w-0">

          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {loading ? 'Loading...' : `${courses.length} Courses Found`}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Explore our comprehensive course catalog
              </p>
            </div>

            <select className="border border-slate-200 rounded-xl px-4 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 w-full sm:w-auto">
              <option>Most Popular</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
            </select>
          </div>

          {/* Grid */}
          {loading ? (
             <div className="grid md:grid-cols-2 gap-6">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="bg-gray-100 h-80 rounded-2xl animate-pulse"></div>
               ))}
             </div>
          ) : courses.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 px-6">
                <p className="text-slate-800 font-medium">No courses in the catalog yet</p>
                <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                  Try AI-first learning by subject instead — pick a topic and start your first session.
                </p>
                <Link
                  href="/subjects"
                  className="inline-flex mt-5 btn-primary px-6 py-2.5 no-underline"
                >
                  Browse subjects
                </Link>
             </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {courses.map(course => (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition group"
                >
                  {/* Image */}
                  <div className="h-40 sm:h-48 bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center relative">
                    <span className="text-sky-300 text-4xl sm:text-5xl font-bold">
                      {course.title.charAt(0)}
                    </span>
                    {course.createdAt && (Date.now() - new Date(course.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000 && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-sky-600 shadow-sm">
                        New
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                      {course.level || 'All Levels'}
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
                        <BookOpen size={14} /> {course.lessons?.length ?? 0} lessons
                      </span>
                    </div>

                    {/* Bottom */}
                    <div className="flex justify-between items-center">
                      <span className="text-sky-600 font-bold text-2xl">
                        ₹{course.price}
                      </span>

                      <Link
                        href={`/course/${course._id}`}
                        className="bg-sky-500 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-sky-600 transition shadow-lg shadow-sky-500/20"
                      >
                        Enroll Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ================= CTA SECTION (Common Part) ================= */}
      <section className="bg-[#F8FAFC] py-24 text-center px-6 mt-10">
        <h2 className="text-3xl font-bold">Start Learning with Confidence</h2>
        <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
          Join thousands of students who are already transforming their careers.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/signup" className="bg-sky-500 text-white px-8 py-3 rounded-full font-medium hover:bg-sky-600 transition shadow-lg shadow-sky-500/30">
            Get Started
          </Link>
          <Link href="/how-it-works" className="bg-white border border-gray-200 text-gray-900 px-8 py-3 rounded-full font-medium hover:bg-gray-50 transition">
            How it Works
          </Link>
        </div>
      </section>

      <Footer />

    </div>
  );
}