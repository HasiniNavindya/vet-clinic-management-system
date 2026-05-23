'use client';

import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '@/components/home/SectionHeader';

const BLOG_POSTS = [
  {
    id: 1,
    date: { day: '12', month: 'MAY' },
    title: '5 signs your dog needs a wellness check this season',
    excerpt:
      'From appetite changes to coat quality — learn when to book a routine visit before small issues become urgent.',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=900&q=80',
    featured: true,
  },
  {
    id: 2,
    date: { day: '08', month: 'MAY' },
    title: 'Indoor cats: vaccination schedules that actually work',
    excerpt:
      'Even stay-at-home cats benefit from core vaccines. We break down timing, boosters, and what to expect at the clinic.',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80',
    featured: false,
  },
  {
    id: 3,
    date: { day: '01', month: 'MAY' },
    title: 'Grooming at home vs. professional grooming',
    excerpt:
      'Brushing, nail trims, and ear care — when DIY is enough and when to bring your pet in for a full groom.',
    image: 'https://images.unsplash.com/photo-1516734212184-a967f81ad0d4?w=400&q=80',
    featured: false,
  },
  {
    id: 4,
    date: { day: '22', month: 'APR' },
    title: 'What to pack for your pet’s first daycare visit',
    excerpt:
      'Vaccination records, comfort items, and feeding notes help our team give your pet a calm, happy day.',
    image: 'https://images.unsplash.com/photo-1450778869485-4d7b8fffb879?w=400&q=80',
    featured: false,
  },
];

export default function Blog() {
  const featuredBlog = BLOG_POSTS.find((b) => b.featured);
  const sideBlogs = BLOG_POSTS.filter((b) => !b.featured);

  return (
    <section className="bg-gray-50 py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Latest From Our Blog"
          subtitle="Practical tips on nutrition, preventive care, grooming, and everyday pet wellness."
        />

        <div className="grid gap-8 lg:grid-cols-2">
          {featuredBlog && (
            <article className="group">
              <Link href="/blog" className="block">
                <div className="relative mb-6 overflow-hidden rounded-2xl shadow-lg">
                  <div className="relative h-72 sm:h-80 md:h-96">
                    <Image
                      src={featuredBlog.image}
                      alt={featuredBlog.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                  <div className="absolute bottom-6 left-6 rounded bg-[#ec6d13] p-3 text-center text-white">
                    <div className="text-2xl font-bold">{featuredBlog.date.day}</div>
                    <div className="text-sm">{featuredBlog.date.month}</div>
                  </div>
                </div>
                <h3 className="mb-3 text-gray-900 transition-colors group-hover:text-[#ec6d13]">
                  {featuredBlog.title}
                </h3>
                <p className="mb-4 leading-relaxed text-gray-600">{featuredBlog.excerpt}</p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#ec6d13] transition group-hover:gap-3">
                  Read more →
                </span>
              </Link>
            </article>
          )}

          <div className="space-y-6">
            {sideBlogs.map((blog) => (
              <Link
                key={blog.id}
                href="/blog"
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
                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#ec6d13]">
                    <span>
                      {blog.date.day} {blog.date.month}
                    </span>
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
      </div>
    </section>
  );
}
