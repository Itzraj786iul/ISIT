'use client';

import Link from 'next/link';
import { Users, Award, TrendingUp, Star, MapPin, Briefcase, Quote } from 'lucide-react';
import PublicNav from '@/components/PublicNav';
import Footer from '@/components/Footer';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';

export default function StoriesPage() {
  
  const stories = [
    {
      id: 1,
      name: "Arjun Mehta",
      location: "Mumbai, India",
      course: "Full Stack Web Development",
      outcome: "Software Engineer at a leading tech firm",
      salaryGrowth: "60% Salary Hike",
      image: "AM",
      quote: "The project-based learning approach helped me build real-world skills. The mentors were incredibly supportive throughout my journey."
    },
    {
      id: 2,
      name: "Priya Sharma",
      location: "New Delhi, India",
      course: "Data Science & Analytics",
      outcome: "Data Analyst at a Fortune 500 company",
      salaryGrowth: "50% Salary Hike",
      image: "PS",
      quote: "I went from knowing nothing about Python to building complex ML models in just 6 months. The structured curriculum made all the difference."
    },
    {
      id: 3,
      name: "Rohan Verma",
      location: "Bangalore, India",
      course: "Cloud Computing",
      outcome: "DevOps Engineer at a top cloud provider",
      salaryGrowth: "70% Salary Hike",
      image: "RV",
      quote: "The hands-on labs gave me the confidence to handle production environments from day one."
    }
  ];

  return (
    <div className="isit-cosmic-bg min-h-screen text-cyan-50 flex flex-col">
      <PublicNav active="stories" />

      {/* ================= HERO / STATS SECTION ================= */}
      <section className="pt-10 sm:pt-16 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <RevealOnView>
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Success Stories</h1>
              <p className="text-lg text-cyan-100/75 max-w-2xl mx-auto">
                Real career transformations. Real results. See how our students are changing their lives with ISIC.
              </p>
            </div>
          </RevealOnView>

          {/* Stats Grid */}
          <RevealStagger className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 border-t border-cyan-300/20 pt-8 sm:pt-12">
            {[
              { value: "Growing", label: "Active Learners", icon: Users },
              { value: "High", label: "Success Rate", icon: Award },
              { value: "Significant", label: "Avg Career Growth", icon: TrendingUp },
              { value: "Top Rated", label: "Student Satisfaction", icon: Star },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-cyan-400/15 text-cyan-300 rounded-full border border-cyan-300/25 flex items-center justify-center group-hover:bg-cyan-400/30 transition">
                    <stat.icon size={24} />
                  </div>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-cyan-100 mb-2">{stat.value}</h3>
                <p className="text-sm text-cyan-100/75">{stat.label}</p>
              </div>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* ================= STORIES GRID ================= */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <RevealOnView>
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Hear From Our Successful Students</h2>
            <p className="text-cyan-100/75 max-w-2xl mx-auto text-sm sm:text-base">
              Join thousands of students who have transformed their careers through our practical, industry-focused courses.
            </p>
          </div>
          </RevealOnView>

          <RevealStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {stories.map((story) => (
              <div key={story.id} className="isit-glass rounded-xl sm:rounded-2xl p-5 sm:p-8 flex flex-col h-full motion-safe-transition duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-cyan-300/35">
                
                {/* Header: Avatar & Name */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-cyan-400/20 text-cyan-200 rounded-full border border-cyan-300/25 flex items-center justify-center font-bold text-xl">
                      {story.image}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-cyan-100">{story.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-cyan-100/70">
                        <MapPin size={12} /> {story.location}
                      </div>
                    </div>
                  </div>
                  <Quote className="text-cyan-300/35" size={40} />
                </div>

                {/* Course Info */}
                <div className="bg-slate-900/70 rounded-xl border border-cyan-300/20 p-4 mb-6">
                  <p className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1">Course</p>
                  <p className="font-semibold text-cyan-100">{story.course}</p>
                </div>

                {/* Outcome */}
                <div className="mb-6">
                   <p className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-1">Now at</p>
                   <div className="flex items-center gap-2 mb-2">
                      <Briefcase size={18} className="text-cyan-200/80" />
                      <h4 className="font-bold text-lg text-cyan-100">{story.outcome}</h4>
                   </div>
                   <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                      <TrendingUp size={16} />
                      {story.salaryGrowth}
                   </div>
                </div>

                {/* Testimonial Quote */}
                <p className="text-cyan-100/75 italic text-sm mt-auto pt-4 border-t border-cyan-300/20">
                  "{story.quote}"
                </p>
              </div>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* ================= FEATURED STORY (Large CTA Area) ================= */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
           <RevealOnView delayMs={50}>
           <div className="bg-gradient-to-r from-cyan-600/35 to-blue-600/35 border border-cyan-300/25 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden motion-safe-transition hover:border-cyan-300/40">
              {/* Decorative Circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-300 opacity-10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-300 opacity-10 rounded-full -ml-10 -mb-10"></div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">
                 Ready to Write Your Success Story?
              </h2>
              <p className="text-lg text-cyan-100/90 mb-10 max-w-2xl mx-auto relative z-10">
                 Join thousands of successful students and transform your career today.
              </p>
              <Link 
                href="/signup" 
                className="inline-block isit-btn-secondary font-bold px-8 py-4 relative z-10"
              >
                 Get Started Now
              </Link>
           </div>
           </RevealOnView>
        </div>
      </section>

      <Footer />

    </div>
  );
}