'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import {
  CLINIC_HOURS_LABEL,
  DoctorProfile,
  fetchDoctorProfile,
  formatAvailableDays,
} from '@/lib/doctors';

export default function DoctorProfilePage() {
  const params = useParams();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = params.id as string;
    fetchDoctorProfile(id).then((res) => {
      if (!res.ok) {
        setError((res.data as { error?: string }).error || 'Veterinarian not found');
      } else {
        setDoctor(res.data);
      }
      setLoading(false);
    });
  }, [params.id]);

  const imageSrc =
    doctor?.imageUrl ||
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80';

  return (
    <PetOwnerShell>
      <Link
        href="/dashboard/pet-owner/doctors"
        className="text-sm font-medium text-[#ec6d13] hover:text-[#d65e0f]"
      >
        ← Our Veterinarians
      </Link>

      {loading ? (
        <div className="mt-8 flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : error ? (
        <p className="mt-6 text-red-600">{error}</p>
      ) : doctor ? (
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="aspect-[4/5] bg-gray-100">
              <img src={imageSrc} alt={doctor.name} className="h-full w-full object-cover" />
            </div>
            <div className="p-5">
              <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                Accepting bookings
              </span>
              <h1 className="mt-3 text-2xl font-bold text-gray-900">{doctor.name}</h1>
              <p className="mt-1 text-lg font-semibold text-[#ec6d13]">{doctor.specialization}</p>
            </div>
          </div>

          <div className="space-y-6">
            {doctor.bio ? (
              <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">About</h2>
                <p className="mt-3 leading-relaxed text-gray-700">{doctor.bio}</p>
              </section>
            ) : null}

            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                Availability
              </h2>
              <dl className="mt-4 space-y-3 text-gray-700">
                <div>
                  <dt className="text-sm font-semibold text-gray-900">Consultation days</dt>
                  <dd className="mt-0.5">{formatAvailableDays(doctor.availableDays)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-gray-900">Clinic hours</dt>
                  <dd className="mt-0.5">{CLINIC_HOURS_LABEL}</dd>
                </div>
                <p className="text-sm text-gray-500">
                  Pick a date when booking to see open time slots for this veterinarian.
                </p>
              </dl>
            </section>

            {(doctor.email || doctor.phone) && (
              <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Contact</h2>
                <ul className="mt-4 space-y-2 text-gray-700">
                  {doctor.email ? (
                    <li>
                      <span className="font-semibold text-gray-900">Email:</span>{' '}
                      <a href={`mailto:${doctor.email}`} className="text-[#ec6d13] hover:underline">
                        {doctor.email}
                      </a>
                    </li>
                  ) : null}
                  {doctor.phone ? (
                    <li>
                      <span className="font-semibold text-gray-900">Phone:</span>{' '}
                      <a href={`tel:${doctor.phone}`} className="text-[#ec6d13] hover:underline">
                        {doctor.phone}
                      </a>
                    </li>
                  ) : null}
                </ul>
              </section>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/dashboard/pet-owner/appointments/book?doctor=${doctor.id}`}
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#ec6d13] px-6 py-3 text-center font-semibold text-white hover:bg-[#d65e0f]"
              >
                Book appointment with {doctor.name.split(' ')[0]}
              </Link>
              <Link
                href="/dashboard/pet-owner/appointments"
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
              >
                View my appointments
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </PetOwnerShell>
  );
}
