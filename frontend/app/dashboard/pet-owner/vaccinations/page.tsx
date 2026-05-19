import { redirect } from 'next/navigation';

export default function VaccinationsRedirect() {
  redirect('/dashboard/pet-owner/health?tab=vaccinations');
}
