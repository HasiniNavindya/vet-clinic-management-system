'use client';

import Image from 'next/image';
import Link from 'next/link';

const INTRO =
  'We provide compassionate veterinary care, experienced professionals, modern facilities, emergency support, and personalized treatment plans to keep your pets healthy and happy.';

export default function WhyChooseUs() {
  const services = [
    {
      id: 1,
      title: 'CARE ADVICE',
      description:
        'Nutrition, preventive care, and home wellness tips from our veterinary team — tailored to your pet’s age, breed, and lifestyle.',
      image: '/images/services/care-advice.jpg',
      buttonColor: 'text-gray-700',
      slug: 'care-advice',
    },
    {
      id: 2,
      title: 'VETERINARY HELP',
      description:
        'Book consultations, follow-up visits, and treatment plans with doctors who know your pet’s history.',
      image: '/images/services/veterinary-help.jpg',
      buttonColor: 'text-[#ec6d13]',
      slug: 'veterinary-help',
    },
    {
      id: 3,
      title: 'EMERGENCY SERVICE',
      description:
        'Rapid assessment for injuries, sudden illness, or post-surgery concerns — we prioritize urgent cases.',
      image: '/images/services/emergency-service.jpg',
      buttonColor: 'text-gray-700',
      slug: 'emergency-service',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-gray-900 mb-6">WHY CHOOSE US</h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-0.5 w-16 bg-[#ec6d13]"></div>
            <svg className="w-6 h-6 text-[#ec6d13]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            <div className="h-0.5 w-16 bg-[#ec6d13]"></div>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">{INTRO}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-8 hover:shadow-2xl"
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-1 w-12 bg-[#ec6d13] rounded"></div>
                  <div className="h-1 w-12 bg-gray-200 rounded"></div>
                </div>

                <h3 className="text-gray-900 mb-4">{service.title}</h3>

                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>

                <Link
                  href={`/services/${service.slug}`}
                  className={`${service.buttonColor} font-semibold text-sm inline-flex items-center gap-2 hover:gap-4 hover:scale-[1.03] transition-all duration-300`}
                >
                  READ MORE
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
