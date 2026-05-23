'use client';

import React from 'react';
import Image from 'next/image';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
}

interface BlogDetailModalProps {
  isOpen: boolean;
  blog: BlogPost | null;
  onClose: () => void;
}

export default function BlogDetailModal({ isOpen, blog, onClose }: BlogDetailModalProps) {
  if (!isOpen || !blog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        <div className="relative h-48 sm:h-72 md:h-96 w-full overflow-hidden rounded-t-2xl">
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8">
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[#ec6d13]/10 text-[#ec6d13] px-3 py-1 rounded-full text-sm font-semibold capitalize">
              {blog.category}
            </span>
            <span className="text-gray-500 text-sm">{blog.readTime}</span>
          </div>

          {/* Title */}
          <h1 className="text-gray-900 mb-4">
            {blog.title}
          </h1>

          {/* Meta Information */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200 mb-6">
            <div>
              <p className="font-semibold text-gray-900">{blog.author}</p>
              <p className="text-gray-600 text-sm">{blog.date}</p>
            </div>
          </div>

          {/* Excerpt */}
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            {blog.excerpt}
          </p>

          {/* Full Content */}
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              {blog.content || `
                This is a comprehensive article about ${blog.title.toLowerCase()}. 
                Our experts have put together detailed insights and practical advice that will help you 
                understand this topic better. Whether you're a beginner or an experienced pet owner, 
                you'll find valuable information here.
                
                From understanding the basics to implementing advanced techniques, this guide covers everything 
                you need to know. We've included real-world examples and expert recommendations that you can 
                apply immediately.
                
                Remember, every pet is unique, and what works for one may not work for another. Always consult 
                with your veterinarian before making significant changes to your pet's care routine.
              `}
            </p>
          </div>


        </div>
      </div>
    </div>
  );
}
