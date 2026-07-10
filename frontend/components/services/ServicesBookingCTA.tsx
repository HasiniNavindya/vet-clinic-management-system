'use client';

import Link from 'next/link';

export default function ServicesBookingCTA() {
  return (
    <section className="relative py-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&q=80"
          alt="CTA background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-white mb-6">
          Ready to Book an Appointment?
        </h2>
        <p className="text-white/90 text-xl mb-8">
          Our team is here to provide the best care for your beloved pets
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="bg-white text-[#ec6d13] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl">
            Schedule Appointment
          </Link>
          <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300">
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
}
