'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Course = {
  _id: string;
  title: string;
  description: string;
  price: number;
  level?: string;
};

export default function HomePage() {
  const router = useRouter();
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900">

      {/* ================= NAVBAR ================= */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <div 
            className="text-sky-500 font-bold text-xl cursor-pointer"
            onClick={() => router.push('/')}
          >
            ISIT
          </div>

            <nav className="hidden md:flex gap-10 text-sm font-medium">
            <Link href="/" className="text-black border-b-2 border-sky-500 pb-1">Home</Link>
            <Link href="/courses" className="hover:text-sky-500 transition">Courses</Link>
            <Link href="/how-it-works" className="hover:text-sky-500 transition">How it Works</Link>
            <Link href="/stories" className="hover:text-sky-500 transition">Stories</Link>
            {/* --- BLOG LINK MUST POINT TO /blog --- */}
            <Link href="/blog" className="hover:text-sky-500 transition">Blog</Link>
      </nav>

          <div className="hidden md:flex items-center gap-6">
            <span className="text-sm cursor-pointer">LAN ▾</span>
            <Link href="/signup"
              className="bg-black text-white px-5 py-2 rounded-full text-sm hover:bg-gray-800 transition">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="bg-gradient-to-r from-[#F8FAFC] via-[#E6F4FA] to-[#F8FAFC] py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

          <div>
            <h1 className="text-5xl font-bold leading-tight">
              Let's Fall In Love <br />
              <span className="text-sky-500">with learning</span>
            </h1>

            <p className="mt-6 text-gray-600 text-lg">
              Where mistakes are celebrated as steps toward mastery
            </p>

            <div className="mt-8 flex gap-4">
              <Link href="/signup"
                className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium">
                Try a Free Interactive Lesson
              </Link>

              <button className="bg-white px-6 py-3 rounded-full border text-sm font-medium shadow-sm">
                See How Schools Use It
              </button>
            </div>

            <div className="mt-12 flex gap-10 text-sm text-gray-600">
              <span>Used by 500+ schools</span>
              <span>94% improved understanding</span>
              <span>CBSE & ICSE aligned</span>
            </div>
          </div>

          <div>
            <img
              src="https://images.unsplash.com/photo-1587614382346-4ec9c5dfe9d1?auto=format&fit=crop&w=900&q=80"
              className="rounded-3xl shadow-xl w-full object-cover"
              alt="Learning"
            />
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">How Learning Works</h2>
          <p className="text-gray-500 mt-4">
            A simple, proven process to take you beginner to expert
          </p>

          <div className="grid md:grid-cols-4 gap-8 mt-16">
            {[
              "Choose a learning path",
              "Learn through modules",
              "Practice with quizzes & projects",
              "Track progress & outcomes",
            ].map((title, i) => (
              <div key={i}
                className="bg-white p-8 rounded-2xl shadow-md text-left">
                <div className="text-sky-500 font-bold text-2xl mb-4">{i + 1}</div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-gray-500 text-sm mt-2">
                  Detailed step description goes here.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= EXPLORE COURSES ================= */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">Explore Learning Paths</h2>
          <p className="text-gray-500 mt-4">
            Choose from our comprehensive courses designed to fast-track your career
          </p>

          {loading ? (
            <p className="mt-12">Loading...</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
              {courses.slice(0, 3).map(course => (
                <div key={course._id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden group">
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {/* Image Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center">
                        <span className="text-4xl font-bold text-sky-200">{course.title.charAt(0)}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <span className="text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full">
                      {course.level || "Beginner"}
                    </span>

                    <h3 className="font-semibold mt-4">{course.title}</h3>

                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="mt-6 flex justify-between items-center">
                      <span className="font-bold text-lg">₹{course.price}</span>
                      <Link
                        href={`/course/${course._id}`}
                        className="bg-sky-500 text-white px-4 py-2 rounded-md text-sm hover:bg-sky-600 transition">
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

      {/* ================= STATS BAR ================= */}
      <section className="bg-gradient-to-r from-sky-500 to-blue-600 py-14 text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 text-center gap-10">
          {["50K+", "95%", "200+", "4.5/5"].map((val, i) => (
            <div key={i}>
              <h3 className="text-3xl font-bold">{val}</h3>
              <p className="text-sm mt-2 opacity-80">
                {["Active Learners", "Success Rate", "Expert Instructor", "Average Rating"][i]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SUCCESS STORIES ================= */}
      <section className="py-24 bg-[#F8FAFC] text-center">
        <h2 className="text-3xl font-bold">Success Stories</h2>
        <p className="text-gray-500 mt-4">
          Hear from students who transformed their careers with us
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto px-6">
          {[1,2,3].map(i => (
            <div 
              key={i} 
              className="bg-white p-8 rounded-2xl shadow-md text-left hover:shadow-lg transition cursor-pointer group" 
              onClick={() => router.push('/stories')}
            >
              <p className="text-yellow-400 mb-4">★★★★★</p>
              <p className="text-gray-600 text-sm">
                “This platform transformed my career.”
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="font-semibold text-sm">Student Name</p>
                  <p className="text-xs text-gray-500">Company Name</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Link 
            href="/stories" 
            className="inline-flex items-center gap-2 text-sky-600 font-bold text-lg hover:text-sky-800 transition"
          >
            View All Success Stories 
            <span className="text-2xl">&rarr;</span>
          </Link>
        </div>
      </section>

      {/* ================= TRUSTED ================= */}
      <section className="py-20 text-center">
        <h2 className="text-2xl font-bold">Trusted by Leading Companies</h2>
        <p className="text-gray-500 mt-3">
          Our graduates work at world's most innovative companies
        </p>

        <div className="flex justify-center gap-6 mt-10">
          {["Google","Microsoft","Amazon","Meta","Apple"].map(c => (
            <div key={c}
              className="bg-white shadow-md px-6 py-3 rounded-xl hover:shadow-lg transition cursor-pointer">
              {c}
            </div>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-20 text-center bg-[#F8FAFC]">
        <h2 className="text-3xl font-bold">Start Learning with Confidence</h2>
        <p className="text-gray-500 mt-4">
          Join thousands of students who are already transforming their careers.
        </p>

        <Link href="/signup"
          className="inline-block mt-8 bg-sky-500 text-white px-8 py-3 rounded-full hover:bg-sky-600 transition">
          Get Start
        </Link>
      </section>

      {/* ================= FOOTER ================= */}
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
              <p className="hover:text-white cursor-pointer transition">Home</p>
              <p className="hover:text-white cursor-pointer transition">Courses</p>
              <p className="hover:text-white cursor-pointer transition">How it Works</p>
              <p className="hover:text-white cursor-pointer transition">Stories</p>
              <p className="hover:text-white cursor-pointer transition">Blog</p>
            </div>
            <div>
              <p className="text-white mb-4">Legal</p>
              <p className="hover:text-white cursor-pointer transition">Privacy Policy</p>
              <p className="hover:text-white cursor-pointer transition">Terms of Services</p>
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