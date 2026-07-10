'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LoginModal from '@/components/auth/LoginModal';

import {
  fetchHomeStats,
  formatSatisfaction,
  formatStatCount,
  type HomeStats,
} from '@/lib/homeStats';

const HERO_WIDTH = 2068;
const HERO_HEIGHT = 760;

const EMPTY_STATS: HomeStats = {
  registeredPets: 0,
  totalAppointments: 0,
  registeredVeterinarians: 0,
  clientSatisfactionPercent: null,
  feedbackCount: 0,
};

export default function Hero() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<HomeStats>(EMPTY_STATS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    fetchHomeStats().then((res) => {
      if (res.ok) setStats(res.data);
      setLoaded(true);
    });
  }, []);

  const cardsData = [
    {
      title: 'Registered Pets',
      value: loaded ? formatStatCount(stats.registeredPets) : '—',
      icon: (
        <svg
          className="h-8 w-8 text-[#ec6d13]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.3.3 0 1 0 .2.3" />
          <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
          <circle cx="20" cy="10" r="2" fill="currentColor" />
        </svg>
      ),
    },
    {
      title: 'Appointments',
      value: loaded ? formatStatCount(stats.totalAppointments) : '—',
      icon: (
        <svg
          className="h-8 w-8 text-[#ec6d13]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="m18 2 4 4" />
          <path d="m17 7 3-3" />
          <path d="M19 9 9 19H5v-4L15 5" />
          <path d="m9 11 4 4" />
          <path d="m5 19-3 3" />
          <path d="m14 4 6 6" />
        </svg>
      ),
    },
    {
      title: 'Veterinarians',
      value: loaded ? formatStatCount(stats.registeredVeterinarians) : '—',
      icon: (
        <svg
          className="h-8 w-8 text-[#ec6d13]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      title: 'Client Satisfaction',
      value: loaded ? formatSatisfaction(stats.clientSatisfactionPercent, stats.feedbackCount) : '—',
      desc: loaded && stats.feedbackCount > 0 ? `Based on ${stats.feedbackCount} review${stats.feedbackCount === 1 ? '' : 's'}` : undefined,
      icon: (
        <svg
          className="h-8 w-8 text-[#ec6d13]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      <section
        className="relative w-full overflow-visible bg-white"
        style={{ marginTop: 'calc(-1 * var(--site-header-height))' }}
      >
        <div className="relative w-full overflow-visible">
          <Image
            src="/Hero.png"
            alt=""
            width={HERO_WIDTH}
            height={HERO_HEIGHT}
            priority
            sizes="100vw"
            className="block h-auto w-full"
          />

          {/* Centered text over the open white area of the banner */}
          <div className="absolute inset-x-0 top-[6%] bottom-[36%] z-10 flex flex-col items-center justify-center px-4 sm:px-6 md:bottom-[32%]">
            <div
              className={`max-w-3xl text-center transition-all duration-1000 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 md:mb-6 md:px-6 md:py-3">
                <div className="h-2 w-2 animate-pulse rounded-full bg-[#ec6d13]" />
                <span className="text-sm font-semibold tracking-wide text-gray-800">
                  Welcome to Carlisle Pet Care
                </span>
              </div>

              <h1 className="mb-3 font-serif text-[clamp(1.75rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-tight text-gray-900 md:mb-5">
                We Care For Your
                <span className="mt-1 block text-[#ec6d13] md:mt-2">Beloved Pets</span>
              </h1>

              <p className="mx-auto mb-5 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base md:mb-7 md:max-w-2xl md:text-lg">
                Professional veterinary care that your furry family members deserve. Trusted by
                thousands of pet parents across the community.
              </p>

              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="group flex items-center gap-2 rounded-xl bg-[#ec6d13] px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#d65e0f] md:px-8 md:py-4"
                >
                  Book Appointment
                  <svg
                    className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                <Link
                  href="/services"
                  className="rounded-xl border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-900 transition-all duration-300 hover:border-[#ec6d13] hover:text-[#ec6d13] md:px-8 md:py-4"
                >
                  Our Services
                </Link>
              </div>
            </div>
          </div>

          {/* Centered cards overlapping bottom of hero banner */}
          <div className="absolute bottom-0 left-1/2 z-20 w-full max-w-xl -translate-x-1/2 translate-y-1/2 px-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:gap-2.5">
              {cardsData.map((card, idx) => (
                <div
                  key={idx}
                  className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-white/45 bg-white/38 p-2.5 text-center shadow-[0_10px_24px_rgba(15,23,42,0.14)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/60 hover:bg-white/48 hover:shadow-[0_16px_30px_rgba(15,23,42,0.18)] md:p-3"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-white/60 via-white/20 to-transparent opacity-85" />
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-white/55 bg-white/65 p-1 transition-transform duration-300 group-hover:scale-105 md:h-9 md:w-9">
                    {card.icon}
                  </div>
                  <span className="relative mt-2 text-[10px] font-bold text-slate-900 md:text-[11px]">
                    {card.title}
                  </span>
                  <span className="relative mt-0.5 text-base font-extrabold leading-none text-slate-950 md:text-[1.5rem]">
                    {card.value}
                  </span>
                  {card.desc && (
                    <span className="relative mt-0.5 text-[9px] font-semibold text-slate-600 md:text-[10px]">
                      {card.desc}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
