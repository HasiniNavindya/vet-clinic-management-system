'use client';

import Link from 'next/link';
import {
  Appointment,
  canDoctorAddConsultation,
  formatAppointmentDate,
  formatTime,
} from '@/lib/appointments';

type Props = {
  appointment: Appointment;
  compact?: boolean;
};

export default function DoctorVisitCard({ appointment: apt, compact = false }: Props) {
  const needsRecords = canDoctorAddConsultation(apt.status, apt.hasMedicalRecord);
  const finished = apt.hasMedicalRecord || apt.status === 'completed';

  return (
    <article
      className={`rounded-2xl border bg-white transition-shadow hover:shadow-md ${
        finished ? 'border-green-100' : 'border-gray-100 shadow-sm'
      } ${compact ? 'p-4' : 'p-5'}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-sans text-base font-semibold text-gray-900">
              {apt.petName || 'Pet'}
            </h3>
            {apt.petSpecies ? (
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {apt.petSpecies}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Owner: <span className="font-medium text-gray-800">{apt.ownerName || '—'}</span>
            {apt.ownerPhone ? (
              <span className="text-gray-400"> · {apt.ownerPhone}</span>
            ) : null}
          </p>
          <p className="mt-2 font-sans text-sm font-medium text-[#ec6d13]">
            {formatAppointmentDate(apt.appointmentDate)} · {formatTime(apt.appointmentTime)}
          </p>
          {!compact && apt.doctorName ? (
            <p className="mt-1 text-xs text-gray-500">Assigned vet: {apt.doctorName}</p>
          ) : null}
          {!compact && apt.notes ? (
            <p className="mt-2 line-clamp-2 text-xs text-gray-500">{apt.notes}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {needsRecords && apt.petId ? (
            <Link
              href={`/dashboard/health/manage?petId=${apt.petId}&appointmentId=${apt.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#ec6d13] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#d65e0f]"
            >
              Add consultation →
            </Link>
          ) : finished ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-800">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Finished
            </span>
          ) : null}
          {finished ? (
            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Sent to reception for billing
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
