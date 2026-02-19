'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function CoreValues() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const values = [
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
        </svg>
      ),
      title: 'Compassion',
      description: 'We treat every pet with kindness, empathy, and the same love we give our own animals.',
      image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&q=80',
      number: '01'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
        </svg>
      ),
      title: 'Excellence',
      description: 'We maintain the highest standards in veterinary medicine through continuous education and improvement.',
      image: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=600&q=80',
      number: '02'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
        </svg>
      ),
      title: 'Integrity',
      description: 'We uphold honesty and transparency in all our interactions with pet owners and colleagues.',
      image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&q=80',
      number: '03'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
        </svg>
      ),
      title: 'Teamwork',
      description: 'We collaborate effectively, supporting each other to provide the best care for every animal.',
      image: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=600&q=80',
      number: '04'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"/>
        </svg>
      ),
      title: 'Innovation',
      description: 'We embrace new technologies and methods to advance veterinary care and treatment.',
      image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&q=80',
      number: '05'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
        </svg>
      ),
      title: 'Dedication',
      description: 'We are committed 24/7 to providing emergency care and support when you need us most.',
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
      number: '06'
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Core Values
          </h2>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-0.5 w-16 bg-[#ec6d13]"></div>
            <div className="h-0.5 w-16 bg-[#ec6d13]"></div>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            The fundamental principles that guide our daily operations and define who we are
          </p>
        </div>

        {/* Values Grid - Modern Card Design */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
            >
              {/* Image Background */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={value.image}
                  alt={value.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-transparent"></div>
                
                {/* Number Badge */}
                <div className="absolute top-4 right-4 bg-[#ec6d13] text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  {value.number}
                </div>

                {/* Icon */}
                <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <div className="text-white">
                    {value.icon}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title with underline effect */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 relative inline-block">
                  {value.title}
                  <div className={`absolute -bottom-1 left-0 h-0.5 bg-[#ec6d13] transition-all duration-300 ${
                    hoveredIndex === index ? 'w-full' : 'w-0'
                  }`}></div>
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed text-sm">
                  {value.description}
                </p>
              </div>

              {/* Hover Border Effect */}
              <div className={`absolute inset-0 border-2 border-[#ec6d13] rounded-2xl transition-opacity duration-300 pointer-events-none ${
                hoveredIndex === index ? 'opacity-100' : 'opacity-0'
              }`}></div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-16 grid md:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Living Our Values Every Day
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              These values aren't just words on a wall – they're the foundation of everything we do. 
              From the moment you walk through our doors to the ongoing care of your beloved pets, 
              our core values guide every decision and interaction.
            </p>
            <button className="bg-[#ec6d13] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#d65e0f] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
              Join Our Team
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#ec6d13] text-white rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-sm opacity-90">Commitment</div>
            </div>
            <div className="bg-gray-900 text-white rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-sm opacity-90">Availability</div>
            </div>
            <div className="bg-gray-900 text-white rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">15+</div>
              <div className="text-sm opacity-90">Years Experience</div>
            </div>
            <div className="bg-[#ec6d13] text-white rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">50K+</div>
              <div className="text-sm opacity-90">Happy Pets</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
