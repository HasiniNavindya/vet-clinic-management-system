'use client';

import ManageAppointmentsPanel from '@/components/receptionist/ManageAppointmentsPanel';

export default function ReceptionistQueuePage() {
  return (
    <ManageAppointmentsPanel
      title="Consultation queue — today"
      defaultFilter="approved"
      todayOnly
      showCheckIn
    />
  );
}
