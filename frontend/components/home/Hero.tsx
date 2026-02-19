'use client';

import { useState } from 'react';
import Link from 'next/link';
import LoginModal from '@/components/auth/LoginModal';

export default function Hero() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1920&q=80" 
            alt="Veterinarian with pet" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="text-white text-sm font-semibold">🐾 Welcome to Carlisle Pet Care</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              We Care For Your Beloved Pets
            </h1>
            
            <p className="text-white/90 text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
              Professional veterinary care that your furry family members deserve. 
              Trusted by thousands of pet parents.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/30 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
              >
                Login
              </button>
              <Link 
                href="/register"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/30 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
