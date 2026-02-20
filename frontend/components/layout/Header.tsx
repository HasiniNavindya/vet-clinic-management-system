'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-white fixed w-full top-0 z-50">
      {/* Top Bar with Contact Info */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-1.5">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-1.5">
              <div className="w-8 h-8 bg-[#ec6d13] rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">🐾</span>
              </div>
              <div>
                <div className="text-base font-bold text-[#ec6d13]">CARLISLE</div>
                <div className="text-[10px] text-gray-600 font-medium">PET CARE</div>
              </div>
            </Link>

            {/* Contact Information */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Timing */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-xs">Timing</div>
                  <div className="text-gray-600 text-xs">Mon - Fri: 8am - 10pm</div>
                </div>
              </div>

              {/* Call Us */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-xs">Call Us</div>
                  <div className="text-gray-600 text-xs">+01 234 56789</div>
                </div>
              </div>

              {/* Mail Us */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-xs">Mail Us</div>
                  <div className="text-gray-600 text-xs">info@carlislepetcare.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-[#ec6d13]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 py-2">
              <Link href="/" className="text-white hover:text-white/80 transition font-semibold text-xs uppercase">
                HOME
              </Link>
              <Link href="/about" className="text-white hover:text-white/80 transition font-semibold text-xs uppercase">
                ABOUT US
              </Link>
              <Link href="/services" className="text-white hover:text-white/80 transition font-semibold text-xs uppercase">
                SERVICES
              </Link>
              <Link href="/marketplace" className="text-white hover:text-white/80 transition font-semibold text-xs uppercase">
                MARKETPLACE
              </Link>
              <Link href="/blog" className="text-white hover:text-white/80 transition font-semibold text-xs uppercase">
                BLOG
              </Link>
              <Link href="/contact" className="text-white hover:text-white/80 transition font-semibold text-xs uppercase">
                CONTACT US
              </Link>
            </div>

            {/* Get Appointment Button */}
            <div className="hidden md:flex items-center space-x-2 py-2">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-2 text-white hover:text-white/80 transition">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#ec6d13] font-bold text-sm">
                      {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-xs uppercase">{user?.fullName}</span>
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      window.location.href = '/';
                    }}
                    className="bg-white text-[#ec6d13] px-4 py-1.5 font-bold text-xs uppercase hover:bg-gray-100 transition-all"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="bg-white text-[#ec6d13] px-4 py-1.5 font-bold text-xs uppercase hover:bg-gray-100 transition-all inline-block"
                  >
                    LOGIN
                  </Link>
                </>
              )}
              <Link href="/login" className="bg-white text-[#ec6d13] px-4 py-1.5 font-bold text-xs uppercase hover:bg-gray-100 transition-all">
                GET APPOINTMENT
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white py-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 animate-fade-in-up">
              <Link href="/" className="block py-2 text-white hover:text-white/80 font-semibold uppercase text-sm">
                HOME
              </Link>
              <Link href="/about" className="block py-2 text-white hover:text-white/80 font-semibold uppercase text-sm">
                ABOUT US
              </Link>
              <Link href="/services" className="block py-2 text-white hover:text-white/80 font-semibold uppercase text-sm">
                SERVICES
              </Link>
              <Link href="/marketplace" className="block py-2 text-white hover:text-white/80 font-semibold uppercase text-sm">
                MARKETPLACE
              </Link>
              <Link href="/blog" className="block py-2 text-white hover:text-white/80 font-semibold uppercase text-sm">
                BLOG
              </Link>
              <Link href="/contact" className="block py-2 text-white hover:text-white/80 font-semibold uppercase text-sm">
                CONTACT US
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-3 py-2 text-white hover:text-white/80 font-semibold uppercase text-sm border-t border-white/20 mt-2 pt-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#ec6d13] font-bold text-lg">
                      {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <span>DASHBOARD - {user?.fullName}</span>
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      window.location.href = '/';
                    }}
                    className="w-full bg-white text-[#ec6d13] px-4 py-2 font-bold text-sm uppercase mt-3 hover:bg-gray-100 transition-all"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <Link 
                  href="/login"
                  className="block w-full bg-white text-[#ec6d13] px-4 py-2 font-bold text-sm uppercase mt-3 text-center hover:bg-gray-100 transition-all"
                >
                  LOGIN
                </Link>
              )}
              
              <Link href="/login" className="block w-full bg-white/10 border-2 border-white text-white px-4 py-2 font-bold text-sm uppercase mt-2 hover:bg-white/20 transition-all text-center">
                GET APPOINTMENT
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
