'use client';

import Image from 'next/image';

export default function Stats() {
  const stats = [
    {
      id: 1,
      number: '3000',
      label: 'Pets Saved'
    },
    {
      id: 2,
      number: '1245',
      label: 'Products'
    },
    {
      id: 3,
      number: '340',
      label: 'Professionals'
    },
    {
      id: 4,
      number: '684',
      label: 'Customers'
    }
  ];

  return (
    <section className="relative py-12 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/state.webp"
          alt="Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.id} className="text-center">
              <div className="mb-3">
                <h3 className="text-5xl md:text-6xl font-bold text-white mb-2">
                  {stat.number}
                </h3>
                <div className="flex justify-center">
                  <div className="h-1 w-16 bg-[#ec6d13] rounded"></div>
                </div>
              </div>
              <p className="text-white text-lg font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
