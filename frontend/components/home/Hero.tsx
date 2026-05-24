'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoginModal from '@/components/auth/LoginModal';

export default function Hero() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <div className="absolute inset-0">
          <img 
            src="https://www.shutterstock.com/image-photo/cute-little-domestic-dog-modern-600nw-2674414519.jpg" 
            alt="Veterinarian with pet" 
            className="w-full h-full object-cover scale-110 animate-[zoomIn_20s_ease-in-out_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>

        {/* Animated Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-[#ec6d13]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Content */}
            <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full mb-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="w-2 h-2 bg-[#ec6d13] rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-semibold tracking-wide">Welcome to Carlisle Pet Care</span>
              </div>
              
              <h1 className="mb-6 font-serif text-[clamp(3.25rem,8vw,6rem)] font-bold leading-[1.05] tracking-tight text-white drop-shadow-[0_4px_28px_rgba(0,0,0,0.65)]">
                We Care For Your
                <span className="mt-2 block text-[#ec6d13] drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)]">
                  Beloved Pets
                </span>
              </h1>
              
              <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
                Professional veterinary care that your furry family members deserve. 
                Trusted by thousands of pet parents across the community.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="group bg-[#ec6d13] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#d65e0f] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.03] flex items-center gap-2"
                >
                  Book Appointment
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <Link 
                  href="/services"
                  className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold border-2 border-white/30 hover:bg-white hover:text-gray-900 transition-all duration-300 hover:scale-[1.03]"
                >
                  Our Services
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes zoomIn {
          0%, 100% { transform: scale(1.1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </>
  );
}
