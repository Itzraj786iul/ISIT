'use client';

import SiteShell from '@/components/SiteShell';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Clock, ArrowRight } from 'lucide-react';
import { RevealOnView, RevealStagger } from '@/components/RevealMotion';
import { useT } from '@/lib/t';
import type { I18nKey } from '@/lib/t';

const BLOG_CATEGORY_KEYS: I18nKey[] = [
  'blogCategoryAll',
  'blogCategoryStudyTips',
  'blogCategoryCareerAdvice',
  'blogCategoryCourseUpdates',
  'blogCategoryIndustryTrends',
  'blogCategoryStudentLife',
];

export default function BlogPage() {
  const tr = useT();
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
    <SiteShell variant="public" active="blog">
      {/* ================= HERO ================= */}
      <section className="py-12 sm:py-20 text-center px-4 sm:px-6">
        <RevealOnView>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-gray-900">
          {tr('blogHeroTitle')} <span className="text-sky-600">{tr('blogHeroAccent')}</span>
        </h1>

        <p className="text-slate-700 dark:text-gray-800 mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base">
          {tr('blogHeroLead')}
        </p>

        <div className="max-w-xl mx-auto mt-8 relative">
          <input
            type="text"
            placeholder={tr('blogSearchPlaceholder')}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
          />
        </div>
        </RevealOnView>
      </section>

      {/* Categories */}
      <div className="py-6 border-b border-slate-200 dark:border-cyan-300/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-3 justify-center">
          {BLOG_CATEGORY_KEYS.map((catKey, index) => (
              <button
                key={catKey}
                type="button"
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  index === 0
                    ? 'bg-sky-600 text-white'
                    : 'bg-gray-200 text-slate-700 dark:text-gray-800 hover:bg-sky-100'
                }`}
              >
                {tr(catKey)}
              </button>
            ))}
        </div>
      </div>

      {/* ================= MAIN ================= */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 sm:py-16">

        {/* FEATURED */}
        <RevealOnView delayMs={40}>
        <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-gray-900">
          {tr('blogFeaturedHeading')}
        </h2>

        <div
          onClick={() => router.push('/blog/featured')}
          className="isit-card rounded-2xl shadow-sm border overflow-hidden grid md:grid-cols-2 cursor-pointer motion-safe-transition duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-cyan-300/35"
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

            <h3 className="text-2xl font-bold mt-4 text-slate-900 dark:text-gray-900">
              {featuredArticle.title}
            </h3>

            <p className="text-slate-600 dark:text-gray-700 mt-4">
              {featuredArticle.description}
            </p>

            <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-gray-700 mt-6">
              <span>{featuredArticle.author}</span>
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {featuredArticle.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} /> {featuredArticle.readTime}
              </span>
            </div>

            <span className="mt-6 text-sky-600 font-semibold flex items-center gap-2">
              {tr('blogReadMore')} <ArrowRight size={16} aria-hidden />
            </span>
          </div>
        </div>
        </RevealOnView>

        {/* LATEST */}
        <RevealOnView>
        <h2 className="text-2xl font-bold mt-20 mb-8 text-slate-900 dark:text-gray-900">
          {tr('blogLatestHeading')}
        </h2>
        </RevealOnView>

        <RevealStagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(article => (
            <div
              key={article.id}
              onClick={() => router.push(`/blog/${article.id}`)}
              className="isit-card rounded-xl shadow-sm border overflow-hidden cursor-pointer motion-safe-transition duration-300 hover:shadow-lg hover:-translate-y-1"
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

                <h4 className="text-lg font-bold mt-4 text-slate-900 dark:text-gray-900">
                  {article.title}
                </h4>

                <p className="text-slate-600 dark:text-gray-700 text-sm mt-3">
                  {article.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-gray-700 mt-6">
                  <span>{article.author}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {article.readTime}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </RevealStagger>
      </main>

      {/* ================= NEWSLETTER ================= */}
      <section className="bg-gradient-to-r from-[#4CC9F0] via-[#3A86FF] to-[#4361EE] py-20 text-white text-center">
        <RevealOnView>
        <h2 className="text-3xl font-bold">
          {tr('blogNewsletterTitle')}
        </h2>
        <p className="mt-4 text-slate-900 dark:text-white">
          {tr('blogNewsletterLead')}
        </p>

        <div className="max-w-md mx-auto mt-8 flex gap-4">
  <input
    type="email"
    placeholder={tr('blogNewsletterPlaceholder')}
    className="flex-1 px-5 py-3 rounded-lg bg-white border border-white text-slate-900 dark:text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white shadow-md"
  />
  <button type="button" className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-md">
    {tr('blogNewsletterSubscribe')}
  </button>
</div>
        </RevealOnView>
      </section>
    </SiteShell>
  );
}
