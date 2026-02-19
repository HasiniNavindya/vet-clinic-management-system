'use client';

import Image from 'next/image';

export default function WhyChooseUs() {
  const services = [
    {
      id: 1,
      title: 'CARE ADVICE',
      description: 'Meow for food, then when human fills food dish, take a few bites of food and continue meow for food.',
      image: '/images/service2.jpg',
      buttonColor: 'text-gray-700'
    },
    {
      id: 2,
      title: 'VETERINARY HELP',
      description: 'Meow for food, then when human fills food dish, take a few bites of food and continue meow for food.',
      image: '/images/service3.jpg',
      buttonColor: 'text-[#ec6d13]'
    },
    {
      id: 3,
      title: 'EMERGENCY SERVICE',
      description: 'Meow for food, then when human fills food dish, take a few bites of food and continue meow for food.',
      image: '/images/service1.avif',
      buttonColor: 'text-gray-700'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            WHY CHOOSE US
          </h2>
          <div className="flex items-center justify-center gap-3 mb-4">
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

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div 
              key={service.id}
              className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-1 w-12 bg-[#ec6d13] rounded"></div>
                  <div className="h-1 w-12 bg-gray-200 rounded"></div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                
                <button 
                  className={`${service.buttonColor} font-semibold text-sm flex items-center gap-2 hover:gap-4 transition-all duration-300 group/btn`}
                >
                  READ MORE
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
