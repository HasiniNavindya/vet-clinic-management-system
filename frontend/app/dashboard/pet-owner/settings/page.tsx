'use client';

import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import PetOwnerSettings from '@/components/pet-owner/PetOwnerSettings';

export default function PetOwnerSettingsPage() {
  return (
    <PetOwnerShell>
      <PetOwnerSettings />
    </PetOwnerShell>
  );
}
