'use client';

import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import PetOwnerMarketplaceHub from '@/components/pet-owner/marketplace/PetOwnerMarketplaceHub';

export default function PetOwnerMarketplacePage() {
  return (
    <PetOwnerShell>
      <PetOwnerMarketplaceHub />
    </PetOwnerShell>
  );
}
