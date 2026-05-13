'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const timelineData = [
  { year: '2010', event: 'Founded', description: 'Started our journey with a small clinic' },
  { year: '2015', event: 'Expansion', description: 'Opened two new branches' },
  { year: '2020', event: 'Innovation', description: 'Introduced advanced surgical facilities' },
  { year: '2026', event: 'Excellence', description: 'Serving over 50,000 happy pets' }
];

export default function TimelineSection() {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = itemRefs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleItems((prev) => {
                if (!prev.includes(index)) {
                  return [...prev, index];
                }
                return prev;
              });
            }
          });
        },
        {
          threshold: 0.2,
          rootMargin: '0px 0px -100px 0px'
        }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1920&q=80"
          alt="Timeline background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/40"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 opacity-0 animate-[fadeIn_0.8s_ease-out_forwards]">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Our Journey Through the Years
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Milestones that shaped who we are today
          </p>
        </div>

        <div className="relative">
          {/* Vertical line - hidden on mobile */}
          <div className="hidden md:block absolute left-8 lg:left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#ec6d13] via-orange-400 to-orange-300"></div>
          
          <div className="space-y-8 md:space-y-12">
            {timelineData.map((item, index) => (
              <div
                key={index}
                ref={(el) => { itemRefs.current[index] = el; }}
                className={`relative transition-all duration-700 ease-out ${
                  visibleItems.includes(index)
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-32'
                }`}
                style={{
                  transitionDelay: `${index * 150}ms`
                }}
              >
                <div className="flex items-center gap-4 md:gap-8">
                  {/* Year Badge */}
                  <div className="flex-shrink-0 relative z-10">
                    <div className={`bg-[#ec6d13] text-white w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-bold text-sm md:text-base shadow-lg transition-transform duration-500 ${
                      visibleItems.includes(index) ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                    }`}>
                      {item.year}
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className={`flex-1 bg-white/95 backdrop-blur-sm border-2 border-gray-100 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl hover:border-[#ec6d13] transition-all duration-300 ${
                    visibleItems.includes(index) ? 'scale-100' : 'scale-95'
                  }`}>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                      {item.event}
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
