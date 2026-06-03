'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ConsultationBillingPanel from '@/components/receptionist/ConsultationBillingPanel';

function BillingContent() {
  const searchParams = useSearchParams();
  const appointmentId = Number(searchParams.get('appointmentId') || '') || undefined;
  return <ConsultationBillingPanel focusAppointmentId={appointmentId} />;
}

export default function ReceptionistBillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}