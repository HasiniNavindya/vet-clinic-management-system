'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { fetchBlogPostBySlug, formatBlogDateLong, type BlogPost } from '@/lib/blog';

export default function BlogArticlePage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchBlogPostBySlug(slug)
      .then((res) => {
        if (cancelled) return;
        if (res.ok) setPost(res.data.post);
        else setError('Article not found.');
      })
      .catch(() => {
        if (!cancelled) setError('Could not load this article.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {post && !loading && !error ? (
        <section className="relative overflow-hidden pb-12 pt-28">
          <div className="absolute inset-0 z-0">
            <Image
              src={post.image || '/images/services/care-advice.jpg'}
              alt=""
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Link href="/blog" className="text-sm font-semibold text-white/90 hover:text-white">
              ← Back to blog
            </Link>
            <h1 className="mt-6 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 text-white/80">
              {formatBlogDateLong(post.publishedAt)} · {post.readTime} · {post.author}
            </p>
          </div>
        </section>
      ) : (
        <div className="pt-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Link href="/blog" className="text-sm font-semibold text-[#ec6d13] hover:underline">
              ← Back to blog
            </Link>
          </div>
        </div>
      )}

      <article className="pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <p className="mt-12 text-center text-gray-500">Loading article…</p>
          ) : error || !post ? (
            <div className="mt-12 text-center">
              <p className="text-red-600">{error || 'Article not found.'}</p>
              <Link href="/blog" className="mt-4 inline-block font-semibold text-[#ec6d13] hover:underline">
                Browse all articles
              </Link>
            </div>
          ) : (
            <div className="-mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-10">
              <p className="text-xl leading-relaxed text-gray-700">{post.excerpt}</p>
              <div className="mt-8 space-y-4 text-gray-800">
                {(post.content || '')
                  .split(/\n\n+/)
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i} className="leading-relaxed">
                      {para}
                    </p>
                  ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <Footer />
    </div>
  );
}
