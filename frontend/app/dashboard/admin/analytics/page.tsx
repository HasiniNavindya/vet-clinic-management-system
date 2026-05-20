'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import {
  fetchAppointmentBreakdown,
  fetchAppointmentsDaily,
  fetchRevenueDaily,
  fetchVaccinationsDue,
  formatUsdFromCents,
} from '@/lib/adminInsights';

function barHeight(count: number, max: number) {
  if (max <= 0) return 4;
  return Math.max(4, Math.round((count / max) * 96));
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [days] = useState(30);
  const [breakdown, setBreakdown] = useState<{ status: string; count: number }[]>([]);
  const [apSeries, setApSeries] = useState<{ day: string; count: number }[]>([]);
  const [revSeries, setRevSeries] = useState<{ day: string; cents: number }[]>([]);
  const [vacCount, setVacCount] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [b, a, r, v] = await Promise.all([
        fetchAppointmentBreakdown(token),
        fetchAppointmentsDaily(token, days),
        fetchRevenueDaily(token, days),
        fetchVaccinationsDue(token, 30).catch(() => ({ items: [] })),
      ]);
      setBreakdown(b.breakdown);
      setApSeries(a.series);
      setRevSeries(r.series);
      setVacCount(Array.isArray(v.items) ? v.items.length : 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [token, days]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=admin');
    if (!isLoading && isAuthenticated && !hasRole('admin')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, hasRole, router]);

  useEffect(() => {
    if (isAuthenticated && hasRole('admin') && token) load();
  }, [isAuthenticated, hasRole, token, load]);

  const apMax = Math.max(1, ...apSeries.map((x) => x.count));
  const revMax = Math.max(1, ...revSeries.map((x) => x.cents));

  if (isLoading || !isAuthenticated || !hasRole('admin')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto max-w-6xl px-4 py-8 pt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/dashboard/admin" className="text-sm font-semibold text-[#ec6d13] hover:underline">
              ← Admin home
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">
              Appointment activity, status distribution, paid revenue by day, and vaccination reminder load.
            </p>
          </div>
        </div>

        {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {vacCount !== null ? (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <h2 className="text-sm font-bold uppercase tracking-wide text-amber-900">
                  Vaccination reminders
                </h2>
                <p className="mt-2 text-gray-800">
                  <span className="text-2xl font-bold">{vacCount}</span> upcoming due dates within the next 30 days
                  (not yet administered). Full list is available from health-record workflows.
                </p>
              </section>
            ) : null}

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Appointments by status</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {breakdown.map((row) => (
                  <span
                    key={row.status}
                    className="inline-flex rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800"
                  >
                    {row.status}: <strong className="ml-2">{row.count}</strong>
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                New bookings per day (last {days} days)
              </h2>
              <p className="text-sm text-gray-500">Based on when the appointment row was created.</p>
              <div className="mt-6 flex h-28 items-end gap-0.5 overflow-x-auto pb-1">
                {apSeries.map((p) => (
                  <div
                    key={p.day}
                    className="group flex min-w-[8px] flex-1 flex-col items-center"
                    title={`${p.day}: ${p.count}`}
                  >
                    <div
                      className="w-full min-w-[6px] rounded-t bg-[#ec6d13]/90"
                      style={{ height: barHeight(p.count, apMax) }}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Paid payment volume per day (last {days} days)
              </h2>
              <p className="text-sm text-gray-500">Successful Stripe payment transactions only.</p>
              <div className="mt-6 flex h-28 items-end gap-0.5 overflow-x-auto pb-1">
                {revSeries.map((p) => (
                  <div
                    key={p.day}
                    className="group flex min-w-[8px] flex-1 flex-col items-center"
                    title={`${p.day}: ${formatUsdFromCents(p.cents)}`}
                  >
                    <div
                      className="w-full min-w-[6px] rounded-t bg-emerald-600/90"
                      style={{ height: barHeight(p.cents, revMax) }}
                    />
                  </div>
                ))}
              </div>
            </section>

            <p className="text-center text-sm text-gray-500">
              Export-style summaries by calendar month live on the{' '}
              <Link href="/dashboard/admin/reports" className="font-semibold text-[#ec6d13] hover:underline">
                Reports
              </Link>{' '}
              page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
