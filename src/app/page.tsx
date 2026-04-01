'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import PublicNav from '@/components/PublicNav';
import { BookOpen, ChevronRight } from 'lucide-react';

type SubjectItem = {
  _id: string;
  name: string;
  description?: string;
  grade?: string;
  board?: string;
};

type LoggedInUser = { name?: string; email?: string; role?: string };

const SUBJECT_COLORS = [
  'from-sky-50 to-blue-100',
  'from-emerald-50 to-teal-100',
  'from-violet-50 to-purple-100',
  'from-amber-50 to-orange-100',
  'from-rose-50 to-pink-100',
  'from-indigo-50 to-blue-100',
];

const SUBJECT_TEXT_COLORS = [
  'text-sky-400', 'text-emerald-400', 'text-violet-400',
  'text-amber-400', 'text-rose-400', 'text-indigo-400',
];

export default function HomePage() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<LoggedInUser | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) { setUser(null); return; }
        const data = await r.json();
        if (data.user) setUser({ name: data.user.name, email: data.user.email, role: data.user.role });
      })
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch('/api/subjects');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setSubjects(json.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const getDashboardHref = () => {
    const role = user?.role?.toLowerCase();
    if (role === 'teacher') return '/teacher/dashboard';
    if (role === 'parent') return '/parent/dashboard';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      <PublicNav active="home" />

      {/* HERO */}
      <section className="bg-gradient-to-r from-slate-50 via-sky-50 to-slate-50 py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            {user ? (
              <>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                  Welcome back, <br />
                  <span className="text-sky-500">{user.name?.split(' ')[0] || 'there'}</span>
                </h1>
                <p className="mt-4 sm:mt-6 text-gray-600 text-base sm:text-lg">
                  Ready to continue your learning journey? Pick up where you left off or explore new subjects.
                </p>
                <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
                  <Link href={getDashboardHref()} className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition">
                    Go to Dashboard
                  </Link>
                  <Link href="/subjects" className="bg-white px-6 py-3 rounded-full border text-sm font-medium shadow-sm hover:bg-slate-50 transition">
                    Explore Subjects
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                  {"Let's Fall In Love"} <br />
                  <span className="text-sky-500">with learning</span>
                </h1>
                <p className="mt-4 sm:mt-6 text-gray-600 text-base sm:text-lg">
                  Where mistakes are celebrated as steps toward mastery
                </p>
                <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
                  <Link href="/signup" className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition">
                    Try a Free Interactive Lesson
                  </Link>
                  <Link href="/how-it-works" className="bg-white px-6 py-3 rounded-full border text-sm font-medium shadow-sm hover:bg-slate-50 transition">
                    See How It Works
                  </Link>
                </div>
                <div className="mt-8 sm:mt-12 flex flex-wrap gap-6 sm:gap-10 text-sm text-gray-600">
                  <span>{subjects.length > 0 ? `${subjects.length} subjects available` : 'Explore our catalog'}</span>
                  <span>CBSE &amp; ICSE aligned</span>
                </div>
              </>
            )}
          </div>

          <div className="relative w-full aspect-[4/3] min-h-[200px] sm:min-h-[280px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl bg-slate-100 mt-8 md:mt-0">
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

      {/* HOW IT WORKS */}
      <section className="py-16 sm:py-20 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">How Learning Works</h2>
          <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base">
            A simple, proven process to take you from beginner to expert
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mt-10 sm:mt-16">
            {[
              { title: 'Choose a subject', desc: 'Pick subjects aligned with your goals and curriculum.' },
              { title: 'Learn through topics', desc: 'Watch videos, read notes, and interact with AI-powered tutoring.' },
              { title: 'Practice with quizzes', desc: 'Test your understanding with real questions and get instant feedback.' },
              { title: 'Track progress', desc: 'Monitor your mastery and see your growth over time.' },
            ].map((step, i) => (
              <div key={i} className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm text-left">
                <div className="text-sky-600 font-bold text-2xl mb-4">{i + 1}</div>
                <h3 className="font-semibold text-slate-900">{step.title}</h3>
                <p className="text-slate-600 text-sm mt-2">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUBJECTS */}
      <section className="py-16 sm:py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Explore Subjects</h2>
          <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base">
            {user
              ? 'Continue your journey or discover new subjects'
              : 'Choose from subjects designed around your curriculum'}
          </p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
              {[1, 2, 3].map((i) => <div key={i} className="bg-white border border-slate-200 rounded-2xl h-64 animate-pulse" />)}
            </div>
          ) : subjects.length === 0 ? (
            <p className="mt-8 text-slate-500">No subjects available yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-10 sm:mt-16 text-left">
              {subjects.slice(0, 6).map((subject, i) => (
                <Link
                  key={subject._id}
                  href={`/subject/${subject._id}`}
                  className="block no-underline group"
                >
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:border-sky-200 transition">
                    <div className={`h-36 sm:h-44 bg-gradient-to-br ${SUBJECT_COLORS[i % SUBJECT_COLORS.length]} flex items-center justify-center`}>
                      <BookOpen className={`w-12 h-12 ${SUBJECT_TEXT_COLORS[i % SUBJECT_TEXT_COLORS.length]}`} />
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="flex gap-2 mb-3">
                        {subject.grade && (
                          <span className="text-xs bg-sky-100 text-sky-700 px-3 py-1 rounded-full">{subject.grade}</span>
                        )}
                        {subject.board && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">{subject.board}</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-sky-600 transition">{subject.name}</h3>
                      {subject.description && (
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">{subject.description}</p>
                      )}
                      <div className="mt-4 flex items-center text-sky-600 text-sm font-medium group-hover:underline">
                        Explore Subject <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {subjects.length > 6 && (
            <div className="mt-8">
              <Link href="/subjects" className="text-sky-600 font-medium hover:text-sky-700">
                View all {subjects.length} subjects {'\u2192'}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gradient-to-r from-sky-500 to-blue-600 py-10 sm:py-14 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 text-center gap-6 sm:gap-10">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold">{subjects.length > 0 ? `${subjects.length}+` : 'Growing'}</h3>
            <p className="text-xs sm:text-sm mt-1 sm:mt-2 opacity-80">Subjects Available</p>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold">CBSE</h3>
            <p className="text-xs sm:text-sm mt-1 sm:mt-2 opacity-80">Curriculum Aligned</p>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold">AI</h3>
            <p className="text-xs sm:text-sm mt-1 sm:mt-2 opacity-80">Powered Tutoring</p>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold">24/7</h3>
            <p className="text-xs sm:text-sm mt-1 sm:mt-2 opacity-80">Learning Access</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20 text-center bg-slate-50 px-4">
        {user ? (
          <>
            <h2 className="text-2xl sm:text-3xl font-bold">{"You're on the right path"}</h2>
            <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base">
              Head to your dashboard to track progress, study topics, and unlock achievements.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
              <Link href={getDashboardHref()} className="inline-block bg-sky-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full hover:bg-sky-600 transition text-sm sm:text-base">
                Go to Dashboard
              </Link>
              <Link href="/subjects" className="inline-block bg-white border border-slate-200 text-slate-700 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full hover:bg-slate-50 transition text-sm sm:text-base">
                Explore Subjects
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl sm:text-3xl font-bold">Start Learning with Confidence</h2>
            <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base">
              Join students who are already transforming their knowledge.
            </p>
            <Link href="/signup" className="inline-block mt-6 sm:mt-8 bg-sky-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full hover:bg-sky-600 transition text-sm sm:text-base">
              Get Started
            </Link>
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
