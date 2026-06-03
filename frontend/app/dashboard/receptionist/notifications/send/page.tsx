import { redirect } from 'next/navigation';

export default function ReceptionistSendNotificationRedirect() {
  redirect('/dashboard/receptionist/notifications');
}
