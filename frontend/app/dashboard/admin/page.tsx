'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import { getDashboardPath } from '@/lib/roles';
import {
  fetchAdminOverview,
  formatUsdFromCents,
  type AdminOverviewStats,
} from '@/lib/adminInsights';

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-gray-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [overview, setOverview] = useState<AdminOverviewStats | null>(null);
  const [statsError, setStatsError] = useState('');

  const loadStats = useCallback(async () => {
    if (!token) return;
    setStatsError('');
    try {
      const o = await fetchAdminOverview(token);
      setOverview(o.overview);
    } catch (e) {
      setStatsError(e instanceof Error ? e.message : 'Could not load dashboard stats');
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login?role=admin');
      return;
    }
    if (!isLoading && isAuthenticated && !hasRole('admin')) {
      const path = user?.dashboardPath || getDashboardPath([], user?.role);
      router.replace(path);
    }
  }, [isLoading, isAuthenticated, hasRole, router, user]);

  useEffect(() => {
    if (isAuthenticated && hasRole('admin') && token) loadStats();
  }, [isAuthenticated, hasRole, token, loadStats]);

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
      <div className="container mx-auto max-w-6xl px-4 py-12 pt-28">
        <div>
          <h1 className="text-gray-900">Admin overview</h1>
          <p className="mt-1 text-gray-600">
            Signed in as <span className="font-semibold">{user?.fullName}</span>. Snapshot of clinic
            operations, users, and revenue — open a section below for full management screens.
          </p>
        </div>

        {statsError ? <p className="mt-6 text-sm text-red-600">{statsError}</p> : null}

        {overview ? (
          <section className="mt-8">
            <h3 className="text-gray-900">System snapshot</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Appointments" value={overview.totalAppointments} hint={`${overview.pendingAppointments} pending / awaiting payment`} />
              <StatCard label="Pet owners" value={overview.totalPetOwners} />
              <StatCard label="Doctors (profiles)" value={overview.totalDoctors} hint={`${overview.doctorsWithActiveLogin} with active login`} />
              <StatCard
                label="Stripe revenue (paid txs)"
                value={formatUsdFromCents(overview.revenueCents)}
              />
              <StatCard label="Staff accounts" value={overview.totalStaff} />
              <StatCard
                label="Shop (paid orders)"
                value={overview.shopOrdersPaid}
                hint={formatUsdFromCents(overview.shopRevenueCents)}
              />
              <StatCard label="Treatment records" value={overview.medicalRecordsCount} />
              <StatCard
                label="Vaccinations due (30d)"
                value={overview.vaccinationsDueSoon}
              />
              <StatCard label="Unread notifications" value={overview.notificationsUnread} />
              <StatCard
                label="Pending vet applications"
                value={overview.doctorApplicationsPending}
              />
              <StatCard
                label="Pending marketplace ads"
                value={overview.marketplaceAdsPending ?? 0}
              />
            </div>
          </section>
        ) : !statsError ? (
          <div className="mt-10 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
          </div>
        ) : null}

        <h3 className="mt-12 text-gray-900">Management</h3>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <Link
            href="/dashboard/admin/analytics"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="text-gray-900 group-hover:text-[#ec6d13]">Analytics</h3>
            <p className="mt-2 text-sm text-gray-600">
              Analytics snapshot with donut charts, revenue breakdown, activity mix, and 30-day booking and payment trends.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">
              Open analytics →
            </span>
          </Link>

          <Link
            href="/dashboard/admin/reports"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="text-gray-900 group-hover:text-[#ec6d13]">Reports & export</h3>
            <p className="mt-2 text-sm text-gray-600">
              Monthly dashboards, CSV exports, and printable summaries for revenue, appointments, treatments, and shop
              sales.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">
              Open reports →
            </span>
          </Link>

          <Link
            href="/dashboard/admin/payments"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="text-gray-900 group-hover:text-[#ec6d13]">Payments</h3>
            <p className="mt-2 text-sm text-gray-600">
              Transaction history, revenue monitoring, verify payments, refunds, and shop order payment tracking.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">
              Payment dashboard →
            </span>
          </Link>

          <Link
            href="/dashboard/admin/notifications"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="text-gray-900 group-hover:text-[#ec6d13]">Notifications</h3>
            <p className="mt-2 text-sm text-gray-600">
              Broadcast announcements, run appointment and vaccination reminders, and review sent notifications.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">
              Notification center →
            </span>
          </Link>

          <Link
            href="/dashboard/admin/doctors"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="text-gray-900 group-hover:text-[#ec6d13]">Doctor profiles</h3>
            <p className="mt-2 text-sm text-gray-600">
              Clinic veterinarian records, schedules sample, editing details, and link to linked accounts for
              activation.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">
              Manage doctors →
            </span>
          </Link>

          <Link
            href="/dashboard/admin/staff"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="text-gray-900 group-hover:text-[#ec6d13]">Staff</h3>
            <p className="mt-2 text-sm text-gray-600">
              Operational staff listings and stable links into user administration for roles and suspension.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">
              Staff hub →
            </span>
          </Link>

          <Link
            href="/dashboard/admin/shop"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="text-gray-900 group-hover:text-[#ec6d13]">Shop</h3>
            <p className="mt-2 text-sm text-gray-600">
              Product catalog with categories (pet food, toys, medicines, accessories), inventory, and paid-order
              fulfillment.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">
              Manage shop →
            </span>
          </Link>

          <Link
            href="/dashboard/admin/marketplace"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="text-gray-900 group-hover:text-[#ec6d13]">Marketplace ads</h3>
            <p className="mt-2 text-sm text-gray-600">
              Review pet-owner listings, approve or reject advertisements, and remove policy-violating content.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">
              Moderate listings →
            </span>
          </Link>

          <Link
            href="/dashboard/admin/users"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="text-gray-900 group-hover:text-[#ec6d13]">User management</h3>
            <p className="mt-2 text-sm text-gray-600">
              All accounts, suspend or reactivate, assign roles — pet owners, vets, and staff.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">
              Open users →
            </span>
          </Link>

          <Link
            href="/dashboard/admin/doctor-applications"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="text-gray-900 group-hover:text-[#ec6d13]">Doctor applications</h3>
            <p className="mt-2 text-sm text-gray-600">
              Approve veterinarian registrations and onboarding before they receive active login access.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">
              Review applications →
            </span>
          </Link>

          <Link
            href="/dashboard/calendar"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="text-gray-900 group-hover:text-[#ec6d13]">Clinic calendar</h3>
            <p className="mt-2 text-sm text-gray-600">Schedules and availability across the clinic.</p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">Open calendar →</span>
          </Link>

          <Link
            href="/dashboard/appointments/manage"
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="text-gray-900 group-hover:text-[#ec6d13]">Appointment queue</h3>
            <p className="mt-2 text-sm text-gray-600">Respond to booking requests from pet owners.</p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">
              Manage appointments →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
