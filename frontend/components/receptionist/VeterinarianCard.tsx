'use client';

import Link from 'next/link';
import DoctorAvatar from '@/components/doctor/DoctorAvatar';
import { CLINIC_HOURS_LABEL, DoctorProfile, formatAvailableDays } from '@/lib/doctors';

type Props = {
  doctor: DoctorProfile;
};

export default function VeterinarianCard({ doctor }: Props) {
  return (
    <Link
      href={`/dashboard/receptionist/doctors/${doctor.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-[#ec6d13]/30 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <DoctorAvatar
          name={doctor.name}
          imageUrl={doctor.imageUrl}
          className="h-full w-full transition group-hover:scale-[1.02]"
          textClassName="text-4xl"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-sans text-lg font-semibold text-gray-900 group-hover:text-[#ec6d13]">
          {doctor.name}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-[#ec6d13]">{doctor.specialization}</p>
        {doctor.bio ? (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{doctor.bio}</p>
        ) : null}
        <p className="mt-3 text-xs text-gray-500">
          <span className="font-semibold text-gray-700">Days: </span>
          {formatAvailableDays(doctor.availableDays)}
        </p>
        <p className="mt-1 text-xs text-gray-500">{CLINIC_HOURS_LABEL}</p>
        <span className="mt-4 text-sm font-semibold text-[#ec6d13]">
          View profile & appointments →
        </span>
      </div>
    </Link>
  );
}
