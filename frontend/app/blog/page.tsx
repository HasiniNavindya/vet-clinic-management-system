'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlogDetailModal from '@/components/blog/BlogDetailModal';
import {
  BLOG_CATEGORIES,
  fetchBlogPosts,
  toDisplayPost,
  type BlogCategory,
  type BlogPostDisplay,
} from '@/lib/blog';

function BlogPageContent() {
  const searchParams = useSearchParams();
  const postSlug = searchParams.get('post');

  const [posts, setPosts] = useState<BlogPostDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<BlogCategory>('all');
  const [selectedBlog, setSelectedBlog] = useState<BlogPostDisplay | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchBlogPosts().then((res) => {
      if (res.ok) {
        setPosts(res.data.posts.map(toDisplayPost));
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!postSlug || posts.length === 0) return;
    const match = posts.find((p) => p.slug === postSlug);
    if (match) {
      setSelectedBlog(match);
      setIsModalOpen(true);
    }
  }, [postSlug, posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [posts, activeCategory, searchQuery]);

  const featuredPost = filteredPosts[0];
  const otherPosts = filteredPosts.slice(1);

  const handleReadMore = (blog: BlogPostDisplay) => {
    setSelectedBlog(blog);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="relative overflow-hidden pt-20 pb-8">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1920&q=80"
            alt="Blog background"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-white sm:mb-6">Pet Care Blog</h1>
            <p className="mx-auto max-w-3xl px-2 text-base text-white/90 sm:text-xl">
              Expert advice, tips, and heartwarming stories for pet lovers everywhere
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-6 max-w-2xl">
            <div className="group relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for articles, tips, or advice..."
                className="w-full rounded-2xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-gray-900 shadow-lg placeholder:text-gray-500 focus:border-[#ec6d13] focus:outline-none focus:ring-4 focus:ring-[#ec6d13]/20 sm:px-6 sm:py-5 sm:pl-14 sm:text-base"
              />
              <svg
                className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#ec6d13]"
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
        </div>
      </section>

      <section className="sticky top-16 z-40 border-b border-gray-200 bg-white py-2 md:top-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {BLOG_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 sm:px-6 sm:py-3 sm:text-base ${
                  activeCategory === category.id
                    ? 'scale-105 bg-[#ec6d13] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:scale-105 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading articles…</div>
      ) : (
        <>
          {featuredPost && (
            <section className="bg-white py-4">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="mb-6 flex items-center gap-2 text-gray-900 sm:mb-8">
                  <svg className="h-8 w-8 text-[#ec6d13]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Featured Article
                </h2>
                <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl transition-all duration-500 hover:shadow-2xl">
                  <div className="grid gap-0 lg:grid-cols-5">
                    <div className="relative min-h-[14rem] h-56 overflow-hidden sm:h-72 md:h-96 lg:col-span-2 lg:h-auto">
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute left-6 top-6 rounded-full bg-gradient-to-r from-[#ec6d13] to-[#d65e0f] px-5 py-2 text-sm font-bold text-white shadow-lg">
                        Featured
                      </div>
                    </div>
                    <div className="flex flex-col justify-center p-5 sm:p-8 lg:col-span-3 lg:p-12">
                      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="rounded-full bg-orange-100 px-4 py-1.5 font-bold capitalize text-[#ec6d13]">
                          {featuredPost.category}
                        </span>
                        <span className="font-medium">{featuredPost.date}</span>
                        <span className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {featuredPost.readTime}
                        </span>
                      </div>
                      <h2 className="mb-4 leading-tight text-gray-900">{featuredPost.title}</h2>
                      <p className="mb-8 text-base leading-relaxed text-gray-600">{featuredPost.excerpt}</p>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#ec6d13] to-[#d65e0f]">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{featuredPost.author}</p>
                            <p className="text-xs text-gray-500">Expert Author</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleReadMore(featuredPost)}
                          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#ec6d13] to-[#d65e0f] px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:shadow-lg"
                        >
                          Read More
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="mb-8 text-gray-900">
                {activeCategory === 'all'
                  ? 'More Articles'
                  : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Articles`}
              </h2>

              {otherPosts.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {otherPosts.map((post) => (
                    <article
                      key={post.id}
                      onClick={() => handleReadMore(post)}
                      onKeyDown={(e) => e.key === 'Enter' && handleReadMore(post)}
                      role="button"
                      tabIndex={0}
                      className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-500 hover:shadow-2xl"
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold capitalize text-[#ec6d13] backdrop-blur-sm">
                          {post.category}
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                          <span>{post.date}</span>
                          <span>•</span>
                          <span>{post.readTime}</span>
                        </div>
                        <h3 className="mb-2 line-clamp-2 text-gray-900 transition-colors group-hover:text-[#ec6d13]">
                          {post.title}
                        </h3>
                        <p className="mb-4 line-clamp-2 text-sm text-gray-600">{post.excerpt}</p>
                        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                          <span className="text-xs font-medium text-gray-600">{post.author}</span>
                          <span className="text-sm font-bold text-[#ec6d13] transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-white py-16 text-center">
                  <h3 className="mb-2 text-gray-900">No Articles Found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search terms</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <BlogDetailModal
        isOpen={isModalOpen}
        blog={selectedBlog}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBlog(null);
        }}
      />

      <Footer />
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">
          Loading blog…
        </div>
      }
    >
      <BlogPageContent />
    </Suspense>
  );
}
