'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';

type Category = 'all' | 'health' | 'nutrition' | 'training' | 'lifestyle' | 'news';

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const blogPosts = [
    {
      id: 1,
      title: 'Dogs is what all are talking about',
      excerpt: 'Discover the latest trends and conversations in the dog community. From training tips to health advice, learn what every dog owner should know.',
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
      author: 'Dr. Sarah Johnson',
      date: 'January 15, 2026',
      category: 'news',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: '10 Essential Tips for First-Time Pet Owners',
      excerpt: 'Starting your journey as a pet parent? These essential tips will help you provide the best care for your new furry friend from day one.',
      image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80',
      author: 'Mike Peterson',
      date: 'January 12, 2026',
      category: 'lifestyle',
      readTime: '7 min read'
    },
    {
      id: 3,
      title: 'Understanding Your Cat\'s Behavior',
      excerpt: 'Cats communicate in mysterious ways. Learn to decode their body language and understand what your feline friend is trying to tell you.',
      image: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=800&q=80',
      author: 'Dr. Emily Chen',
      date: 'January 10, 2026',
      category: 'training',
      readTime: '6 min read'
    },
    {
      id: 4,
      title: 'The Ultimate Guide to Pet Nutrition',
      excerpt: 'What you feed your pet matters. Explore the science behind pet nutrition and learn how to choose the best diet for your companion.',
      image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&q=80',
      author: 'Jessica Williams',
      date: 'January 8, 2026',
      category: 'nutrition',
      readTime: '8 min read'
    },
    {
      id: 5,
      title: 'Common Health Issues in Senior Pets',
      excerpt: 'As pets age, they require special attention. Learn about common health challenges in senior pets and how to keep them comfortable.',
      image: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800&q=80',
      author: 'Dr. Robert Martinez',
      date: 'January 5, 2026',
      category: 'health',
      readTime: '10 min read'
    },
    {
      id: 6,
      title: 'How to Keep Your Pet Active and Healthy',
      excerpt: 'Regular exercise is crucial for your pet\'s wellbeing. Discover fun activities and exercises to keep your pet physically and mentally fit.',
      image: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=800&q=80',
      author: 'Amanda Brooks',
      date: 'January 3, 2026',
      category: 'health',
      readTime: '5 min read'
    },
    {
      id: 7,
      title: 'Puppy Training 101: Where to Start',
      excerpt: 'Training your puppy doesn\'t have to be overwhelming. Follow these proven techniques to raise a well-behaved and happy dog.',
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80',
      author: 'David Thompson',
      date: 'December 30, 2025',
      category: 'training',
      readTime: '9 min read'
    },
    {
      id: 8,
      title: 'The Benefits of Regular Vet Checkups',
      excerpt: 'Prevention is better than cure. Learn why regular veterinary visits are essential for maintaining your pet\'s long-term health.',
      image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&q=80',
      author: 'Dr. Lisa Anderson',
      date: 'December 28, 2025',
      category: 'health',
      readTime: '6 min read'
    },
    {
      id: 9,
      title: 'Creating a Pet-Friendly Home Environment',
      excerpt: 'Transform your home into a safe and comfortable space for your pets with these practical tips and design ideas.',
      image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&q=80',
      author: 'Sophie Miller',
      date: 'December 25, 2025',
      category: 'lifestyle',
      readTime: '7 min read'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Posts' },
    { id: 'health', name: 'Health' },
    { id: 'nutrition', name: 'Nutrition' },
    { id: 'training', name: 'Training' },
    { id: 'lifestyle', name: 'Lifestyle' },
    { id: 'news', name: 'News' }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts[0];
  const recentPosts = blogPosts.slice(1, 4);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-28 pb-8 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Pet Care Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Expert advice, tips, and stories for pet lovers
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full px-6 py-4 pl-14 bg-white border-2 border-gray-200 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent shadow-lg"
              />
              <svg className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#ec6d13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="relative h-80 lg:h-auto">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-[#ec6d13] text-white px-4 py-2 rounded-full font-semibold text-sm">
                  Featured
                </div>
              </div>
              <div className="p-6 lg:p-8 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="bg-orange-100 text-[#ec6d13] px-3 py-1 rounded-full font-semibold capitalize">
                    {featuredPost.category}
                  </span>
                  <span>{featuredPost.date}</span>
                  <span>{featuredPost.readTime}</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-gray-900">{featuredPost.author}</span>
                  </div>
                  <button className="bg-[#ec6d13] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d65e0f] transition-all duration-300 shadow-lg hover:shadow-xl">
                    Read More →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-6 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as Category)}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-[#ec6d13] text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-orange-100 text-[#ec6d13] px-3 py-1 rounded-full font-semibold text-sm capitalize">
                    {post.category}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#ec6d13] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">{post.author}</span>
                    </div>
                    <button className="text-[#ec6d13] font-semibold hover:text-[#d65e0f] transition-colors flex items-center gap-1">
                      Read
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-lg">No posts found matching your search.</p>
            </div>
          )}

          {/* Pagination */}
          {filteredPosts.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                &lt;
              </button>
              <button className="px-4 py-2 rounded-lg bg-[#ec6d13] text-white font-semibold">
                1
              </button>
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                2
              </button>
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                3
              </button>
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                4
              </button>
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                &gt;
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative py-12 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&q=80"
            alt="Newsletter background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Get the latest pet care tips, health advice, and updates delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-[#ec6d13] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
