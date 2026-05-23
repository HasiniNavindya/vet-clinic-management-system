'use client';

import Image from 'next/image';

const STATS = [
  { id: 1, number: '5000+', label: 'Happy Pets' },
  { id: 2, number: '1200+', label: 'Appointments' },
  { id: 3, number: '15+', label: 'Veterinarians' },
  { id: 4, number: '98%', label: 'Client Satisfaction' },
];

const STATS_BG =
  'https://images.unsplash.com/photo-1628009363691-d7ae4e07e6e2?w=1920&q=80';

export default function Stats() {
  return (
    <section className="relative overflow-hidden py-20 md:py-24">
      <div className="absolute inset-0">
        <Image src={STATS_BG} alt="" fill className="object-cover" priority={false} />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.id} className="text-center">
              <p className="stat-value mb-2 text-white">{stat.number}</p>
              <div className="mx-auto mb-3 h-1 w-16 rounded bg-[#ec6d13]" />
              <p className="text-lg font-medium text-white">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
