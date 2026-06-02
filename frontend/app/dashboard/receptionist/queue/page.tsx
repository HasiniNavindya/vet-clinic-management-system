import { redirect } from 'next/navigation';

export default function ReceptionistQueueRedirectPage() {
  redirect('/dashboard/receptionist/appointments/queue');
}
