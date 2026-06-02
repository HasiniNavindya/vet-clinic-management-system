import { redirect } from 'next/navigation';

export default function PetOwnerPaymentsRedirect() {
  redirect('/dashboard/pet-owner/marketplace?tab=payments');
}
