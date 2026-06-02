import { redirect } from 'next/navigation';

export default function PetOwnerOrdersRedirect() {
  redirect('/dashboard/pet-owner/marketplace?tab=orders');
}
