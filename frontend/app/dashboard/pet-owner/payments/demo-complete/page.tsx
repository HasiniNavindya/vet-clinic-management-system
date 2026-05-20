'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import { completeDemoPayment } from '@/lib/payments';

function DemoCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const transactionId = Number(searchParams.get('transactionId'));
  const [error, setError] = useState('');
  const [appointmentId, setAppointmentId] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token || !transactionId) {
      setError('Invalid payment session.');
      return;
    }
    completeDemoPayment(token, transactionId).then((res) => {
      if (!res.ok) {
        setError((res.data as { error?: string }).error || 'Payment could not be completed');
        return;
      }
      setDone(true);
      if (res.data.appointment?.id) setAppointmentId(res.data.appointment.id);
    });
  }, [token, transactionId]);

  return (
    <PetOwnerShell>
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900">Demo payment</h1>
        {!error && !done ? (
          <p className="mt-3 text-gray-600">Processing demo payment…</p>
        ) : null}
        {error ? <p className="mt-3 text-red-600">{error}</p> : null}
        {done ? (
          <>
            <p className="mt-3 text-green-700">Payment recorded (demo mode — Stripe not configured).</p>
            <div className="mt-6 flex flex-col gap-3">
              {appointmentId ? (
                <Link
                  href={`/dashboard/pet-owner/appointments/${appointmentId}`}
                  className="rounded-lg bg-[#ec6d13] px-5 py-2.5 font-semibold text-white"
                >
                  View appointment
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => router.push('/dashboard/pet-owner/payments')}
                className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700"
              >
                Transaction history
              </button>
            </div>
          </>
        ) : null}
      </div>
    </PetOwnerShell>
  );
}

export default function DemoCompletePage() {
  return (
    <Suspense fallback={<PetOwnerShell><p className="p-8 text-center">Loading…</p></PetOwnerShell>}>
      <DemoCompleteContent />
    </Suspense>
  );
}
