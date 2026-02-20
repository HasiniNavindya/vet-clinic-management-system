'use client';

import Link from 'next/link';

export default function AboutHeroSection() {
  return (
    <section className="pt-32 pb-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-4">
              <span className="bg-[#ec6d13] text-white px-4 py-2 rounded-full text-sm font-semibold">
                About Our Clinic
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Your Pet's Health is Our Top Priority
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              For over 15 years, we've been dedicated to providing compassionate, comprehensive veterinary care. 
              Our state-of-the-art facilities and expert team ensure your pets receive the best treatment possible.
            </p>
            <div className="flex gap-4">
              <Link href="/login" className="bg-[#ec6d13] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#d65e0f] transition">
                Book Appointment
              </Link>
              <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="relative h-[450px]">
            <div className="h-full rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&q=80"
                alt="Veterinary care"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
