'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DoctorProfile, fetchDoctorProfiles } from '@/lib/doctors';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80';

const AUTO_SCROLL_MS = 3500;

function DoctorTeamCard({ doctor }: { doctor: DoctorProfile }) {
  const src = doctor.imageUrl || FALLBACK_IMAGE;

  return (
    <article
      data-team-card
      className="w-[11.5rem] shrink-0 snap-start sm:w-52 md:w-56"
    >
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-md">
        <div className="relative aspect-[3/4]">
          <img
            src={src}
            alt={doctor.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
      <h3 className="mt-3 text-center text-base font-bold text-gray-900">{doctor.name}</h3>
      <p className="mt-1 text-center text-sm font-semibold text-[#ec6d13]">{doctor.specialization}</p>
    </article>
  );
}

export default function Team() {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchDoctorProfiles();
        if (cancelled) return;
        if (!res.ok) {
          setError('Could not load our veterinary team.');
          setDoctors([]);
          return;
        }
        setDoctors(res.data);
      } catch {
        if (!cancelled) setError('Could not load our veterinary team.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el || doctors.length === 0) return;

    const firstCard = el.querySelector<HTMLElement>('[data-team-card]');
    const gap = 24;
    const step = (firstCard?.offsetWidth ?? 200) + gap;
    const maxScroll = el.scrollWidth - el.clientWidth;

    if (el.scrollLeft >= maxScroll - 4) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: step, behavior: 'smooth' });
    }
  }, [doctors.length]);

  const scrollPrev = useCallback(() => {
    const el = scrollRef.current;
    if (!el || doctors.length === 0) return;

    const firstCard = el.querySelector<HTMLElement>('[data-team-card]');
    const gap = 24;
    const step = (firstCard?.offsetWidth ?? 200) + gap;

    if (el.scrollLeft <= 4) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: -step, behavior: 'smooth' });
    }
  }, [doctors.length]);

  useEffect(() => {
    if (doctors.length < 2) return;

    const id = window.setInterval(() => {
      if (!pausedRef.current) scrollNext();
    }, AUTO_SCROLL_MS);

    return () => window.clearInterval(id);
  }, [doctors.length, scrollNext]);

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-800 md:text-4xl">OUR TEAM</h2>
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="h-0.5 w-16 bg-[#ec6d13]" />
            <svg className="h-6 w-6 text-[#ec6d13]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            <div className="h-0.5 w-16 bg-[#ec6d13]" />
          </div>
          <p className="mx-auto max-w-3xl text-gray-600">
            Meet the veterinarians at Carlisle Pet Care — each focused on a specialty area to keep your pets healthy.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
          </div>
        ) : error ? (
          <p className="py-8 text-center text-sm text-red-600">{error}</p>
        ) : doctors.length === 0 ? (
          <p className="py-8 text-center text-gray-500">Our team profiles will appear here soon.</p>
        ) : (
          <div className="relative">
            <p className="mb-4 text-center text-xs text-gray-400 sm:text-sm">
              {doctors.length} veterinarians — drag or use arrows to browse · auto-scrolls left to right
            </p>

            {doctors.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={scrollPrev}
                  className="absolute left-0 top-[38%] z-10 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white/95 p-2 shadow-md hover:bg-gray-50 sm:flex"
                  aria-label="Previous doctor"
                >
                  <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  className="absolute right-0 top-[38%] z-10 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white/95 p-2 shadow-md hover:bg-gray-50 sm:flex"
                  aria-label="Next doctor"
                >
                  <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            ) : null}

            <div
              className="team-slider-fade mx-auto max-w-full"
              onMouseEnter={() => {
                pausedRef.current = true;
              }}
              onMouseLeave={() => {
                pausedRef.current = false;
              }}
            >
              <div
                ref={scrollRef}
                className="team-slider-track flex flex-nowrap gap-6 overflow-x-auto scroll-smooth px-1 pb-4 pt-1 sm:gap-8"
                tabIndex={0}
                aria-label="Veterinary team carousel"
              >
                {doctors.map((doctor) => (
                  <DoctorTeamCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
