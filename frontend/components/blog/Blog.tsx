'use client';

import { useEffect, useState } from 'react';
import LatestBlogSection from '@/components/blog/LatestBlogSection';
import { fetchBlogPosts, toDisplayPost, type BlogPostDisplay } from '@/lib/blog';

const HOME_BLOG_LIMIT = 4;

export default function Blog() {
  const [posts, setPosts] = useState<BlogPostDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts(HOME_BLOG_LIMIT).then((res) => {
      if (res.ok) {
        setPosts(res.data.posts.map(toDisplayPost));
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section className="bg-gray-50 py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-4 text-center text-gray-500">Loading latest articles…</div>
      </section>
    );
  }

  return <LatestBlogSection posts={posts} />;
}
