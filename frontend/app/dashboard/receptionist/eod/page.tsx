'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchReceptionistEodSummary, type EodSummary } from '@/lib/receptionist';

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export default function ReceptionistEodPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<EodSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetchReceptionistEodSummary(token)
      .then(setSummary)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <h1 className="text-gray-900">End of day summary</h1>
      <p className="mt-1 text-sm text-gray-600">Operational overview for today</p>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : summary ? (
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Today's appointments", value: summary.appointmentsToday },
            { label: 'Patients checked in', value: summary.checkedInToday },
            { label: 'Visits completed', value: summary.completedToday },
            { label: 'Pending requests (clinic)', value: summary.pendingRequests },
            { label: 'Shop orders today', value: summary.ordersPlacedToday },
            { label: 'Payments recorded', value: `${summary.paymentsRecordedToday} (${money(summary.paymentsTotalCents)})` },
          ].map((row) => (
            <div key={row.label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <dt className="text-sm text-gray-600">{row.label}</dt>
              <dd className="mt-1 text-2xl font-bold text-gray-900">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
