'use client';

import Link from 'next/link';
import { BarChart, BookOpen, Code, Award, Clock, Users, CheckCircle } from 'lucide-react';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <PublicNav active="how-it-works" />

      {/* ================= HERO SECTION ================= */}
      <section className="bg-[#F8FAFC] py-16 sm:py-24 text-center px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 sm:mb-6">
            How It Works
          </h1>
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto">
            A simple, proven process to take you from beginner to expert.
          </p>
        </div>
      </section>

      {/* ================= STEP 1: CHOOSE YOUR PATH ================= */}
      <section className="py-10 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-8 sm:gap-16">
          
          {/* Text Content */}
          <div className="md:w-1/2">
            <div className="text-sky-500 font-bold uppercase tracking-wider mb-2">Step 01</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Choose Your Path</h2>
            <p className="text-gray-600 text-lg mb-8">
              Start with a skill assessment to determine your current level. We recommend the best learning paths tailored to your career goals.
            </p>
            <ul className="space-y-4">
              {[
                "Personalized recommendations",
                "Skill assessment tools",
                "Career-focused learning paths",
                "Industry-recognized certifications"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700">
                  <div className="w-6 h-6 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center">
                    <CheckCircle size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Graphic */}
          <div className="md:w-1/2 flex justify-center">
            <div className="w-full max-w-md h-80 bg-sky-50 rounded-3xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-blue-100"></div>
              <div className="relative z-10 bg-white p-8 rounded-full shadow-xl">
                <BarChart size={64} className="text-sky-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STEP 2: LEARN AT YOUR PACE ================= */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row-reverse items-center gap-16">
          
          {/* Text Content */}
          <div className="md:w-1/2">
            <div className="text-sky-500 font-bold uppercase tracking-wider mb-2">Step 02</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Learn at Your Pace</h2>
            <p className="text-gray-600 text-lg mb-8">
              No rigid schedules. Learn whenever and wherever you want. Our platform is optimized for all devices.
            </p>
            <ul className="space-y-4">
              {[
                "HD video lectures",
                "Downloadable resources",
                "Mobile-friendly interface",
                "Lifetime access to courses"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700">
                  <div className="w-6 h-6 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center">
                    <CheckCircle size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Graphic */}
          <div className="md:w-1/2 flex justify-center">
            <div className="w-full max-w-md h-80 bg-blue-50 rounded-3xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100"></div>
              <div className="relative z-10 bg-white p-8 rounded-full shadow-xl">
                <BookOpen size={64} className="text-sky-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STEP 3: PRACTICE & APPLY ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          
          {/* Text Content */}
          <div className="md:w-1/2">
            <div className="text-sky-500 font-bold uppercase tracking-wider mb-2">Step 03</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Practice & Apply</h2>
            <p className="text-gray-600 text-lg mb-8">
              Theory is good, practice is better. Build real-world projects directly in the browser to solidify your knowledge.
            </p>
            <ul className="space-y-4">
              {[
                "Real-world project scenarios",
                "Interactive coding environment",
                "Instant automated feedback",
                "Collaborative peer reviews"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700">
                  <div className="w-6 h-6 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center">
                    <CheckCircle size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Graphic */}
          <div className="md:w-1/2 flex justify-center">
            <div className="w-full max-w-md h-80 bg-indigo-50 rounded-3xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-sky-50"></div>
              <div className="relative z-10 bg-white p-8 rounded-full shadow-xl">
                <Code size={64} className="text-sky-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STEP 4: TRACK & SUCCEED ================= */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row-reverse items-center gap-16">
          
          {/* Text Content */}
          <div className="md:w-1/2">
            <div className="text-sky-500 font-bold uppercase tracking-wider mb-2">Step 04</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Track & Succeed</h2>
            <p className="text-gray-600 text-lg mb-8">
              Monitor your daily progress, earn badges for milestones, and get certified to boost your resume.
            </p>
            <ul className="space-y-4">
              {[
                "Daily progress tracking",
                "Gamified badges & rewards",
                "Shareable certificates",
                "LinkedIn profile integration"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700">
                  <div className="w-6 h-6 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center">
                    <CheckCircle size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Graphic */}
          <div className="md:w-1/2 flex justify-center">
            <div className="w-full max-w-md h-80 bg-green-50 rounded-3xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100"></div>
              <div className="relative z-10 bg-white p-8 rounded-full shadow-xl">
                <Award size={64} className="text-sky-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY OUR METHOD WORKS (Grid) ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Our Method Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Our unique blend of technology and pedagogy ensures you learn faster and retain more.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="bg-[#F8FAFC] p-8 rounded-2xl shadow-md text-center">
              <div className="w-16 h-16 bg-white text-sky-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Learn Anytime</h3>
              <p className="text-gray-500 text-sm">24/7 access to content allows you to learn around your busy schedule.</p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#F8FAFC] p-8 rounded-2xl shadow-md text-center">
              <div className="w-16 h-16 bg-white text-sky-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Expert Instructors</h3>
              <p className="text-gray-500 text-sm">Learn from industry leaders who have worked at top companies.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#F8FAFC] p-8 rounded-2xl shadow-md text-center">
              <div className="w-16 h-16 bg-white text-sky-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Earn Certificates</h3>
              <p className="text-gray-500 text-sm">Get verified certificates upon course completion to showcase skills.</p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#F8FAFC] p-8 rounded-2xl shadow-md text-center">
              <div className="w-16 h-16 bg-white text-sky-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Award size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Global Community</h3>
              <p className="text-gray-500 text-sm">Join 50,000+ learners from around the world.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="bg-[#F8FAFC] py-24 text-center px-6">
        <h2 className="text-3xl font-bold">Start Learning with Confidence</h2>
        <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
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
            className="bg-white border border-gray-200 text-gray-900 px-8 py-3 rounded-full font-medium hover:bg-gray-50 transition"
          >
            Browse Courses
          </Link>
        </div>
      </section>

      <Footer />

    </div>
  );
}