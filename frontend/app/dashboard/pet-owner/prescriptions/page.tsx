import { redirect } from 'next/navigation';

export default function PrescriptionsRedirect() {
  redirect('/dashboard/pet-owner/health?tab=prescriptions');
}
