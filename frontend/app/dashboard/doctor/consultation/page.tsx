import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{ petId?: string; appointmentId?: string }>;
};

export default async function DoctorConsultationRedirectPage({ searchParams }: Props) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.petId) qs.set('petId', params.petId);
  if (params.appointmentId) qs.set('appointmentId', params.appointmentId);
  const suffix = qs.toString() ? `?${qs}` : '';
  redirect(`/dashboard/health/manage${suffix}`);
}
