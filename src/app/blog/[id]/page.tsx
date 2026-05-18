'use client';

import SiteShell from '@/components/SiteShell';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, Facebook, Twitter, Linkedin, ArrowLeft } from 'lucide-react';
import { useT } from '@/lib/t';
import { getBlogPostById, getRelatedPosts } from '@/lib/blog-data';

export default function BlogDetailPage() {
  const tr = useT();
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const article = getBlogPostById(id);
  const relatedArticles = article ? getRelatedPosts(article.id) : [];

  if (!article) {
    return (
      <SiteShell variant="public" active="blog">
        <main className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Article not found</h1>
          <p className="mt-3 text-slate-400">This post may have been moved or removed.</p>
          <Link href="/blog" className="mt-8 inline-flex text-cyan-300 hover:text-slate-600 dark:text-cyan-200">
            Back to blog
          </Link>
        </main>
      </SiteShell>
    );
  }

  return (
    <SiteShell variant="public" active="blog">
      <div className="relative h-[280px] w-full overflow-hidden sm:h-[360px]">
        <img src={article.image} alt="" className="h-full w-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-[#05070a]/40 to-transparent" />
      </div>

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <article className="-mt-24 rounded-2xl border border-white/[0.1] bg-white dark:bg-white dark:bg-slate-950/90 p-6 shadow-xl backdrop-blur-xl sm:p-10">
          <button
            type="button"
            onClick={() => router.push('/blog')}
            className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-slate-600 dark:text-cyan-200"
          >
            <ArrowLeft size={16} aria-hidden />
            {tr('blogDetailBack')}
          </button>

          <h1 className="mt-6 text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl">{article.title}</h1>

          <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-white/[0.08] pb-6 text-sm text-slate-400">
            <span className="font-medium text-slate-600 dark:text-slate-300">{article.author}</span>
            <span className="inline-flex items-center gap-1">
              <Calendar size={14} /> {article.date}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={14} /> {article.readTime}
            </span>
            <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs text-cyan-200">
              {article.category}
            </span>
          </div>

          <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
            {article.content.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </article>

        {relatedArticles.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{tr('blogDetailRelatedHeading')}</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.id}`}
                  className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] transition hover:border-cyan-400/30"
                >
                  <img src={rel.image} alt="" className="h-36 w-full object-cover" />
                  <div className="p-4">
                    <span className="text-xs isit-accent-text">{rel.category}</span>
                    <h3 className="mt-2 text-sm font-semibold leading-snug text-slate-900 dark:text-white">{rel.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </SiteShell>
  );
}
