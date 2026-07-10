'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlogHero from '@/components/blog/BlogHero';
import BlogCoverImage from '@/components/blog/BlogCoverImage';
import { fetchBlogPosts, toDisplayPost, type BlogPostDisplay } from '@/lib/blog';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    fetchBlogPosts()
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setPosts(res.data.posts.map(toDisplayPost));
        } else {
          const msg = (res.data as { error?: string })?.error;
          setLoadError(
            msg || 'Could not load articles. Restart the backend server if you recently updated the blog API.'
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError('Could not reach the server. Make sure the backend is running on port 5000.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  const featuredPost = useMemo(
    () => filteredPosts.find((p) => p.isFeatured) ?? filteredPosts[0] ?? null,
    [filteredPosts]
  );

  const gridPosts = useMemo(() => {
    if (!featuredPost) return filteredPosts;
    return filteredPosts.filter((p) => p.id !== featuredPost.id);
  }, [filteredPosts, featuredPost]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <BlogHero />

      <section className="border-b border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles by title, topic, or author..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-gray-900 placeholder-gray-500 transition focus:border-[#ec6d13] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ec6d13]/20"
            />
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#ec6d13]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading articles…</div>
      ) : loadError ? (
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <p className="text-red-600">{loadError}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900">No articles yet</h2>
          <p className="mt-3 text-gray-600">
            New pet care articles will appear here once published by the clinic team.
          </p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900">No matching articles</h2>
          <p className="mt-3 text-gray-600">Try a different search term.</p>
        </div>
      ) : (
        <>
          {featuredPost && (
            <section className="bg-white py-12 md:py-16">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Featured</h2>
                <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
                  <div className="grid gap-0 lg:grid-cols-2">
                    <div className="relative h-72 lg:h-80">
                      <BlogCoverImage
                        imagePath={featuredPost.image}
                        alt={featuredPost.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                    <div className="flex flex-col justify-center p-6 md:p-10">
                      <p className="text-sm text-gray-500">
                        {featuredPost.date} · {featuredPost.readTime}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">
                        {featuredPost.title}
                      </h3>
                      <p className="mt-4 line-clamp-3 text-gray-600">{featuredPost.excerpt}</p>
                      <p className="mt-4 text-sm font-medium text-gray-700">{featuredPost.author}</p>
                      <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-[#ec6d13] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d65e0f]"
                      >
                        Read article →
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          )}

          {gridPosts.length > 0 && (
            <section className="py-12 md:py-16">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="mb-8 text-2xl font-bold text-gray-900">Latest articles</h2>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {gridPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                    >
                      <div className="relative h-52 overflow-hidden">
                        <BlogCoverImage
                          imagePath={post.image}
                          alt={post.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                      <div className="p-5">
                        <p className="text-xs text-gray-500">
                          {post.date} · {post.readTime}
                        </p>
                        <h3 className="mt-2 line-clamp-2 text-lg font-bold text-gray-900 group-hover:text-[#ec6d13]">
                          {post.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">{post.excerpt}</p>
                        <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">
                          Read more →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <Footer />
    </div>
  );
}
