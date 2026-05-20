'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import { confirmPaymentSession } from '@/lib/payments';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const sessionId = searchParams.get('session_id');
  const [message, setMessage] = useState('Confirming your payment…');
  const [appointmentId, setAppointmentId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !sessionId) {
      if (!sessionId) setError('Missing payment session.');
      return;
    }
    confirmPaymentSession(token, sessionId).then((res) => {
      if (!res.ok) {
        setError((res.data as { error?: string }).error || 'Could not confirm payment');
        return;
      }
      setMessage('Payment successful! Your booking is confirmed.');
      if (res.data.appointment?.id) {
        setAppointmentId(res.data.appointment.id);
      }
    });
  }, [token, sessionId]);

  return (
    <PetOwnerShell>
      <div className="mx-auto max-w-lg rounded-2xl border border-green-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment successful</h1>
        {error ? (
          <p className="mt-3 text-red-600">{error}</p>
        ) : (
          <p className="mt-3 text-gray-600">{message}</p>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {appointmentId ? (
            <Link
              href={`/dashboard/pet-owner/appointments/${appointmentId}`}
              className="rounded-lg bg-[#ec6d13] px-5 py-2.5 font-semibold text-white hover:bg-[#d65e0f]"
            >
              View appointment
            </Link>
          ) : null}
          <Link
            href="/dashboard/pet-owner/payments"
            className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Transaction history
          </Link>
          <button
            type="button"
            onClick={() => router.push('/dashboard/pet-owner')}
            className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Dashboard home
          </button>
        </div>
      </div>
    </PetOwnerShell>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <PetOwnerShell>
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
          </div>
        </PetOwnerShell>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
