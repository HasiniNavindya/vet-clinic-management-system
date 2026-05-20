'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';

function FailedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  return (
    <PetOwnerShell>
      <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment failed or cancelled</h1>
        <p className="mt-3 text-gray-600">
          {reason || 'Your payment was not completed. No appointment or order was confirmed.'}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          You can try again when booking an appointment or checking out from the shop.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard/pet-owner/appointments/book"
            className="rounded-lg bg-[#ec6d13] px-5 py-2.5 font-semibold text-white hover:bg-[#d65e0f]"
          >
            Book appointment
          </Link>
          <Link
            href="/marketplace"
            className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Marketplace
          </Link>
        </div>
      </div>
    </PetOwnerShell>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<PetOwnerShell><p className="p-8 text-center">Loading…</p></PetOwnerShell>}>
      <FailedContent />
    </Suspense>
  );
}
