'use client';

import ManageAppointmentsPanel from '@/components/receptionist/ManageAppointmentsPanel';

export default function ReceptionistTodayAppointmentsPage() {
  return (
    <ManageAppointmentsPanel
      title="Today's appointments"
      defaultFilter="approved"
      todayOnly
    />
  );
}
