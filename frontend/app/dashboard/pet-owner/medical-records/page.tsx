import { redirect } from 'next/navigation';

export default function MedicalRecordsRedirect() {
  redirect('/dashboard/pet-owner/health?tab=medical');
}
