'use client';

import Link from 'next/link';
import { canDoctorAddConsultation } from '@/lib/appointments';

type Props = {
  petId?: number | null;
  appointmentId: number;
  status: string;
  hasMedicalRecord?: boolean;
  className?: string;
};

export default function MedicalRecordAction({
  petId,
  appointmentId,
  status,
  hasMedicalRecord,
  className = '',
}: Props) {
  if (!petId) return null;

  if (canDoctorAddConsultation(status, hasMedicalRecord)) {
    return (
      <Link
        href={`/dashboard/health/manage?petId=${petId}&appointmentId=${appointmentId}`}
        className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-[#ec6d13] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#d65e0f] ${className}`}
      >
        Add consultation →
      </Link>
    );
  }

  if (hasMedicalRecord || status === 'completed') {
    return (
      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-800 ${className}`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Finished
      </span>
    );
  }

  return null;
}
