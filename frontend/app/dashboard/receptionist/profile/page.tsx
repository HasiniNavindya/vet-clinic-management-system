import { redirect } from 'next/navigation';

export default function ReceptionistProfileRedirect() {
  redirect('/dashboard/receptionist/settings');
}
