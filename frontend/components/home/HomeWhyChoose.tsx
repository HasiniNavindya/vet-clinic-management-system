'use client';

import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '@/components/home/SectionHeader';

const HIGHLIGHTS = [
  {
    title: 'Care Advice',
    description:
      'Nutrition, preventive care, and home wellness tips from our veterinary team — tailored to your pet’s age, breed, and lifestyle.',
    image: '/images/services/care-advice.jpg',
    slug: 'care-advice',
  },
  {
    title: 'Veterinary Help',
    description:
      'Book consultations, follow-up visits, and treatment plans with doctors who know your pet’s history.',
    image: '/images/services/veterinary-help.jpg',
    slug: 'veterinary-help',
  },
  {
    title: 'Emergency Service',
    description:
      'Rapid assessment for injuries, sudden illness, or post-surgery concerns — we prioritize urgent cases.',
    image: '/images/services/emergency-service.jpg',
    slug: 'emergency-service',
  },
];

export default function HomeWhyChoose() {
  return (
    <section className="bg-white pt-6 pb-14 md:pt-8 md:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="How We Help Your Pet"
          subtitle="Care advice, veterinary support, and emergency services when you need them most."
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {HIGHLIGHTS.map((service) => (
            <article
              key={service.title}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-2.5 hover:shadow-xl"
            >
              <div className="relative h-56 shrink-0 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-gray-900">{service.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">{service.description}</p>
                <Link
                  href={`/services/${service.slug}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#ec6d13] transition group-hover:gap-3"
                >
                  Learn more
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
