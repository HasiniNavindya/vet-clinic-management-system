'use client';

import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import PetOwnerAppointmentsList from '@/components/pet-owner/PetOwnerAppointmentsList';

export default function MyAppointmentsPage() {
  return (
    <PetOwnerShell>
      <PetOwnerAppointmentsList />
    </PetOwnerShell>
  );
}
