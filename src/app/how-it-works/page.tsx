'use client';

import Link from 'next/link';
import { BarChart, BookOpen, Code, Award, Clock, Users, CheckCircle } from 'lucide-react';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';

export default function HowItWorksPage() {
  return (
    <div className="isit-cosmic-bg min-h-screen text-cyan-50">
      <PublicNav active="how-it-works" />

      {/* ================= HERO SECTION ================= */}
      <section className="py-16 sm:py-24 text-center px-4 sm:px-6">
        <RevealOnView>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 sm:mb-6">
            How It Works
          </h1>
          <p className="text-base sm:text-xl text-cyan-100/80 max-w-2xl mx-auto">
            A simple, proven process to take you from beginner to expert.
          </p>
        </div>
        </RevealOnView>
      </section>

      {/* ================= STEP 1: CHOOSE YOUR PATH ================= */}
      <section className="py-10 sm:py-20">
        <RevealOnView>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-8 sm:gap-16">
          
          {/* Text Content */}
          <div className="md:w-1/2 isit-glass rounded-3xl p-6 sm:p-8">
            <div className="text-sky-500 font-bold uppercase tracking-wider mb-2">Step 01</div>
            <h2 className="text-3xl font-bold text-cyan-100 mb-6">Choose Your Path</h2>
            <p className="text-cyan-100/80 text-lg mb-8">
              Start with a skill assessment to determine your current level. We recommend the best learning paths tailored to your career goals.
            </p>
            <ul className="space-y-4">
              {[
                "Personalized recommendations",
                "Skill assessment tools",
                "Career-focused learning paths",
                "Industry-recognized certifications"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-cyan-100/80">
                  <div className="w-6 h-6 bg-cyan-400/20 text-cyan-300 rounded-full flex items-center justify-center">
                    <CheckCircle size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Graphic */}
          <div className="md:w-1/2 flex justify-center">
            <div className="w-full max-w-md h-80 isit-glass rounded-3xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20"></div>
              <div className="relative z-10 bg-slate-950/75 p-8 rounded-full border border-cyan-300/20 shadow-xl">
                <BarChart size={64} className="text-cyan-300" />
              </div>
            </div>
          </div>
        </div>
        </RevealOnView>
      </section>

      {/* ================= STEP 2: LEARN AT YOUR PACE ================= */}
      <section className="py-20">
        <RevealOnView delayMs={40}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row-reverse items-center gap-16">
          
          {/* Text Content */}
          <div className="md:w-1/2 isit-glass rounded-3xl p-6 sm:p-8">
            <div className="text-sky-500 font-bold uppercase tracking-wider mb-2">Step 02</div>
            <h2 className="text-3xl font-bold text-cyan-100 mb-6">Learn at Your Pace</h2>
            <p className="text-cyan-100/80 text-lg mb-8">
              No rigid schedules. Learn whenever and wherever you want. Our platform is optimized for all devices.
            </p>
            <ul className="space-y-4">
              {[
                "HD video lectures",
                "Downloadable resources",
                "Mobile-friendly interface",
                "Lifetime access to courses"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-cyan-100/80">
                  <div className="w-6 h-6 bg-cyan-400/20 text-cyan-300 rounded-full flex items-center justify-center">
                    <CheckCircle size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Graphic */}
          <div className="md:w-1/2 flex justify-center">
            <div className="w-full max-w-md h-80 isit-glass rounded-3xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20"></div>
              <div className="relative z-10 bg-slate-950/75 p-8 rounded-full border border-cyan-300/20 shadow-xl">
                <BookOpen size={64} className="text-cyan-300" />
              </div>
            </div>
          </div>
        </div>
        </RevealOnView>
      </section>

      {/* ================= STEP 3: PRACTICE & APPLY ================= */}
      <section className="py-20">
        <RevealOnView delayMs={30}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          
          {/* Text Content */}
          <div className="md:w-1/2 isit-glass rounded-3xl p-6 sm:p-8">
            <div className="text-sky-500 font-bold uppercase tracking-wider mb-2">Step 03</div>
            <h2 className="text-3xl font-bold text-cyan-100 mb-6">Practice & Apply</h2>
            <p className="text-cyan-100/80 text-lg mb-8">
              Theory is good, practice is better. Build real-world projects directly in the browser to solidify your knowledge.
            </p>
            <ul className="space-y-4">
              {[
                "Real-world project scenarios",
                "Interactive coding environment",
                "Instant automated feedback",
                "Collaborative peer reviews"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-cyan-100/80">
                  <div className="w-6 h-6 bg-cyan-400/20 text-cyan-300 rounded-full flex items-center justify-center">
                    <CheckCircle size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Graphic */}
          <div className="md:w-1/2 flex justify-center">
            <div className="w-full max-w-md h-80 isit-glass rounded-3xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20"></div>
              <div className="relative z-10 bg-slate-950/75 p-8 rounded-full border border-cyan-300/20 shadow-xl">
                <Code size={64} className="text-cyan-300" />
              </div>
            </div>
          </div>
        </div>
        </RevealOnView>
      </section>

      {/* ================= STEP 4: TRACK & SUCCEED ================= */}
      <section className="py-20">
        <RevealOnView delayMs={30}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row-reverse items-center gap-16">
          
          {/* Text Content */}
          <div className="md:w-1/2 isit-glass rounded-3xl p-6 sm:p-8">
            <div className="text-sky-500 font-bold uppercase tracking-wider mb-2">Step 04</div>
            <h2 className="text-3xl font-bold text-cyan-100 mb-6">Track & Succeed</h2>
            <p className="text-cyan-100/80 text-lg mb-8">
              Monitor your daily progress, earn badges for milestones, and get certified to boost your resume.
            </p>
            <ul className="space-y-4">
              {[
                "Daily progress tracking",
                "Gamified badges & rewards",
                "Shareable certificates",
                "LinkedIn profile integration"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-cyan-100/80">
                  <div className="w-6 h-6 bg-cyan-400/20 text-cyan-300 rounded-full flex items-center justify-center">
                    <CheckCircle size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Graphic */}
          <div className="md:w-1/2 flex justify-center">
            <div className="w-full max-w-md h-80 isit-glass rounded-3xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20"></div>
              <div className="relative z-10 bg-slate-950/75 p-8 rounded-full border border-cyan-300/20 shadow-xl">
                <Award size={64} className="text-cyan-300" />
              </div>
            </div>
          </div>
        </div>
        </RevealOnView>
      </section>

      {/* ================= WHY OUR METHOD WORKS (Grid) ================= */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <RevealOnView>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Our Method Works</h2>
            <p className="text-cyan-100/75 max-w-2xl mx-auto">Our unique blend of technology and pedagogy ensures you learn faster and retain more.</p>
          </div>
          </RevealOnView>

          <RevealStagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="isit-glass p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-slate-950/70 text-cyan-300 rounded-full border border-cyan-300/20 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-cyan-100">Learn Anytime</h3>
              <p className="text-cyan-100/75 text-sm">24/7 access to content allows you to learn around your busy schedule.</p>
            </div>

            {/* Card 2 */}
            <div className="isit-glass p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-slate-950/70 text-cyan-300 rounded-full border border-cyan-300/20 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-cyan-100">Expert Instructors</h3>
              <p className="text-cyan-100/75 text-sm">Learn from industry leaders who have worked at top companies.</p>
            </div>

            {/* Card 3 */}
            <div className="isit-glass p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-slate-950/70 text-cyan-300 rounded-full border border-cyan-300/20 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-cyan-100">Earn Certificates</h3>
              <p className="text-cyan-100/75 text-sm">Get verified certificates upon course completion to showcase skills.</p>
            </div>

            {/* Card 4 */}
            <div className="isit-glass p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-slate-950/70 text-cyan-300 rounded-full border border-cyan-300/20 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Award size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-cyan-100">Global Community</h3>
              <p className="text-cyan-100/75 text-sm">Join learners from around the world in our growing community.</p>
            </div>
          </RevealStagger>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-24 text-center px-6">
        <RevealOnView>
        <h2 className="text-3xl font-bold">Start Learning with Confidence</h2>
        <p className="text-cyan-100/75 mt-4 max-w-2xl mx-auto">
          Join thousands of students who are already transforming their careers. No credit card required to start.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/signup" 
            className="bg-sky-500 text-white px-8 py-3 rounded-full font-medium hover:bg-sky-600 transition"
          >
            Get Started
          </Link>
          <Link 
            href="/courses" 
            className="isit-btn-secondary"
          >
            Browse Courses
          </Link>
        </div>
        </RevealOnView>
      </section>

      <Footer />

    </div>
  );
}