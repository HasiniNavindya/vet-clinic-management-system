'use client';

import Image from 'next/image';

export default function Services() {
  const services = [
    {
      id: 1,
      title: 'PET ADOPTION',
      description: 'Knock dish off table head butt cant eat out of my own cats secretly make all the worlds muffins.',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
      ),
      position: 'left'
    },
    {
      id: 2,
      title: 'VACCINATION',
      description: 'Knock dish off table head butt cant eat out of my own cats secretly make all the worlds muffins.',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      position: 'right'
    },
    {
      id: 3,
      title: 'PET GROOMING',
      description: 'Knock dish off table head butt cant eat out of my own cats secretly make all the worlds muffins.',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
        </svg>
      ),
      position: 'left'
    },
    {
      id: 4,
      title: 'DOG TRAINING',
      description: 'Knock dish off table head butt cant eat out of my own cats secretly make all the worlds muffins.',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
        </svg>
      ),
      position: 'right'
    },
    {
      id: 5,
      title: 'PET DAYCARE',
      description: 'Knock dish off table head butt cant eat out of my own cats secretly make all the worlds muffins.',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      position: 'left'
    },
    {
      id: 6,
      title: 'PET SITTER',
      description: 'Knock dish off table head butt cant eat out of my own cats secretly make all the worlds muffins.',
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      position: 'right'
    }
  ];

  return (
    <section className="py-2 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-2">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-1">
            SERVICES WE OFFER
          </h2>
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="h-0.5 w-16 bg-[#ec6d13]"></div>
            <svg className="w-6 h-6 text-[#ec6d13]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
            <div className="h-0.5 w-16 bg-[#ec6d13]"></div>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Thug cat destroy couch eat the fat cats food chirp at birds lie on your belly and purr when you are asleep with tail in the air.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left Column - Services 1, 3, 5 */}
          <div className="space-y-8">
            {services.filter(s => s.position === 'left').map((service, index) => (
              <div 
                key={service.id}
                className="flex items-start gap-6 group"
              >
                <div className="flex-1 text-right">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#ec6d13] transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <div className="shrink-0 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 group-hover:text-white group-hover:bg-[#ec6d13] transition-all duration-300 transform group-hover:scale-110">
                  {service.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Center Column - Dog Image */}
          <div className="relative flex justify-center items-center">
            <div className="relative w-full h-[400px]">
              <Image
                src="/images/dog-services.jpg"
                alt="Happy Dog"
                fill
                className="object-contain mix-blend-multiply"
              />
            </div>
          </div>

          {/* Right Column - Services 2, 4, 6 */}
          <div className="space-y-6">
            {services.filter(s => s.position === 'right').map((service, index) => (
              <div 
                key={service.id}
                className="flex items-start gap-6 group"
              >
                <div className="shrink-0 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-[#ec6d13] group-hover:bg-[#ec6d13] group-hover:text-white transition-all duration-300 transform group-hover:scale-110">
                  {service.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#ec6d13] transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
