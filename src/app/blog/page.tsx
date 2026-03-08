'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Clock, ArrowRight } from 'lucide-react';

export default function BlogPage() {
  const router = useRouter();

  const featuredArticle = {
    id: "featured",
    title: "10 Essential Tips to Master Full Stack Development in 2026",
    category: "Study Tips",
    author: "Dr. Amit Kumar",
    date: "Jan 15, 2025",
    readTime: "8 min read",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    description:
      "Discover the most effective strategies and best practices to become a proficient full stack developer. Learn about the latest frameworks, tools, and methodologies that are shaping the industry."
  };

  const articles = [
    {
      id: 1,
      title: "How to Transition from Non-Tech to Tech Career",
      category: "Career Advice",
      author: "Priya Mehta",
      date: "Jan 12",
      readTime: "6 min read",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978",
      description:
        "A comprehensive guide for professionals looking to switch careers into technology. Real success stories and actionable steps."
    },
    {
      id: 2,
      title: "How to Transition from Non-Tech to Tech Career",
      category: "Career Advice",
      author: "Priya Mehta",
      date: "Jan 12",
      readTime: "6 min read",
      image:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
      description:
        "Real success stories and actionable steps to help you land your first tech job."
    },
    {
      id: 3,
      title: "How to Transition from Non-Tech to Tech Career",
      category: "Career Advice",
      author: "Priya Mehta",
      date: "Jan 12",
      readTime: "6 min read",
      image:
        "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
      description:
        "Practical advice and real-world case studies to accelerate your tech journey."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ================= NAVBAR ================= */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-sky-600 font-bold text-xl">
            ISIT
          </Link>

          <nav className="hidden md:flex gap-10 text-sm font-medium text-gray-800">
            <Link href="/">Home</Link>
            <Link href="/courses">Courses</Link>
            <Link href="/how-it-works">How it Works</Link>
            <Link href="/stories">Stories</Link>
            <Link href="/blog" className="border-b-2 border-sky-600 pb-1">
              Blog
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <span className="text-sm text-gray-700">LAN ▾</span>
            <Link
              href="/signup"
              className="bg-black text-white px-5 py-2 rounded-full text-sm hover:bg-gray-800 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="bg-[#DCEEF7] py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900">
          Our <span className="text-sky-600">Blog</span>
        </h1>

        <p className="text-gray-800 mt-4 max-w-2xl mx-auto">
          Insights, tips, and resources to help you succeed in your learning journey
        </p>

        <div className="max-w-xl mx-auto mt-8 relative">
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
          />
        </div>
      </section>

      {/* Categories */}
      <div className="bg-white py-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-3 justify-center">
          {['All', 'Study Tips', 'Career Advice', 'Course Updates', 'Industry Trends', 'Student Life']
            .map((cat, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  index === 0
                    ? 'bg-sky-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-sky-100'
                }`}
              >
                {cat}
              </button>
            ))}
        </div>
      </div>

      {/* ================= MAIN ================= */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 w-full">

        {/* FEATURED */}
        <h2 className="text-2xl font-bold mb-8 text-gray-900">
          Featured Article
        </h2>

        <div
          onClick={() => router.push('/blog/featured')}
          className="bg-white rounded-2xl shadow border border-gray-300 overflow-hidden grid md:grid-cols-2 cursor-pointer hover:shadow-lg transition"
        >
          <img
            src={featuredArticle.image}
            className="w-full h-full object-cover"
            alt={featuredArticle.title}
          />

          <div className="p-8 flex flex-col justify-center">
            <span className="text-xs font-semibold text-sky-700 bg-sky-100 px-3 py-1 rounded-full w-fit">
              {featuredArticle.category}
            </span>

            <h3 className="text-2xl font-bold mt-4 text-gray-900">
              {featuredArticle.title}
            </h3>

            <p className="text-gray-700 mt-4">
              {featuredArticle.description}
            </p>

            <div className="flex items-center gap-6 text-sm text-gray-700 mt-6">
              <span>{featuredArticle.author}</span>
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {featuredArticle.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} /> {featuredArticle.readTime}
              </span>
            </div>

            <span className="mt-6 text-sky-600 font-semibold flex items-center gap-2">
              Read More <ArrowRight size={16} />
            </span>
          </div>
        </div>

        {/* LATEST */}
        <h2 className="text-2xl font-bold mt-20 mb-8 text-gray-900">
          Latest Articles
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(article => (
            <div
              key={article.id}
              onClick={() => router.push(`/blog/${article.id}`)}
              className="bg-white rounded-xl shadow border border-gray-300 overflow-hidden cursor-pointer hover:shadow-lg transition"
            >
              <img
                src={article.image}
                className="h-48 w-full object-cover"
                alt={article.title}
              />

              <div className="p-6">
                <span className="text-xs font-semibold text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
                  {article.category}
                </span>

                <h4 className="text-lg font-bold mt-4 text-gray-900">
                  {article.title}
                </h4>

                <p className="text-gray-700 text-sm mt-3">
                  {article.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-700 mt-6">
                  <span>{article.author}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {article.readTime}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ================= NEWSLETTER ================= */}
      <section className="bg-gradient-to-r from-[#4CC9F0] via-[#3A86FF] to-[#4361EE] py-20 text-white text-center">

        <h2 className="text-3xl font-bold">
          Stay Updated with Our Newsletter
        </h2>
        <p className="mt-4 text-white">
          Get the latest articles, tips, and exclusive content delivered to your inbox
        </p>

        <div className="max-w-md mx-auto mt-8 flex gap-4">
  <input
    type="email"
    placeholder="Enter your email"
    className="flex-1 px-5 py-3 rounded-lg bg-white border border-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white shadow-md"
  />
  <button className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-md">
    Subscribe
  </button>
</div>

      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-black text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-white text-xl font-semibold">
              Indian School of Innovation and Thinking
            </h3>
            <p className="mt-4 text-sm text-gray-300">
              Empowering the next generation of thinkers and innovators through world-class education.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm">
            <div>
              <p className="text-white mb-4">Quick Links</p>
              <p className="hover:text-white cursor-pointer">Home</p>
              <p className="hover:text-white cursor-pointer">Courses</p>
              <p className="hover:text-white cursor-pointer">How it Works</p>
              <p className="hover:text-white cursor-pointer">Stories</p>
              <p className="hover:text-white cursor-pointer">Blog</p>
            </div>
            <div>
              <p className="text-white mb-4">Legal</p>
              <p className="hover:text-white cursor-pointer">Privacy Policy</p>
              <p className="hover:text-white cursor-pointer">Terms of Services</p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs mt-12 text-gray-400">
          © 2026 Indian School of Innovation and Thinking. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
