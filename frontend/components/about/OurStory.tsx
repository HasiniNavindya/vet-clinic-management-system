'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function OurStory() {
  const [activeTab, setActiveTab] = useState<'story' | 'achievements' | 'future'>('story');

  const tabs = [
    { id: 'story' as const, label: 'Our Journey', icon: '📖' },
    { id: 'achievements' as const, label: 'Achievements', icon: '🏆' },
    { id: 'future' as const, label: 'Our Future', icon: '🚀' }
  ];

  const content = {
    story: {
      text: [
        'Founded in 2010, our veterinary clinic began with a simple mission: to provide the highest quality medical care for pets while treating every animal with the compassion and respect they deserve.',
        'What started as a small neighborhood clinic has grown into a comprehensive veterinary facility, serving thousands of families and their beloved pets. Our journey has been driven by our unwavering commitment to animal welfare and continuous learning in veterinary medicine.',
        'Today, we\'re proud to be equipped with state-of-the-art medical technology and staffed by a team of experienced veterinarians and caring support staff. Despite our growth, we\'ve never lost sight of what matters most – the personal touch and genuine care that makes every pet feel at home.'
      ],
      features: [
        { icon: '🏆', text: 'Award-winning veterinary services' },
        { icon: '💙', text: 'Compassionate and experienced team' },
        { icon: '🔬', text: 'Advanced medical technology' },
        { icon: '🌟', text: 'Personalized care for every pet' }
      ]
    },
    achievements: {
      text: [
        'Over the years, we\'ve received numerous accolades for our exceptional veterinary services and commitment to animal welfare.',
        'Our clinic has been recognized as the "Best Veterinary Clinic" for three consecutive years and our team has published groundbreaking research in veterinary medicine.',
        'We\'ve successfully treated over 50,000 pets, performed thousands of life-saving surgeries, and continue to set new standards in veterinary care excellence.'
      ],
      features: [
        { icon: '🥇', text: 'Best Veterinary Clinic 2023-2025' },
        { icon: '📚', text: 'Published 20+ research papers' },
        { icon: '💯', text: '99% success rate in surgeries' },
        { icon: '❤️', text: '50,000+ pets treated' }
      ]
    },
    future: {
      text: [
        'Looking ahead, we\'re excited to expand our services with cutting-edge telemedicine capabilities and specialized care units.',
        'We\'re investing in advanced diagnostic equipment and training programs to ensure our team stays at the forefront of veterinary medicine.',
        'Our vision includes opening satellite clinics in underserved areas, making quality veterinary care accessible to more families and their pets.'
      ],
      features: [
        { icon: '💻', text: 'Telemedicine services launching soon' },
        { icon: '🏥', text: 'New specialized care units' },
        { icon: '🎓', text: 'Advanced training programs' },
        { icon: '🌍', text: 'Expansion to new locations' }
      ]
    }
  };
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image Side with Parallax Effect */}
          <div className="relative order-2 md:order-1">
            <div className="relative group">
              {/* Main Image */}
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80"
                  alt="Veterinarian caring for a dog"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              {/* Small Image Overlay with animation */}
              <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-xl overflow-hidden shadow-xl border-4 border-white hover:scale-110 transition-transform duration-500 cursor-pointer">
                <Image
                  src="https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=400&q=80"
                  alt="Happy pet with owner"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Animated Decorative Circle */}
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#ec6d13] rounded-full opacity-20 -z-10 animate-pulse"></div>
          </div>

          {/* Content Side with Tabs */}
          <div className="order-1 md:order-2">
            <div className="mb-4">
              <span className="text-[#ec6d13] font-semibold text-sm uppercase tracking-wider animate-fade-in">
                Our Story
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 hover:text-[#ec6d13] transition-colors duration-300">
              A Legacy of Compassionate Pet Care
            </h2>

            {/* Interactive Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-[#ec6d13] text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Animated Content */}
            <div className="space-y-4 text-gray-600 leading-relaxed animate-fade-in">
              {content[activeTab].text.map((paragraph, index) => (
                <p key={index} className="hover:text-gray-800 transition-colors duration-200">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Features List with Stagger Animation */}
            <div className="mt-8 space-y-4">
              {content[activeTab].features.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 group hover:translate-x-2 transition-transform duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-2xl group-hover:scale-125 transition-transform duration-300">{item.icon}</div>
                  <span className="text-gray-700 font-medium group-hover:text-[#ec6d13] transition-colors duration-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
