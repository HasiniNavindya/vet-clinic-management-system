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
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              Pet Care <span className="text-[#ec6d13]">Blog</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Expert advice, tips, and heartwarming stories for pet lovers everywhere
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for articles, tips, or advice..."
                className="w-full px-6 py-5 pl-14 bg-white border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-[#ec6d13]/20 focus:border-[#ec6d13] shadow-lg transition-all"
              />
              <svg className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#ec6d13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8 bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as Category)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-[#ec6d13] text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {activeCategory === 'all' && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <svg className="w-8 h-8 text-[#ec6d13]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured Article
            </h2>
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
              <div className="grid lg:grid-cols-5 gap-0">
                <div className="lg:col-span-2 relative h-96 lg:h-auto overflow-hidden">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-6 left-6 bg-gradient-to-r from-[#ec6d13] to-[#d65e0f] text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg">
                    ⭐ Featured
                  </div>
                </div>
                <div className="lg:col-span-3 p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="bg-orange-100 text-[#ec6d13] px-4 py-1.5 rounded-full font-bold capitalize">
                      {featuredPost.category}
                    </span>
                    <span className="font-medium">{featuredPost.date}</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {featuredPost.readTime}
                    </span>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#ec6d13] to-[#d65e0f] rounded-full flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{featuredPost.author}</p>
                        <p className="text-sm text-gray-500">Veterinary Expert</p>
                      </div>
                    </div>
                    <button className="bg-gradient-to-r from-[#ec6d13] to-[#d65e0f] text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                      Read More
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">
            {activeCategory === 'all' ? 'All Articles' : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Articles`}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 left-4 bg-white/95 text-[#ec6d13] px-4 py-2 rounded-full font-bold text-xs capitalize backdrop-blur-sm">
                    {post.category}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {post.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#ec6d13] transition-colors leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{post.author}</span>
                    </div>
                    <button className="text-[#ec6d13] font-bold hover:text-[#d65e0f] transition-all flex items-center gap-1 group-hover:gap-2">
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
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Posts Found</h3>
              <p className="text-gray-500 text-lg">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {filteredPosts.length > 0 && (
            <div className="flex justify-center items-center gap-2 mt-16">
              <button className="w-12 h-12 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center font-bold">
                ‹
              </button>
              <button className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#ec6d13] to-[#d65e0f] text-white font-bold shadow-lg">
                1
              </button>
              <button className="w-12 h-12 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all font-bold">
                2
              </button>
              <button className="w-12 h-12 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all font-bold">
                3
              </button>
              <button className="w-12 h-12 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all font-bold">
                4
              </button>
              <button className="w-12 h-12 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center font-bold">
                ›
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
