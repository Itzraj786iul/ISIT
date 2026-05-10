'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import PublicNav from '@/components/PublicNav';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';
import { Bot, BookOpen, Brain, ChevronRight, GraduationCap, Rocket, Sparkles, Target, Zap } from 'lucide-react';

type SubjectItem = {
  _id: string;
  name: string;
};

type LoggedInUser = { name?: string; email?: string; role?: string };

const PROGRAMS = [
  { title: 'Robotics & Tech', desc: 'Build and code through robotics, AI, and IoT projects.', icon: Bot },
  { title: 'Digital Literacy', desc: 'Navigate, create, and stay safe in the digital world.', icon: GraduationCap },
  { title: 'Marketing & Communication', desc: 'Speak with clarity and influence with confidence.', icon: Rocket },
  { title: 'Entrepreneurship Basics', desc: 'Think, plan, and launch first mini ventures.', icon: Zap },
  { title: 'Academic Support with AI', desc: 'Curriculum aligned support for school subjects.', icon: BookOpen },
  { title: 'Creativity & Innovation Labs', desc: 'Design, experiment, and build original ideas.', icon: Sparkles },
];

export default function HomePage() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<LoggedInUser | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) {
          setUser(null);
          return;
        }
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
          if (json.success && Array.isArray(json.data)) setSubjects(json.data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const getDashboardHref = () => {
    const role = user?.role?.toLowerCase();
    if (role === 'admin') return '/organization';
    if (role === 'teacher') return '/teacher/dashboard';
    if (role === 'parent') return '/parent/dashboard';
    return '/dashboard';
  };

  return (
    <div className="isit-cosmic-bg min-h-screen text-cyan-50">
      <PublicNav active="home" />

      <section className="relative py-12 sm:py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-12">
          <div className="isit-hero-col">
            <span className="isit-chip">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              Future of learning starts here
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.02] sm:text-5xl lg:text-7xl">
              Your Child&apos;s
              <br />
              Personal
              <br />
              <span className="text-cyan-300">AI Tutor</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm text-cyan-50/75 sm:text-base">
              Hyper-personalized learning that adapts to pace, curiosity, and thinking style.
              Real understanding. Future-ready skills for life.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={user ? getDashboardHref() : '/signup'} className="isit-btn-primary">
                Try AI Tutor Now
              </Link>
              <Link href="/courses" className="isit-btn-secondary">
                Explore Programs
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-cyan-100/80">
              <span className="isit-chip">Personalized for every student</span>
              <span className="isit-chip">Aligned with school curriculum</span>
              <span className="isit-chip">Concepts made simple with AI</span>
            </div>
          </div>

          <div className="relative mt-8 min-h-[320px] overflow-hidden rounded-3xl border border-cyan-300/20 bg-slate-900/60 p-5 shadow-2xl shadow-cyan-900/20 motion-safe-transition hover:border-cyan-300/35 md:mt-0">
            <div className="isit-hero-orbit absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/30 bg-slate-950/75 motion-safe-transition" />
            <div className="isit-float-delayed absolute left-8 top-8 max-w-[210px] rounded-2xl border border-cyan-300/25 bg-slate-950/80 p-3 text-sm shadow-lg shadow-cyan-950/30">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-300">AI Tutor</p>
              <p className="mt-1 text-cyan-50/90">Let me explain this with a real world example.</p>
            </div>
            <div className="isit-float-delayed-2 absolute bottom-8 left-8 rounded-2xl border border-cyan-300/25 bg-slate-950/80 p-3 shadow-lg shadow-cyan-950/30">
              <p className="text-[11px] uppercase text-cyan-300">Focus Today</p>
              <p className="text-xl font-bold text-cyan-100">92 mins</p>
            </div>
            <div className="isit-float-delayed-3 absolute right-7 top-16 rounded-2xl border border-cyan-300/25 bg-slate-950/80 p-3 shadow-lg shadow-cyan-950/30">
              <p className="text-[11px] uppercase text-cyan-300">Concept Mastery</p>
              <p className="text-2xl font-black text-cyan-200">85%</p>
            </div>
            <div className="animate-float-soft absolute bottom-8 right-7 rounded-2xl border border-cyan-300/25 bg-slate-950/80 p-3 shadow-lg shadow-cyan-950/30">
              <p className="text-[11px] uppercase text-cyan-300">Your Strength</p>
              <p className="text-lg font-bold text-cyan-100">Logical Thinking</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-cyan-500/10 bg-slate-950/50 py-8">
        <RevealStagger className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:grid-cols-5 sm:px-6">
          {[
            ['AI Tutor', '24/7 doubts solved'],
            ['Smart Learning', 'Adaptive pace'],
            ['Instant Feedback', 'Understand mistakes'],
            ['Track Progress', 'Real-time analytics'],
            ['Build Skills', 'Future-ready outcomes'],
          ].map(([title, desc]) => (
            <div key={title} className="text-center sm:text-left motion-safe-transition hover:translate-y-[-2px]">
              <p className="text-sm font-bold text-cyan-200">{title}</p>
              <p className="text-xs text-cyan-100/60">{desc}</p>
            </div>
          ))}
        </RevealStagger>
      </section>

      <section className="py-16 sm:py-20">
        <RevealOnView>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-2">
          <div className="isit-glass rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">The core differentiator</p>
            <h2 className="mt-3 text-3xl font-black sm:text-5xl">Meet your personal AI tutor</h2>
            <p className="mt-4 text-cyan-100/75">
              Understands how each student learns and adjusts explanations in real-time.
              Instant doubt solving and goal-based roadmaps.
            </p>
            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/60 p-4">
                <p className="font-semibold text-cyan-100">Adaptive Intelligence</p>
                <p className="text-sm text-cyan-100/65">Learns from sessions and continuously personalizes guidance.</p>
              </div>
              <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/60 p-4">
                <p className="font-semibold text-cyan-100">Instant Doubt Resolution</p>
                <p className="text-sm text-cyan-100/65">Step-by-step explanations on any concept at any time.</p>
              </div>
            </div>
          </div>
          <div className="isit-glass rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Live conversation</p>
            <div className="mt-4 space-y-3">
              <div className="mr-6 rounded-2xl border border-cyan-300/20 bg-slate-900/70 p-3 text-sm">
                Hi! I&apos;m your personal AI Tutor. What shall we learn today?
              </div>
              <div className="ml-10 rounded-2xl border border-cyan-300/20 bg-cyan-400/15 p-3 text-right text-sm">
                I&apos;m struggling with quadratic equations.
              </div>
              <div className="mr-6 rounded-2xl border border-cyan-300/20 bg-slate-900/70 p-3 text-sm">
                Let&apos;s break it down with a rocket trajectory example and solve it together.
              </div>
            </div>
          </div>
        </div>
        </RevealOnView>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <RevealOnView delayMs={40}>
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Explore our programs</p>
              <h2 className="mt-2 text-3xl font-black sm:text-5xl">Beyond textbooks. Build skills and mindset.</h2>
            </div>
            <Link href="/courses" className="isit-btn-secondary motion-safe-transition hover:scale-[1.02] active:scale-[0.98]">
              View All Programs
            </Link>
          </div>
          </RevealOnView>
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-56 animate-pulse rounded-2xl border border-cyan-300/15 bg-slate-900/50" />)}
            </div>
          ) : (
            <RevealStagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {PROGRAMS.map((program, i) => {
                const Icon = program.icon;
                const subject = subjects[i % Math.max(subjects.length, 1)];
                return (
                  <Link key={program.title} href={subject ? `/subject/${subject._id}` : '/subjects'} className="block no-underline group">
                    <div className="group h-full overflow-hidden rounded-2xl border border-cyan-300/15 bg-slate-900/60 motion-safe-transition duration-300 hover:-translate-y-1.5 hover:border-cyan-300/45 hover:shadow-[0_20px_40px_rgba(6,182,212,0.12)]">
                      <div className="flex h-40 items-center justify-center border-b border-cyan-300/10 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20">
                        <Icon className="h-12 w-12 text-cyan-200" />
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-cyan-100 transition group-hover:text-cyan-200">{program.title}</h3>
                        <p className="mt-2 text-sm text-cyan-100/70">{program.desc}</p>
                        <div className="mt-4 flex items-center text-sm font-medium text-cyan-300">
                          Explore <ChevronRight className="ml-1 h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </RevealStagger>
          )}
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <RevealOnView>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Core modules, made simple</p>
          <h2 className="mt-2 text-3xl font-black sm:text-5xl">Learn how you learn</h2>
          <p className="mt-3 max-w-3xl text-cyan-100/70">
            These foundational modules unlock every student&apos;s potential using neuroscience-led and experiential learning.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Link href="/courses" className="group block">
              <article className="overflow-hidden rounded-2xl border border-cyan-300/20 bg-slate-900/60 transition hover:border-cyan-300/45">
                <div className="flex h-36 items-center justify-center border-b border-cyan-300/10 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20">
                  <Brain className="h-12 w-12 text-cyan-200" />
                </div>
                <div className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Brain Lab</p>
                  <h3 className="mt-2 text-2xl font-bold text-cyan-100">How the Brain Works</h3>
                  <p className="mt-2 text-sm text-cyan-100/70">
                    Understand memory, focus, and learning behavior to perform better.
                  </p>
                  <p className="mt-4 text-sm font-semibold text-cyan-300">Enroll now -&gt;</p>
                </div>
              </article>
            </Link>
            <Link href="/courses" className="group block">
              <article className="overflow-hidden rounded-2xl border border-cyan-300/20 bg-slate-900/60 transition hover:border-cyan-300/45">
                <div className="flex h-36 items-center justify-center border-b border-cyan-300/10 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
                  <BookOpen className="h-12 w-12 text-cyan-200" />
                </div>
                <div className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Learning Intelligence Lab</p>
                  <h3 className="mt-2 text-2xl font-bold text-cyan-100">How Learning Happens</h3>
                  <p className="mt-2 text-sm text-cyan-100/70">
                    Science-backed methods including spaced repetition, retrieval practice, and flow.
                  </p>
                  <p className="mt-4 text-sm font-semibold text-cyan-300">Enroll now -&gt;</p>
                </div>
              </article>
            </Link>
          </div>
        </div>
        </RevealOnView>
      </section>

      <section className="px-4 pb-8 sm:px-6 sm:pb-14">
        <RevealOnView delayMs={60}>
        <RevealStagger className="mx-auto grid max-w-7xl grid-cols-2 gap-6 rounded-3xl border border-cyan-300/15 bg-slate-900/60 p-8 text-center sm:grid-cols-5">
          <div><h3 className="text-3xl font-black text-cyan-200">10K+</h3><p className="mt-1 text-xs text-cyan-100/60">Students Learning</p></div>
          <div><h3 className="text-3xl font-black text-cyan-200">200+</h3><p className="mt-1 text-xs text-cyan-100/60">Schools Partnered</p></div>
          <div><h3 className="text-3xl font-black text-cyan-200">50+</h3><p className="mt-1 text-xs text-cyan-100/60">Expert Mentors</p></div>
          <div><h3 className="text-3xl font-black text-cyan-200">1000+</h3><p className="mt-1 text-xs text-cyan-100/60">Projects Built</p></div>
          <div><h3 className="text-3xl font-black text-cyan-200">24/7</h3><p className="mt-1 text-xs text-cyan-100/60">AI Tutor Support</p></div>
        </RevealStagger>
        </RevealOnView>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <RevealOnView>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Loved by parents, students, and schools</p>
          <h2 className="mt-2 text-4xl font-black sm:text-6xl">What our community says</h2>
          </RevealOnView>
          <RevealStagger className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              'The AI tutor explains everything so well. I finally understand the topics I used to fear.',
              'ISIC programs are helping my child think independently and build real skills.',
              'The AI-first approach aligned with curriculum is a game changer for schools.',
            ].map((quote, index) => (
              <div key={quote} className="rounded-2xl border border-cyan-300/15 bg-slate-900/60 p-5 motion-safe-transition hover:border-cyan-300/35">
                <p className="text-sm text-cyan-100/90">&quot;{quote}&quot;</p>
                <p className="mt-4 text-xs font-semibold text-cyan-300">Community Voice {index + 1}</p>
              </div>
            ))}
          </RevealStagger>
          <RevealOnView delayMs={80} className="mt-12 text-center">
            <h3 className="text-2xl font-bold">Start your child&apos;s learning journey today</h3>
            <p className="mt-3 text-sm text-cyan-100/70">
              {user ? 'Continue from your dashboard and unlock the next milestone.' : 'Join now and experience personalized AI learning.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href={user ? getDashboardHref() : '/signup'} className="isit-btn-primary">
                {user ? 'Go to Dashboard' : 'Try AI Tutor Now'}
              </Link>
              <Link href="/subjects" className="isit-btn-secondary">
                <Target className="mr-2 h-4 w-4" />
                Explore Subjects
              </Link>
              <Link href="/how-it-works" className="isit-btn-secondary">
                <Brain className="mr-2 h-4 w-4" />
                How It Works
              </Link>
            </div>
          </RevealOnView>
        </div>
      </section>

      <RevealOnView delayMs={40}>
        <Footer />
      </RevealOnView>
    </div>
  );
}
