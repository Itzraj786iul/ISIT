'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';

type Course = {
  _id: string;
  title: string;
  description: string;
  price: number;
  level?: string;
  lessons?: { _id: string }[];
};

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!params.id) return;

      try {
        const res = await fetch(`/api/course/${params.id}`);
        const data = await res.json();

        if (data.course) {
          setCourse({
            ...data.course,
            lessons: data.lessons || []
          });
        } else {
          setCourse(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <p className="text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <p className="text-lg font-semibold text-red-500">Course not found</p>
      </div>
    );
  }

  const handleEnroll = () => {
    if (!course.lessons || course.lessons.length === 0) {
      alert("No lessons available yet.");
      return;
    }
    router.push(`/checkout?id=${course._id}`);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6]">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="text-sky-500 font-bold text-xl cursor-pointer"
            onClick={() => router.push('/')}
          >
            ISIT
          </div>

          <div className="hidden md:flex gap-10 text-sm font-medium">
            <Link href="/" className="hover:text-sky-500 transition">Home</Link>
            <Link href="/courses" className="hover:text-sky-500 transition">Courses</Link>
            <Link href="/how-it-works" className="hover:text-sky-500 transition">How it Works</Link>
            <Link href="/stories" className="hover:text-sky-500 transition">Stories</Link>
            <Link href="/blog" className="hover:text-sky-500 transition">Blog</Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <span className="text-sm cursor-pointer">LAN ▾</span>
            <Link
              href="/signup"
              className="bg-black text-white px-5 py-2 rounded-full text-sm hover:bg-gray-800 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-12">

          {/* LEFT CONTENT */}
          <div className="lg:col-span-2">

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {course.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-8">
              <span className="text-xs text-sky-600 font-bold uppercase">
                {course.level || "Beginner"}
              </span>
              <span>|</span>
              <span className="flex items-center gap-1">
                <BookOpen size={16} />
                42 hours total
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-lg mb-10">
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
                alt={course.title}
                className="w-full object-cover"
              />
            </div>

            <div className="text-gray-700 space-y-6 leading-relaxed">
              <p>{course.description}</p>
              <p>
                This comprehensive course takes you from fundamentals to advanced concepts,
                helping you build real-world full-stack applications.
              </p>
              <p>
                By the end of this course, you’ll be industry-ready with strong portfolio projects.
              </p>
            </div>

            {/* AUTHOR + RELATED */}
            <div className="mt-16 space-y-8">

              <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <h3 className="text-lg font-bold mb-4">About The Author</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-sky-100 rounded-full flex items-center justify-center font-bold">
                    IS
                  </div>
                  <div>
                    <p className="font-bold">ISIT Instructor</p>
                    <p className="text-xs text-gray-500">Expert Teacher</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  10+ years industry experience helping students become job-ready developers.
                </p>
              </div>

            </div>

          </div>

          {/* RIGHT PRICING CARD */}
          <div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">

              <h2 className="text-xs font-bold text-sky-500 uppercase mb-2">
                Enroll Now
              </h2>

              <p className="text-sm text-gray-500 mb-4">
                Start your learning journey today
              </p>

              <div className="text-4xl font-bold text-gray-900 mb-6">
                ₹{course.price}
              </div>

              <button
                onClick={handleEnroll}
                className="w-full py-4 bg-[#4f9db8] hover:bg-[#3e8aa4] text-white font-bold rounded-xl transition shadow-lg"
              >
                Start Learning
              </button>

              <div className="mt-6 space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-sky-600" />
                  42 hours on-demand video
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight size={16} className="text-sky-600" />
                  Lifetime access
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight size={16} className="text-sky-600" />
                  Certificate of completion
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs">
          © 2026 Indian School of Innovation and Thinking. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
