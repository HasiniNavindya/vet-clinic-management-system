'use client';

import DoctorShell from '@/components/doctor/DoctorShell';
import DoctorAppointmentsPanel from '@/components/doctor/DoctorAppointmentsPanel';

export default function DoctorAppointmentsPage() {
  return (
    <DoctorShell>
      <DoctorAppointmentsPanel />
    </DoctorShell>
  );
}
