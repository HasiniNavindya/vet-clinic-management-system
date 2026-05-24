'use client';

import ServicesOfferLayout from '@/components/services/ServicesOfferLayout';

const INTRO =
  'We provide compassionate veterinary care, experienced professionals, modern facilities, emergency support, and personalized treatment plans to keep your pets healthy and happy.';

/** @deprecated Use ServicesOfferLayout directly; kept for any legacy imports. */
export default function Services() {
  return (
    <section className="bg-white py-2">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h2 className="mb-1 text-gray-900">SERVICES WE OFFER</h2>
          <p className="mx-auto max-w-3xl leading-relaxed text-gray-600">{INTRO}</p>
        </div>
      </div>
      <ServicesOfferLayout />
    </section>
  );
}
