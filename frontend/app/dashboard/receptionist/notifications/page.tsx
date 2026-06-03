'use client';

import { Suspense } from 'react';
import ReceptionistNotificationsPanel from '@/components/receptionist/ReceptionistNotificationsPanel';

export default function ReceptionistNotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
        </div>
      }
    >
      <ReceptionistNotificationsPanel />
    </Suspense>
  );
}
