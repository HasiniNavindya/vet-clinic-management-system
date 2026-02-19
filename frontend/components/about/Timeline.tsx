'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Timeline() {
  const [activeYear, setActiveYear] = useState(2010);

  const milestones = [
    {
      year: 2010,
      title: 'The Beginning',
      description: 'Founded our first clinic with a team of 3 veterinarians and a dream to make a difference.',
      image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400&q=80'
    },
    {
      year: 2013,
      title: 'Expansion',
      description: 'Opened our second location and introduced 24/7 emergency services for the community.',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80'
    },
    {
      year: 2016,
      title: 'Innovation',
      description: 'Invested in cutting-edge diagnostic equipment and launched our mobile veterinary service.',
      image: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=400&q=80'
    },
    {
      year: 2019,
      title: 'Recognition',
      description: 'Awarded "Best Veterinary Clinic" and reached 30,000 pets treated milestone.',
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80'
    },
    {
      year: 2022,
      title: 'Digital Transformation',
      description: 'Launched our telemedicine platform and pet health tracking app for clients.',
      image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&q=80'
    },
    {
      year: 2025,
      title: 'Today & Beyond',
      description: 'Serving 50,000+ pets with 25+ veterinarians and expanding to new communities.',
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80'
    },
  ];

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&q=80"
          alt="Timeline background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-white/95 via-white/90 to-white/95"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-white/80 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-xl mb-6">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Journey Through Time
            </h2>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-0.5 w-16 bg-[#ec6d13]"></div>
              <div className="h-0.5 w-16 bg-[#ec6d13]"></div>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              From humble beginnings to becoming a leading veterinary care provider
            </p>
          </div>
        </div>

        {/* Interactive Timeline */}
        <div className="relative">
          {/* Enhanced Timeline Line with Glow */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-linear-to-b from-[#ec6d13] via-blue-500 to-purple-500 transform -translate-x-1/2 shadow-[0_0_20px_rgba(236,109,19,0.5)]"></div>

          {/* Milestones */}
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.year}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } flex-col gap-6`}
              >
                {/* Content Card */}
                <div className="w-full md:w-5/12">
                  <div
                    onClick={() => setActiveYear(milestone.year)}
                    className={`group cursor-pointer bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border-2 ${
                      activeYear === milestone.year
                        ? `border-[#ec6d13] scale-105 shadow-[0_0_30px_rgba(236,109,19,0.3)]`
                        : 'border-white/50 hover:border-[#ec6d13]/50'
                    }`}
                  >
                    <div className="flex items-start gap-0">
                      {/* Image */}
                      <div className="relative w-32 h-32 shrink-0">
                        <Image
                          src={milestone.image}
                          alt={milestone.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      {/* Text Content */}
                      <div className="flex-1 p-4">
                        <div className="text-sm font-bold text-[#ec6d13] mb-1 flex items-center gap-2">
                          <span className="inline-block w-2 h-2 bg-[#ec6d13] rounded-full animate-pulse"></span>
                          {milestone.year}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#ec6d13] transition-colors duration-300">
                          {milestone.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Point */}
                <div className="hidden md:flex w-2/12 justify-center">
                  <div className="relative">
                    <div
                      className={`w-5 h-5 rounded-full ${
                        activeYear === milestone.year ? 'bg-[#ec6d13] scale-150' : 'bg-white border-4 border-gray-300'
                      } transition-all duration-500 ring-8 ring-white/80 shadow-xl ${
                        activeYear === milestone.year ? 'shadow-[0_0_20px_rgba(236,109,19,0.6)]' : ''
                      }`}
                    ></div>
                    {activeYear === milestone.year && (
                      <div className="absolute inset-0 w-5 h-5 rounded-full bg-[#ec6d13] animate-ping opacity-75"></div>
                    )}
                  </div>
                </div>

                {/* Empty space for alternating layout */}
                <div className="hidden md:block w-5/12"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Year Navigator */}
        <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="flex flex-wrap justify-center gap-4">
            {milestones.map((milestone) => (
              <button
                key={milestone.year}
                onClick={() => setActiveYear(milestone.year)}
                className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 ${
                  activeYear === milestone.year
                    ? 'bg-linear-to-r from-[#ec6d13] to-[#ff8c42] text-white shadow-[0_0_20px_rgba(236,109,19,0.5)] scale-110'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200 hover:border-[#ec6d13]/50'
                }`}
              >
                {milestone.year}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
