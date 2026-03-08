'use client';

import Link from 'next/link';
import { Users, Award, TrendingUp, Star, MapPin, Briefcase, Quote } from 'lucide-react';
import PublicNav from '@/components/PublicNav';

export default function StoriesPage() {
  
  const stories = [
    {
      id: 1,
      name: "Harry Potter",
      location: "Mumbai, India",
      course: "Full Stack Web Development",
      outcome: "Software Engineer at Google",
      salaryGrowth: "60% Salary Hike",
      image: "HP", // Placeholder for Avatar Initials
      quote: "The project-based learning approach helped me land my dream job at Google. The mentors were incredibly supportive."
    },
    {
      id: 2,
      name: "Hermione Granger",
      location: "New Delhi, India",
      course: "Data Science & Analytics",
      outcome: "Data Analyst at Microsoft",
      salaryGrowth: "50% Salary Hike",
      image: "HG",
      quote: "I went from knowing nothing about Python to building complex ML models in just 6 months."
    },
    {
      id: 3,
      name: "Ron Weasley",
      location: "Bangalore, India",
      course: "Cloud Computing",
      outcome: "DevOps Engineer at Amazon",
      salaryGrowth: "70% Salary Hike",
      image: "RW",
      quote: "The real-world labs gave me the confidence to handle production environments immediately."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 flex flex-col">
      <PublicNav active="stories" />

      {/* ================= HERO / STATS SECTION ================= */}
      <section className="bg-white pt-10 sm:pt-16 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Success Stories
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real career transformations. Real results. See how our students are changing their lives with ISIT.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 border-t border-gray-100 pt-8 sm:pt-12">
            {[
              { value: "50K+", label: "Active Learners", icon: Users },
              { value: "95%", label: "Success Rate", icon: Award },
              { value: "40%", label: "Avg Salary Growth", icon: TrendingUp },
              { value: "4.5/5", label: "Average Rating", icon: Star },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition">
                    <stat.icon size={24} />
                  </div>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STORIES GRID ================= */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Hear From Our Successful Students</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base">
              Join thousands of students who have transformed their careers through our practical, industry-focused courses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {stories.map((story) => (
              <div key={story.id} className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-100 p-5 sm:p-8 flex flex-col h-full hover:shadow-xl transition">
                
                {/* Header: Avatar & Name */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold text-xl">
                      {story.image}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{story.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={12} /> {story.location}
                      </div>
                    </div>
                  </div>
                  <Quote className="text-sky-100" size={40} />
                </div>

                {/* Course Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Course</p>
                  <p className="font-semibold text-gray-900">{story.course}</p>
                </div>

                {/* Outcome */}
                <div className="mb-6">
                   <p className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-1">Now at</p>
                   <div className="flex items-center gap-2 mb-2">
                      <Briefcase size={18} className="text-gray-700" />
                      <h4 className="font-bold text-lg text-gray-900">{story.outcome}</h4>
                   </div>
                   <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                      <TrendingUp size={16} />
                      {story.salaryGrowth}
                   </div>
                </div>

                {/* Testimonial Quote */}
                <p className="text-gray-600 italic text-sm mt-auto pt-4 border-t border-gray-100">
                  "{story.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURED STORY (Large CTA Area) ================= */}
      <section className="bg-sky-50 py-20 px-6">
        <div className="max-w-7xl mx-auto">
           <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
              {/* Decorative Circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-10 -mb-10"></div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">
                 Ready to Write Your Success Story?
              </h2>
              <p className="text-lg text-sky-100 mb-10 max-w-2xl mx-auto relative z-10">
                 Join thousands of successful students and transform your career today.
              </p>
              <Link 
                href="/signup" 
                className="inline-block bg-white text-sky-600 font-bold px-8 py-4 rounded-full shadow-lg hover:bg-gray-100 transition relative z-10"
              >
                 Get Started Now
              </Link>
           </div>
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