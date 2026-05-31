'use client';

import ManageAppointmentsPanel from '@/components/receptionist/ManageAppointmentsPanel';

export default function ReceptionistManageAppointmentsPage() {
  return (
    <ManageAppointmentsPanel
      title="Approve & respond to requests"
      defaultFilter="pending"
    />
  );
}
