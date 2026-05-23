'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import AdminDashboardCharts from '@/components/admin/AdminDashboardCharts';
import {
  fetchAdminOverview,
  fetchAdminRecentActivity,
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

const SNAPSHOT_DAYS = 14;
const TREND_DAYS = 30;

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [overview, setOverview] = useState<Awaited<ReturnType<typeof fetchAdminOverview>>['overview'] | null>(null);
  const [breakdown, setBreakdown] = useState<{ status: string; count: number }[]>([]);
  const [activity, setActivity] = useState<
    { kind: string; summary: string; meta?: string; occurredAt: string }[]
  >([]);
  const [apSnapshot, setApSnapshot] = useState<{ day: string; count: number }[]>([]);
  const [revSnapshot, setRevSnapshot] = useState<{ day: string; cents: number }[]>([]);
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
      const [o, a, b, apSnap, revSnap, apTrend, revTrend, v] = await Promise.all([
        fetchAdminOverview(token),
        fetchAdminRecentActivity(token, 30),
        fetchAppointmentBreakdown(token),
        fetchAppointmentsDaily(token, SNAPSHOT_DAYS),
        fetchRevenueDaily(token, SNAPSHOT_DAYS),
        fetchAppointmentsDaily(token, TREND_DAYS),
        fetchRevenueDaily(token, TREND_DAYS),
        fetchVaccinationsDue(token, 30).catch(() => ({ items: [] })),
      ]);
      setOverview(o.overview);
      setActivity(a.activity);
      setBreakdown(b.breakdown);
      setApSnapshot(apSnap.series);
      setRevSnapshot(revSnap.series);
      setApSeries(apTrend.series);
      setRevSeries(revTrend.series);
      setVacCount(Array.isArray(v.items) ? v.items.length : 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [token]);

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
            <h1 className="mt-2 text-gray-900">Analytics</h1>
            <p className="text-gray-600">
              Snapshot charts, trends, and operational metrics for clinic management.
            </p>
          </div>
        </div>

        {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
          </div>
        ) : overview ? (
          <div className="mt-8 space-y-10">
            <AdminDashboardCharts
              overview={overview}
              breakdown={breakdown}
              apSeries={apSnapshot}
              revSeries={revSnapshot}
              activity={activity}
              showFullAnalyticsLink={false}
              className="mt-0"
            />

            {vacCount !== null ? (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <h2 className="text-sm font-bold uppercase tracking-wide text-amber-900">
                  Vaccination reminders
                </h2>
                <p className="mt-2 text-gray-800">
                  <span className="text-2xl font-bold">{vacCount}</span> upcoming due dates within the next 30 days
                  (not yet administered).
                </p>
              </section>
            ) : null}

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-gray-900">
                New bookings per day (last {TREND_DAYS} days)
              </h3>
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
              <h3 className="text-gray-900">
                Paid payment volume per day (last {TREND_DAYS} days)
              </h3>
              <p className="text-sm text-gray-500">Successful payment transactions only.</p>
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
        ) : null}
      </div>
    </div>
  );
}
