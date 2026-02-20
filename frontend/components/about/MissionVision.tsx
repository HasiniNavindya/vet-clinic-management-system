'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function MissionVision() {
  const [activeTab, setActiveTab] = useState<'mission' | 'vision'>('mission');

  const content = {
    mission: {
      title: 'Our Mission',
      subtitle: 'What Drives Us Every Day',
      description: 'To provide exceptional, compassionate veterinary care that enhances the health and wellbeing of pets while building lasting relationships with their families. We are committed to advancing animal healthcare through continuous learning, innovation, and dedication to excellence.',
      image: 'https://images.unsplash.com/photo-1530041539828-114de669390e?w=800&q=80',
      highlights: [
        { icon: '❤️', text: 'Compassionate Care' },
        { icon: '🏆', text: 'Excellence in Service' },
        { icon: '🤝', text: 'Building Relationships' },
        { icon: '📚', text: 'Continuous Learning' }
      ]
    },
    vision: {
      title: 'Our Vision',
      subtitle: 'The Future We\'re Building',
      description: 'To be the leading veterinary clinic recognized for outstanding medical care, innovative treatment approaches, and unwavering commitment to animal welfare. We envision a community where every pet receives the highest standard of healthcare and every owner feels supported and informed.',
      image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&q=80',
      highlights: [
        { icon: '🌟', text: 'Leading Innovation' },
        { icon: '💡', text: 'Advanced Treatments' },
        { icon: '🐾', text: 'Animal Welfare First' },
        { icon: '🌍', text: 'Community Impact' }
      ]
    }
  };

  return (
    <section className="py-20 relative overflow-hidden bg-linear-to-b from-white to-gray-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ec6d13] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Mission & Vision
          </h2>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-0.5 w-16 bg-[#ec6d13]"></div>
            <div className="h-0.5 w-16 bg-[#ec6d13]"></div>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Guiding principles that drive our commitment to excellence in veterinary care
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-full p-2 shadow-lg">
            <button
              onClick={() => setActiveTab('mission')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === 'mission'
                  ? 'bg-[#ec6d13] text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Our Mission
            </button>
            <button
              onClick={() => setActiveTab('vision')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === 'vision'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Our Vision
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Image Side */}
          <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
            <Image
              src={content[activeTab].image}
              alt={content[activeTab].title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8">
              <h3 className="text-3xl font-bold text-white mb-2">
                {content[activeTab].title}
              </h3>
              <p className="text-white/90 text-lg">
                {content[activeTab].subtitle}
              </p>
            </div>
          </div>

          {/* Content Side */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {content[activeTab].description}
              </p>

              {/* Highlights Grid */}
              <div className="grid grid-cols-2 gap-4">
                {content[activeTab].highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300 group cursor-pointer"
                  >
                    <span className="text-3xl group-hover:scale-125 transition-transform duration-300">
                      {highlight.icon}
                    </span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {highlight.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Card */}
            <div className={`${activeTab === 'mission' ? 'bg-linear-to-r from-[#ec6d13] to-[#ff8c42]' : 'bg-linear-to-r from-blue-600 to-cyan-600'} rounded-3xl p-6 text-white shadow-xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90 mb-1">Our Commitment</div>
                  <div className="text-2xl font-bold">100% Dedicated</div>
                </div>
                <svg className="w-16 h-16 opacity-20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
