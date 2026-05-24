'use client';

import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '@/components/home/SectionHeader';
import type { BlogPostDisplay } from '@/lib/blog';

type Props = {
  posts: BlogPostDisplay[];
  compact?: boolean;
};

export default function LatestBlogSection({ posts, compact }: Props) {
  if (posts.length === 0) {
    return null;
  }

  const [featured, ...sidePosts] = posts;

  return (
    <section className={compact ? 'bg-gray-50 py-14 md:py-16' : 'bg-gray-50 py-24 md:py-28'}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Latest From Our Blog"
          subtitle="Practical tips on nutrition, preventive care, grooming, and everyday pet wellness."
        />

        <div className="grid gap-8 lg:grid-cols-2">
          {featured && (
            <article className="group">
              <Link href={`/blog?post=${featured.slug}`} className="block">
                <div className="relative mb-6 overflow-hidden rounded-2xl shadow-lg">
                  <div className="relative h-72 sm:h-80 md:h-96">
                    <Image
                      src={featured.image}
                      alt={featured.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                  <div className="absolute bottom-6 left-6 rounded bg-[#ec6d13] p-3 text-center text-white">
                    <div className="text-2xl font-bold">{featured.dateBadge.day}</div>
                    <div className="text-sm">{featured.dateBadge.month}</div>
                  </div>
                </div>
                <h3 className="mb-3 text-gray-900 transition-colors group-hover:text-[#ec6d13]">
                  {featured.title}
                </h3>
                <p className="mb-4 leading-relaxed text-gray-600">{featured.excerpt}</p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#ec6d13] transition group-hover:gap-3">
                  Read more →
                </span>
              </Link>
            </article>
          )}

          <div className="space-y-6">
            {sidePosts.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog?post=${blog.slug}`}
                className="group flex gap-4 overflow-hidden rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition hover:shadow-md sm:gap-5"
              >
                <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-32">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="128px"
                  />
                </div>
                <div className="min-w-0 flex-1 py-1">
                  <div className="mb-1 text-xs font-semibold text-[#ec6d13]">
                    {blog.dateBadge.day} {blog.dateBadge.month}
                  </div>
                  <h3 className="line-clamp-2 font-bold text-gray-900 transition-colors group-hover:text-[#ec6d13]">
                    {blog.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">{blog.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex rounded-lg border-2 border-[#ec6d13] px-8 py-3 text-sm font-semibold text-[#ec6d13] transition hover:bg-[#ec6d13] hover:text-white"
          >
            View all articles
          </Link>
        </div>
      </div>
    </section>
  );
}
