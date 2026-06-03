'use client';

import ReceptionistShell from '@/components/receptionist/ReceptionistShell';
import ConsultationBillingPanel from '@/components/receptionist/ConsultationBillingPanel';

export default function ReceptionistBillingPage() {
  return (
    <ReceptionistShell>
      <ConsultationBillingPanel />
    </ReceptionistShell>
  );
}
