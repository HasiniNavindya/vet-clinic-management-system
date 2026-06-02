'use client';

import Link from 'next/link';
import DoctorAvatar from '@/components/doctor/DoctorAvatar';
import { CLINIC_HOURS_LABEL, DoctorProfile, formatAvailableDays } from '@/lib/doctors';

type Props = {
  doctor: DoctorProfile;
};

export default function DoctorCard({ doctor }: Props) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <DoctorAvatar name={doctor.name} imageUrl={doctor.imageUrl} className="h-full w-full" textClassName="text-4xl" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="font-sans text-lg font-semibold text-gray-900">{doctor.name}</p>
        <p className="mt-0.5 text-sm font-semibold text-[#ec6d13]">{doctor.specialization}</p>

        {doctor.bio ? (
          <p className="mt-3 line-clamp-3 text-sm text-gray-600">{doctor.bio}</p>
        ) : null}

        <ul className="mt-4 space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="font-medium text-gray-800">Days:</span>
            <span>{formatAvailableDays(doctor.availableDays)}</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-gray-800">Hours:</span>
            <span>{CLINIC_HOURS_LABEL}</span>
          </li>
        </ul>

        <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row">
          <Link
            href={`/dashboard/pet-owner/doctors/${doctor.id}`}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            View profile
          </Link>
          <Link
            href={`/dashboard/pet-owner/appointments/book?doctor=${doctor.id}`}
            className="flex-1 rounded-lg bg-[#ec6d13] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#d65e0f]"
          >
            Book appointment
          </Link>
        </div>
      </div>
    </article>
  );
}
