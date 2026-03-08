'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Star, Clock, BookOpen } from 'lucide-react';

type Course = {
  _id: string;
  title: string;
  description: string;
  price: number;
  level?: string;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (error) {
        console.error('Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 flex flex-col">

      {/* ================= NAVBAR (Identical to Homepage) ================= */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="text-sky-500 font-bold text-xl cursor-pointer">
            <Link href="/" className="hover:text-sky-600">
              ISIT
            </Link>
          </div>

          <nav className="hidden md:flex gap-10 text-sm font-medium">
            <Link href="/" className="hover:text-sky-500 transition">Home</Link>
            <Link href="/courses" className="text-black border-b-2 border-sky-500 pb-1">Courses</Link>
            <Link href="/how-it-works" className="hover:text-sky-500 transition">How it Works</Link>
            <a href="#" className="hover:text-sky-500">Stories</a>
            <a href="#" className="hover:text-sky-500">Blog</a>
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <span className="text-sm">LAN ▾</span>
            <Link href="/signup"
              className="bg-black text-white px-5 py-2 rounded-full text-sm hover:bg-gray-800 transition">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="bg-white pb-12 pt-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Unlock Your Potential
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-8">
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
      <section className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">

        {/* ================= FILTER SIDEBAR ================= */}
        <aside className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
          <div className="flex items-center gap-2 mb-6">
            <SlidersHorizontal size={18} className="text-gray-500" />
            <h3 className="font-bold text-lg text-gray-900">Filters</h3>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h4 className="font-semibold mb-4 text-sm text-gray-700 uppercase tracking-wide">Categories</h4>
            <div className="space-y-3 text-sm text-gray-600">
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
            <h4 className="font-semibold mb-4 text-sm text-gray-700 uppercase tracking-wide">Price Range</h4>
            <input type="range" className="w-full accent-sky-500 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
              <span>₹0</span>
              <span>₹50,000</span>
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-8">
            <h4 className="font-semibold mb-4 text-sm text-gray-700 uppercase tracking-wide">Difficulty Level</h4>
            <div className="flex flex-wrap gap-2">
              {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                <button
                  key={level}
                  className="px-4 py-2 text-xs border border-gray-200 rounded-full hover:border-sky-500 hover:text-sky-500 bg-white transition"
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
        <div className="lg:col-span-3">

          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {loading ? 'Loading...' : `${courses.length} Courses Found`}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Explore our comprehensive course catalog
              </p>
            </div>

            <select className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
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
             <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-500">No courses found.</p>
             </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {courses.map(course => (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition group"
                >
                  {/* Image */}
                  <div className="h-48 bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center relative">
                    <span className="text-sky-200 text-5xl font-bold">
                      {course.title.charAt(0)}
                    </span>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-sky-600 shadow-sm">
                      New
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                      {course.level || 'All Levels'}
                    </span>

                    <h4 className="font-bold text-xl text-gray-900 mt-2 mb-2 leading-snug">
                      {course.title}
                    </h4>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {course.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-4 mb-4">
                      <span className="flex items-center gap-1 text-yellow-500 font-medium">
                        <Star size={14} fill="currentColor" /> 4.6
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> 8 weeks
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} /> 32 lessons
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

      {/* ================= FOOTER (Common Part) ================= */}
      <footer className="bg-black text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-white text-xl font-semibold">
              Indian School of Innovation and Thinking
            </h3>
            <p className="mt-4 text-sm">
              Empowering the next generation of thinkers and innovators.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm">
            <div>
              <p className="text-white mb-4">Quick Links</p>
              <p>Home</p>
              <p>Courses</p>
              <p>How it Works</p>
              <p>Stories</p>
              <p>Blog</p>
            </div>
            <div>
              <p className="text-white mb-4">Legal</p>
              <p>Privacy Policy</p>
              <p>Terms of Services</p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs mt-12">
          © 2026 Indian School of Innovation and Thinking. All rights reserved.
        </div>
      </footer>

    </div>
  );
}