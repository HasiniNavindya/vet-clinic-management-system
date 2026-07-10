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
      className="flex-shrink-0 w-full sm:w-1/2 md:w-1/2 lg:w-1/4 px-2"
    >
      <div className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50 shadow-sm">
        <div className="relative aspect-[3/4]">
          <img
            src={src}
            alt={doctor.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
      <h3 className="mt-2 text-center text-sm font-bold text-gray-900 line-clamp-1">{doctor.name}</h3>
      <p className="mt-0.5 text-center text-xs font-semibold text-[#ec6d13] line-clamp-1">{doctor.specialization}</p>
    </article>
  );
}

export default function Team() {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
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

  useEffect(() => {
    function updateVisible() {
      const w = window.innerWidth;
      if (w < 640) setVisibleCount(1);
      else if (w < 1024) setVisibleCount(2);
      else setVisibleCount(4);
    }
    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  useEffect(() => {
    if (doctors.length <= 1) return;
    const id = window.setInterval(() => {
      if (!pausedRef.current) setIndex((i) => (i + 1) % doctors.length);
    }, AUTO_SCROLL_MS);
    return () => window.clearInterval(id);
  }, [doctors.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + doctors.length) % doctors.length);
  }, [doctors.length]);
  const next = useCallback(() => {
    setIndex((i) => (i + 1) % doctors.length);
  }, [doctors.length]);

  function visibleDoctors() {
    const n = doctors.length;
    const count = Math.min(visibleCount, n);
    const out: DoctorProfile[] = [];
    for (let i = 0; i < count; i++) {
      out.push(doctors[(index + i) % n]);
    }
    return out;
  }

  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 text-center">
          <h2 className="mb-1 text-gray-800 text-xl md:text-2xl">OUR TEAM</h2>
          <div className="mb-1 flex items-center justify-center gap-2">
            <div className="h-0.5 w-8 bg-[#ec6d13]" />
            <svg className="h-4 w-4 text-[#ec6d13]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            <div className="h-0.5 w-8 bg-[#ec6d13]" />
          </div>
          <p className="mx-auto max-w-2xl text-gray-600 text-xs sm:text-sm">
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
            <p className="mb-1 text-center text-xs text-gray-400">
              {doctors.length} veterinarians — use arrows to browse · auto-advances
            </p>

            {doctors.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white/95 p-1.5 shadow-md hover:bg-gray-50"
                  aria-label="Previous doctors"
                >
                  <svg className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white/95 p-1.5 shadow-md hover:bg-gray-50"
                  aria-label="Next doctors"
                >
                  <svg className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            <div
              onMouseEnter={() => {
                pausedRef.current = true;
              }}
              onMouseLeave={() => {
                pausedRef.current = false;
              }}
            >
              <div className="mx-auto max-w-7xl overflow-hidden">
                <div className="flex transition-transform duration-500 gap-4">
                  {visibleDoctors().map((doctor) => (
                    <DoctorTeamCard key={doctor.id} doctor={doctor} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
