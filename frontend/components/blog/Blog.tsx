'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Blog() {
  const blogs = [
    {
      id: 1,
      date: {
        day: '28',
        month: 'OCT'
      },
      title: 'These two dogs are best friends for life',
      excerpt: 'Love to play with owner\'s hair lie cats secretly make all the worlds muffins kick up litter dream about hunting birds.',
      likes: 32,
      comments: 16,
      image: '/images/blog1.jpg',
      featured: true
    },
    {
      id: 2,
      date: {
        day: '29',
        month: 'OCT'
      },
      title: 'These two dogs are best friends for life',
      excerpt: 'Love to play with owner\'s hair lie cats secretly make all the worlds muffins kick up litter dream about hunting birds.',
      likes: 28,
      comments: 18,
      image: '/images/blog2.jpg',
      featured: false
    },
    {
      id: 3,
      date: {
        day: '01',
        month: 'NOV'
      },
      title: 'These two dogs are best friends for life',
      excerpt: 'Love to play with owner\'s hair lie cats secretly make all the worlds muffins kick up litter dream about hunting birds.',
      likes: 18,
      comments: 9,
      image: '/images/blog3.jpg',
      featured: false
    },
    {
      id: 4,
      date: {
        day: '03',
        month: 'NOV'
      },
      title: 'These two dogs are best friends for life',
      excerpt: 'Love to play with owner\'s hair lie cats secretly make all the worlds muffins kick up litter dream about hunting birds.',
      likes: 15,
      comments: 10,
      image: '/images/blog4.jpg',
      featured: false
    }
  ];

  const featuredBlog = blogs.find(blog => blog.featured);
  const sideBlogs = blogs.filter(blog => !blog.featured);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            LATEST BLOG
          </h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-0.5 w-16 bg-[#ec6d13]"></div>
            <svg className="w-6 h-6 text-[#ec6d13]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
            <div className="h-0.5 w-16 bg-[#ec6d13]"></div>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Thug cat destroy couch eat the fat cats food chirp at birds lie on your belly and purr when you are asleep with tail in the air.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Featured Blog */}
          {featuredBlog && (
            <div className="group">
              <div className="relative overflow-hidden rounded-lg shadow-lg mb-6">
                <div className="relative h-96">
                  <Image
                    src={featuredBlog.image}
                    alt={featuredBlog.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                {/* Date Badge */}
                <div className="absolute bottom-6 left-6 bg-[#ec6d13] text-white text-center p-3 rounded">
                  <div className="text-2xl font-bold">{featuredBlog.date.day}</div>
                  <div className="text-sm">{featuredBlog.date.month}</div>
                </div>

                {/* Stats Overlay */}
                <div className="absolute bottom-6 right-6 flex gap-4 text-white text-sm">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{featuredBlog.likes} Likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{featuredBlog.comments} Comments</span>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#ec6d13] transition-colors">
                {featuredBlog.title}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {featuredBlog.excerpt}
              </p>
              <Link href="/blog" className="text-green-500 font-semibold text-sm flex items-center gap-2 hover:gap-4 transition-all duration-300">
                READ MORE
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}

          {/* Side Blogs */}
          <div className="space-y-6">
            {sideBlogs.map((blog) => (
              <Link key={blog.id} href="/blog" className="flex gap-6 group">
                {/* Date Badge */}
                <div className="shrink-0 bg-[#ec6d13] text-white text-center p-3 rounded h-fit">
                  <div className="text-xl font-bold">{blog.date.day}</div>
                  <div className="text-xs">{blog.date.month}</div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#ec6d13] transition-colors duration-300 line-clamp-2">
                    {blog.title}
                  </h3>
                  
                  {/* Stats */}
                  <div className="flex gap-4 text-gray-500 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{blog.likes} Likes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{blog.comments} Comments</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {blog.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* View All Blogs Button */}
        <div className="text-center mt-12">
          <Link 
            href="/blog" 
            className="inline-block bg-[#ec6d13] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#d55e0f] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View All Blog Posts
          </Link>
        </div>
      </div>
    </section>
  );
}
