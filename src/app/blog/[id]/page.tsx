'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  ArrowLeft
} from 'lucide-react';
import Footer from '@/components/Footer';
import PublicNav from '@/components/PublicNav';

export default function BlogDetailPage() {
  const router = useRouter();

  const article = {
    title: "10 Essential Tips to Master Full Stack Development in 2026",
    author: "Dr. Amit Kumar",
    date: "January 15, 2025",
    readTime: "8 min read",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    content: [
      "Full Stack Development continues to be one of the most in-demand skills in 2026...",
      "The first and most important step is building a strong foundation...",
      "Choosing the right tech stack is equally important...",
      "Frontend development in 2026 is more than just designing pages...",
      "On the backend side, you must understand how servers, APIs, and databases communicate...",
      "Databases are the backbone of any application...",
      "In 2026, deployment knowledge is no longer optional...",
      "Building real-world projects is one of the fastest ways to grow...",
      "Writing clean and scalable code is another essential habit...",
      "Finally, continuous learning is the key to long-term success..."
    ]
  };

  const relatedArticles = [
    {
      id: 1,
      title: "How to Transition from Non-Tech to Tech Career",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978"
    },
    {
      id: 2,
      title: "How to Transition from Non-Tech to Tech Career",
      image:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c"
    },
    {
      id: 3,
      title: "How to Transition from Non-Tech to Tech Career",
      image:
        "https://images.unsplash.com/photo-1492724441997-5dc865305da7"
    }
  ];

  return (
    <div className="isit-cosmic-bg min-h-screen flex flex-col text-cyan-50">
      <PublicNav active="blog" />

      {/* ================= HERO IMAGE ================= */}
      <div className="relative h-[420px] w-full overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* ================= ARTICLE CARD ================= */}
      <main className="flex-1 max-w-4xl mx-auto px-6 -mt-40 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-200">

          {/* Back */}
          <button
            onClick={() => router.push('/blog')}
            className="flex items-center gap-2 text-sm text-sky-600 font-medium hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </button>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mt-6 leading-tight">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-6 text-sm text-gray-600 mt-6 border-b border-gray-200 pb-6">
            <span className="font-medium">{article.author}</span>
            <span className="flex items-center gap-1">
              <Calendar size={14} /> {article.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} /> {article.readTime}
            </span>
          </div>

          {/* Share */}
          <div className="flex items-center gap-4 mt-6 text-gray-500">
            <span className="text-sm">Share:</span>
            <Facebook className="cursor-pointer hover:text-blue-600" size={18}/>
            <Twitter className="cursor-pointer hover:text-blue-400" size={18}/>
            <Linkedin className="cursor-pointer hover:text-blue-700" size={18}/>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8"></div>

          {/* Article Body */}
          <div className="space-y-6 text-gray-700 leading-relaxed text-[15px]">
            {article.content.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* About Author */}
          <div className="mt-10 bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">
              About the Author
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                D
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {article.author}
                </p>
                <p className="text-sm text-gray-600">
                  Educator and industry expert with 10+ years experience.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ================= RELATED ARTICLES ================= */}
        <section className="mt-20">
          <h2 className="text-xl font-semibold text-gray-900 mb-8">
            Related Articles
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {relatedArticles.map(article => (
              <div
                key={article.id}
                onClick={() => router.push(`/blog/${article.id}`)}
                className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition"
              >
                <img
                  src={article.image}
                  className="h-44 w-full object-cover"
                  alt={article.title}
                />
                <div className="p-5">
                  <span className="text-xs text-sky-600 bg-sky-100 px-3 py-1 rounded-full">
                    Career Advice
                  </span>
                  <h4 className="mt-4 text-sm font-semibold text-gray-900 leading-snug">
                    {article.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="mt-24">
        <Footer />
      </footer>

    </div>
  );
}
