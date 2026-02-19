'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function AboutHero() {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({ years: 0, pets: 0, vets: 0 });

  // Fixed positions for paw prints to avoid hydration errors
  const pawPositions = [
    { top: '10%', left: '5%' },
    { top: '20%', left: '85%' },
    { top: '60%', left: '15%' },
    { top: '75%', left: '90%' },
    { top: '85%', left: '25%' },
    { top: '30%', left: '70%' }
  ];

  useEffect(() => {
    setIsVisible(true);
    
    // Animated counters
    const animateCounter = (target: number, key: 'years' | 'pets' | 'vets', duration: number) => {
      const increment = target / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCounts(prev => ({ ...prev, [key]: target }));
          clearInterval(timer);
        } else {
          setCounts(prev => ({ ...prev, [key]: Math.floor(current) }));
        }
      }, 16);
    };

    setTimeout(() => {
      animateCounter(15, 'years', 1500);
      animateCounter(50000, 'pets', 2000);
      animateCounter(25, 'vets', 1500);
    }, 500);
  }, []);

  return (
    <section className="relative bg-white py-20 pt-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className={`text-gray-900 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="inline-block mb-4 animate-bounce">
              <span className="bg-[#ec6d13]/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-[#ec6d13] hover:bg-[#ec6d13]/20 transition-all cursor-default">
                ✨ About Us
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight hover:scale-105 transition-transform duration-300 text-gray-900">
              Caring for Your Pets Like Family
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              With over 15 years of experience, we've been providing exceptional veterinary care 
              to pets and their families. Our passion is keeping your furry friends healthy and happy.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="group bg-[#ec6d13] text-white px-6 py-4 rounded-lg hover:bg-[#d65e0f] hover:scale-110 transition-all duration-300 cursor-pointer shadow-lg">
                <div className="text-3xl font-bold group-hover:scale-125 transition-transform">{counts.years}+</div>
                <div className="text-sm">Years Experience</div>
              </div>
              <div className="group bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 hover:scale-110 transition-all duration-300 cursor-pointer shadow-lg">
                <div className="text-3xl font-bold group-hover:scale-125 transition-transform">{counts.pets >= 1000 ? `${Math.floor(counts.pets / 1000)}K` : counts.pets}+</div>
                <div className="text-sm">Happy Pets</div>
              </div>
              <div className="group bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 hover:scale-110 transition-all duration-300 cursor-pointer shadow-lg">
                <div className="text-3xl font-bold group-hover:scale-125 transition-transform">{counts.vets}+</div>
                <div className="text-sm">Expert Vets</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="group relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl hover:shadow-[#ec6d13]/50 transition-all duration-500">
              <Image
                src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&q=80"
                alt="Veterinary Team with Pets"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                priority
              />
              {/* Animated Overlay Badge */}
              <div className="absolute bottom-8 left-8 bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer animate-slide-in-up">
                <div className="flex items-center gap-4">
                  <div className="bg-[#ec6d13] rounded-full p-4 animate-pulse-slow">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">24/7</div>
                    <div className="text-sm text-gray-600">Emergency Care</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Animated Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#ec6d13]/20 backdrop-blur-sm rounded-full animate-spin-slow"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#ec6d13]/10 backdrop-blur-sm rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
