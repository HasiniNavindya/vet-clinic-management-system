'use client';

import ManageAppointmentsPanel from '@/components/receptionist/ManageAppointmentsPanel';

export default function ReceptionistAllAppointmentsPage() {
  return (
    <ManageAppointmentsPanel title="All appointments" defaultFilter="all" todayOnly={false} />
  );
}
