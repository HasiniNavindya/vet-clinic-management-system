'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatUsdFromCents } from '@/lib/adminInsights';
import { fetchPaymentOverview, type PaymentOverview } from '@/lib/adminPayments';

export default function AdminPaymentRevenuePage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [overview, setOverview] = useState<PaymentOverview | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      setOverview(await fetchPaymentOverview(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=admin');
    if (!isLoading && isAuthenticated && !hasRole('admin')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, hasRole, router]);

  useEffect(() => {
    if (isAuthenticated && hasRole('admin') && token) load();
  }, [isAuthenticated, hasRole, token, load]);

  if (isLoading || !isAuthenticated || !hasRole('admin')) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
        <Link href="/dashboard/admin/payments" className="text-sm font-semibold text-[#ec6d13] hover:underline">
          ← Payment dashboard
        </Link>
        <h1 className="mt-2 text-gray-900">Revenue monitoring</h1>
        <p className="text-gray-600">
          Aggregated from recorded payment transactions (succeeded). Use Export Center for monthly CSV/PDF
          downloads.
        </p>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        {overview ? (
          <div className="mt-8 space-y-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase text-gray-500">Lifetime (succeeded)</p>
                <p className="mt-2 text-3xl font-bold text-[#ec6d13]">
                  {formatUsdFromCents(overview.totalRevenueCents)}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase text-gray-500">Rolling 30 days</p>
                <p className="mt-2 text-gray-900">
                  {formatUsdFromCents(overview.revenueLast30DaysCents)}
                </p>
              </div>
            </div>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-gray-900">By payment status</h3>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-gray-500">
                    <th className="py-2">Status</th>
                    <th className="py-2">Count</th>
                    <th className="py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.statusBreakdown.map((row) => (
                    <tr key={row.status} className="border-b border-gray-50">
                      <td className="py-2 capitalize">{row.status}</td>
                      <td className="py-2">{row.count}</td>
                      <td className="py-2">{formatUsdFromCents(row.cents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-gray-900">Succeeded by type</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {overview.succeededByType.length === 0 ? (
                  <li className="text-gray-500">No succeeded payments yet.</li>
                ) : (
                  overview.succeededByType.map((row) => (
                    <li key={row.type} className="flex justify-between border-b border-gray-50 py-2">
                      <span className="capitalize">{row.type.replace(/_/g, ' ')}</span>
                      <span className="font-semibold">{row.count} payments</span>
                    </li>
                  ))
                )}
              </ul>
            </section>

            <Link
              href="/dashboard/admin/reports/export"
              className="inline-block text-sm font-semibold text-[#ec6d13] hover:underline"
            >
              Export monthly revenue (CSV/PDF) →
            </Link>
          </div>
        ) : !error ? (
          <div className="mt-12 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
          </div>
        ) : null}
    </div>
  );
}
