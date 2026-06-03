import { redirect } from 'next/navigation';

export default function DoctorCalendarRedirectPage() {
  redirect('/dashboard/doctor/appointments');
}
