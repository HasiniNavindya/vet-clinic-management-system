'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function GalleryShowcase() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const images = [
    {
      src: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=800&q=80',
      title: 'Modern Facilities',
      description: 'State-of-the-art equipment and comfortable spaces'
    },
    {
      src: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&q=80',
      title: 'Surgical Excellence',
      description: 'Advanced surgical suites with latest technology'
    },
    {
      src: 'https://images.unsplash.com/photo-1612531386530-97fe9b61b0b7?w=800&q=80',
      title: 'Compassionate Care',
      description: 'Treating every pet with love and respect'
    },
    {
      src: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800&q=80',
      title: 'Happy Patients',
      description: 'Creating joyful moments for pets and owners'
    },
    {
      src: 'https://images.unsplash.com/photo-1625316708582-7c38734be31d?w=800&q=80',
      title: 'Expert Team',
      description: 'Dedicated professionals who care deeply'
    },
    {
      src: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
      title: 'Emergency Ready',
      description: '24/7 emergency care when you need us most'
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 text-[200px] animate-float">🐕</div>
        <div className="absolute bottom-10 right-10 text-[200px] animate-float" style={{ animationDelay: '2s' }}>🐈</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Experience Our Clinic
          </h2>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-0.5 w-16 bg-[#ec6d13]"></div>
            <span className="text-3xl">📸</span>
            <div className="h-0.5 w-16 bg-[#ec6d13]"></div>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Take a virtual tour of our facilities and see the environment where your pets receive care
          </p>
        </div>

        {/* Interactive Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(index)}
              className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <Image
                src={image.src}
                alt={image.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white text-xl font-bold mb-2">{image.title}</h3>
                  <p className="text-white/90 text-sm">{image.description}</p>
                </div>
              </div>

              {/* Number Badge */}
              <div className="absolute top-4 right-4 bg-[#ec6d13] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg group-hover:scale-125 transition-transform duration-300">
                {index + 1}
              </div>

              {/* Zoom Icon */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-5 h-5 text-[#ec6d13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage !== null && (
          <div
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fade-in"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-[#ec6d13] transition-colors duration-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="max-w-5xl w-full">
              <div className="relative h-[80vh] rounded-2xl overflow-hidden">
                <Image
                  src={images[selectedImage].src}
                  alt={images[selectedImage].title}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-white text-2xl font-bold mb-2">
                  {images[selectedImage].title}
                </h3>
                <p className="text-white/80">
                  {images[selectedImage].description}
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage((selectedImage - 1 + images.length) % images.length);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage((selectedImage + 1) % images.length);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <button className="bg-linear-to-r from-[#ec6d13] to-[#ff8c42] text-white px-8 py-4 rounded-lg font-semibold hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 inline-flex items-center gap-2">
            <span>Schedule a Visit to Our Clinic</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
