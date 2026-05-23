'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import { formatUsdFromCents } from '@/lib/adminInsights';
import { fetchReportsDashboard, type ReportsDashboard } from '@/lib/adminReports';

export default function AdminReportsDashboardPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading, hasRole } = useAuth();
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [dash, setDash] = useState<ReportsDashboard | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      setDash(await fetchReportsDashboard(token, year, month));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
      setDash(null);
    } finally {
      setLoading(false);
    }
  }, [token, year, month]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=admin');
    if (!isLoading && isAuthenticated && !hasRole('admin')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, hasRole, router]);

  useEffect(() => {
    if (isAuthenticated && hasRole('admin') && token) load();
  }, [isAuthenticated, hasRole, token, load]);

  if (isLoading || !isAuthenticated || !hasRole('admin')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
      </div>
    );
  }

  const monthLabel = new Date(year, month - 1, 1).toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-8 pt-28">
        <Link href="/dashboard/admin" className="text-sm font-semibold text-[#ec6d13] hover:underline">
          ← Admin home
        </Link>
        <h1 className="mt-2 text-gray-900">Reports dashboard</h1>
        <p className="text-gray-600">
          Operational metrics for any month. Export detailed CSV rows or printable summaries from the export center.
        </p>

        <div className="mt-8 flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500">Year</label>
            <input
              type="number"
              className="mt-1 w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={year}
              min={2020}
              max={2100}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500">Month</label>
            <select
              className="mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString(undefined, { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            className="rounded-lg bg-[#ec6d13] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-60"
          >
            Refresh
          </button>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard/admin/reports/monthly"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md"
          >
            <h3 className="text-gray-900">Monthly summary</h3>
            <p className="mt-2 text-sm text-gray-600">Classic month rollup view (bookings, visits, treatments, revenue).</p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">Open →</span>
          </Link>
          <Link
            href="/dashboard/admin/reports/export"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md"
          >
            <h3 className="text-gray-900">Export center</h3>
            <p className="mt-2 text-sm text-gray-600">
              CSV downloads and printable HTML for payments, appointments, treatments, and shop sales.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">Open →</span>
          </Link>
        </div>

        {loading && !dash ? (
          <div className="mt-12 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
          </div>
        ) : dash ? (
          <div className="mt-10 space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-gray-900">{monthLabel}</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <dt className="text-xs font-semibold uppercase text-gray-500">Bookings created</dt>
                <dd className="mt-2 text-2xl font-bold">{dash.bookingsCreated}</dd>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <dt className="text-xs font-semibold uppercase text-gray-500">Visits completed</dt>
                <dd className="mt-2 text-2xl font-bold">{dash.visitsCompleted}</dd>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <dt className="text-xs font-semibold uppercase text-gray-500">Treatment records</dt>
                <dd className="mt-2 text-2xl font-bold">{dash.treatmentsRecorded}</dd>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <dt className="text-xs font-semibold uppercase text-gray-500">Payment revenue</dt>
                <dd className="mt-2 text-2xl font-bold">
                  {formatUsdFromCents(dash.paymentRevenueCents)}
                </dd>
                <dd className="text-xs text-gray-500">{dash.paymentCount} succeeded transactions</dd>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 sm:col-span-2">
                <dt className="text-xs font-semibold uppercase text-gray-500">Shop (paid)</dt>
                <dd className="mt-2 text-2xl font-bold">
                  {dash.shopOrdersPaid} orders · {formatUsdFromCents(dash.shopRevenueCents)}
                </dd>
              </div>
            </dl>

            {dash.appointmentsByStatus.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold uppercase text-gray-500">Appointments by status (created)</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  {dash.appointmentsByStatus.map((row) => (
                    <li key={row.status} className="flex justify-between border-b border-gray-50 py-1">
                      <span className="capitalize">{row.status.replace(/_/g, ' ')}</span>
                      <span className="font-semibold">{row.c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
