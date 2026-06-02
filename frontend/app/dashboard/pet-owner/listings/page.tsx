import { redirect } from 'next/navigation';

export default function PetOwnerListingsRedirect() {
  redirect('/dashboard/pet-owner/marketplace?tab=listings');
}
