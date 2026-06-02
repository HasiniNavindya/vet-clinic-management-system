'use client';

import { useSearchParams } from 'next/navigation';
import DoctorShell from '@/components/doctor/DoctorShell';
import Link from 'next/link';

export default function DoctorConsultationPage() {
  const params = useSearchParams();
  const petId = params.get('petId');
  const appointmentId = params.get('appointmentId');
  const qs = new URLSearchParams();
  if (petId) qs.set('petId', petId);
  if (appointmentId) qs.set('appointmentId', appointmentId);

  return (
    <DoctorShell>
      <div>
        <h1 className="text-gray-900">Consultation</h1>
        <p className="mt-1 text-sm text-gray-600">
          Record symptoms, diagnosis, treatment, prescriptions, and service fees.
        </p>
        <Link
          href={`/dashboard/health/manage${qs.toString() ? `?${qs}` : ''}`}
          className="mt-6 inline-block rounded-lg bg-[#ec6d13] px-5 py-2.5 font-semibold text-white hover:bg-[#d65e0f]"
        >
          Open clinical records form →
        </Link>
      </div>
    </DoctorShell>
  );
}
