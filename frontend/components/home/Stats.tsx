'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  fetchHomeStats,
  formatSatisfaction,
  formatStatCount,
  type HomeStats,
} from '@/lib/homeStats';

const STATS_BG = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1920&q=80';

const LABELS = [
  { key: 'registeredPets' as const, label: 'Registered Pets' },
  { key: 'totalAppointments' as const, label: 'Appointments' },
  { key: 'registeredVeterinarians' as const, label: 'Veterinarians' },
  { key: 'clientSatisfactionPercent' as const, label: 'Client Satisfaction' },
];

const EMPTY: HomeStats = {
  registeredPets: 0,
  totalAppointments: 0,
  registeredVeterinarians: 0,
  clientSatisfactionPercent: null,
  feedbackCount: 0,
};

export default function Stats() {
  const [stats, setStats] = useState<HomeStats>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchHomeStats().then((res) => {
      if (res.ok) setStats(res.data);
      setLoaded(true);
    });
  }, []);

  function displayValue(key: (typeof LABELS)[number]['key']) {
    if (!loaded) return '—';
    if (key === 'clientSatisfactionPercent') {
      return formatSatisfaction(stats.clientSatisfactionPercent, stats.feedbackCount);
    }
    return formatStatCount(stats[key]);
  }

  return (
    <section className="relative overflow-hidden py-10 md:py-12">
      <div className="absolute inset-0">
        <Image src={STATS_BG} alt="" fill className="object-cover object-center" priority={false} />
        <div className="absolute inset-0 bg-black/75" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
          {LABELS.map((item) => (
            <div key={item.key} className="text-center">
              <p className="font-serif text-3xl font-bold leading-none text-white md:text-4xl">
                {displayValue(item.key)}
              </p>
              <div className="mx-auto my-2 h-0.5 w-10 rounded bg-[#ec6d13]" />
              <p className="text-sm font-medium text-white md:text-base">{item.label}</p>
              {item.key === 'clientSatisfactionPercent' && loaded && stats.feedbackCount > 0 ? (
                <p className="mt-1 text-[10px] text-white/70 md:text-xs">
                  Based on {stats.feedbackCount} review{stats.feedbackCount === 1 ? '' : 's'}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
