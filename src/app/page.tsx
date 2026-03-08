'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, LayoutDashboard, BookOpen, LogOut, ChevronDown } from 'lucide-react';

type Course = {
  _id: string;
  title: string;
  description: string;
  price: number;
  level?: string;
};

type LoggedInUser = { name?: string; email?: string; role?: string };

export default function HomePage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const u = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setProfileOpen(false);
    router.push('/');
  };

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

          <div className="flex items-center gap-4" ref={profileRef}>
            {/* Desktop */}
            <div className="hidden md:flex items-center gap-6">
              <span className="text-sm text-gray-500">LAN ▾</span>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((o) => !o)}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 rounded-full pl-3 pr-2 py-2 text-sm font-medium text-gray-800 transition"
                  >
                    <span className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </span>
                    <span className="max-w-[120px] truncate">{user.name || 'Profile'}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link href="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50"><LayoutDashboard className="w-4 h-4 text-sky-500" /> Dashboard</Link>
                      <Link href="/my-courses" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50"><BookOpen className="w-4 h-4 text-sky-500" /> My Courses</Link>
                      {user.role?.toLowerCase() === 'teacher' && <Link href="/teacher/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50"><LayoutDashboard className="w-4 h-4 text-sky-500" /> Teacher Dashboard</Link>}
                      <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" /> Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-sky-500 text-sm font-medium transition">Log in</Link>
                  <Link href="/signup" className="bg-black text-white px-5 py-2 rounded-full text-sm hover:bg-gray-800 transition">Sign Up</Link>
                </>
              )}
            </div>
            {/* Mobile */}
            <div className="flex md:hidden items-center gap-2">
              {user ? (
                <div className="relative">
                  <button onClick={() => setProfileOpen((o) => !o)} className="flex items-center gap-1.5 bg-slate-100 rounded-full p-2">
                    <User className="w-5 h-5 text-sky-500" />
                    <ChevronDown className={`w-4 h-4 text-gray-500 ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-3 py-2 border-b border-gray-100"><p className="font-medium text-gray-900 text-sm truncate">{user.name}</p></div>
                      <Link href="/dashboard" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-slate-50">Dashboard</Link>
                      <Link href="/my-courses" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-slate-50">My Courses</Link>
                      {user.role?.toLowerCase() === 'teacher' && <Link href="/teacher/dashboard" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-slate-50">Teacher Dashboard</Link>}
                      <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 text-sm font-medium">Log in</Link>
                  <Link href="/signup" className="bg-black text-white px-4 py-2 rounded-full text-sm">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="bg-gradient-to-r from-[#F8FAFC] via-[#E6F4FA] to-[#F8FAFC] py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

          <div>
            {user ? (
              <>
                <h1 className="text-5xl font-bold leading-tight">
                  Welcome back, <br />
                  <span className="text-sky-500">{user.name?.split(' ')[0] || 'there'}</span>
                </h1>
                <p className="mt-6 text-gray-600 text-lg">
                  Ready to continue your learning journey? Pick up where you left off or explore new courses.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/dashboard"
                    className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    href="/my-courses"
                    className="bg-white px-6 py-3 rounded-full border text-sm font-medium shadow-sm hover:bg-slate-50 transition"
                  >
                    My Courses
                  </Link>
                  <Link
                    href="/courses"
                    className="bg-white px-6 py-3 rounded-full border text-sm font-medium shadow-sm hover:bg-slate-50 transition"
                  >
                    Browse Courses
                  </Link>
                </div>
                <div className="mt-12 flex flex-wrap gap-6 text-sm text-gray-600">
                  <Link href="/analytics" className="hover:text-sky-600 transition">Your analytics</Link>
                  <Link href="/achievements" className="hover:text-sky-600 transition">Achievements</Link>
                  <Link href="/learning-path" className="hover:text-sky-600 transition">Learning path</Link>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>

          <div className="relative w-full aspect-[4/3] min-h-[280px] rounded-3xl overflow-hidden shadow-xl bg-slate-100">
            <Image
              src="/assets/Hero.png"
              alt="Students learning together"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
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
            {user
              ? 'Continue your journey or discover new courses to add to your learning path'
              : 'Choose from our comprehensive courses designed to fast-track your career'}
          </p>
          {user && (
            <div className="mt-4">
              <Link href="/my-courses" className="text-sky-600 font-medium hover:text-sky-700 text-sm">
                View my enrolled courses →
              </Link>
            </div>
          )}

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
        {user ? (
          <>
            <h2 className="text-3xl font-bold">You're on the right path</h2>
            <p className="text-gray-500 mt-4">
              Head to your dashboard to track progress, complete lessons, and unlock achievements.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/dashboard" className="inline-block bg-sky-500 text-white px-8 py-3 rounded-full hover:bg-sky-600 transition">
                Go to Dashboard
              </Link>
              <Link href="/courses" className="inline-block bg-white border border-slate-200 text-slate-700 px-8 py-3 rounded-full hover:bg-slate-50 transition">
                Browse Courses
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold">Start Learning with Confidence</h2>
            <p className="text-gray-500 mt-4">
              Join thousands of students who are already transforming their careers.
            </p>
            <Link href="/signup"
              className="inline-block mt-8 bg-sky-500 text-white px-8 py-3 rounded-full hover:bg-sky-600 transition">
              Get Start
            </Link>
          </>
        )}
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