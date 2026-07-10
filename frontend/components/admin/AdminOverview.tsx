'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAdminOverview,
  formatUsdFromCents,
  type AdminOverviewStats,
} from '@/lib/adminInsights';

type QuickLink = {
  title: string;
  description: string;
  href: string;
  badge?: number;
};

function HeroStat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        accent
          ? 'border-[#ec6d13]/25 bg-gradient-to-br from-orange-50 to-white'
          : 'border-gray-100 bg-white'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 font-sans text-3xl font-bold tabular-nums text-gray-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-600">{hint}</p> : null}
    </div>
  );
}

function CompactStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-gray-900">{value}</p>
    </div>
  );
}

function QuickCard({ link }: { link: QuickLink }) {
  return (
    <Link
      href={link.href}
      className="group flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-[#ec6d13]/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-sans text-base font-semibold text-gray-900 group-hover:text-[#ec6d13]">
          {link.title}
        </h3>
        {link.badge != null && link.badge > 0 ? (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
            {link.badge}
          </span>
        ) : null}
      </div>
      <p className="mt-2 flex-1 text-sm text-gray-600">{link.description}</p>
      <span className="mt-4 text-sm font-semibold text-[#ec6d13]">Open →</span>
    </Link>
  );
}

export default function AdminOverview() {
  const { user, token } = useAuth();
  const [overview, setOverview] = useState<AdminOverviewStats | null>(null);
  const [statsError, setStatsError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!token) return;
    setStatsError('');
    setLoading(true);
    try {
      const o = await fetchAdminOverview(token);
      setOverview(o.overview);
    } catch (e) {
      setStatsError(e instanceof Error ? e.message : 'Could not load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadStats();
  }, [token, loadStats]);

  const pendingTotal =
    (overview?.doctorApplicationsPending ?? 0) +
    (overview?.receptionistApplicationsPending ?? 0) +
    (overview?.marketplaceAdsPending ?? 0) +
    (overview?.pendingAppointments ?? 0);

  const quickLinks: QuickLink[] = overview
    ? [
        {
          title: 'Analytics',
          description: 'Charts, revenue trends, and appointment activity.',
          href: '/dashboard/admin/analytics',
        },
        {
          title: 'Reports & export',
          description: 'Monthly summaries, CSV exports, and printable PDF reports.',
          href: '/dashboard/admin/reports',
        },
        {
          title: 'Payments',
          description: 'Transactions, revenue, refunds, and shop order payments.',
          href: '/dashboard/admin/payments',
        },
        {
          title: 'Notifications',
          description: 'Broadcasts, reminders, and notification history.',
          href: '/dashboard/admin/notifications',
          badge: overview.notificationsUnread,
        },
        {
          title: 'User management',
          description: 'All accounts, veterinarians, reception team, and application approvals.',
          href: (() => {
            const vet = overview.doctorApplicationsPending ?? 0;
            const rec = overview.receptionistApplicationsPending ?? 0;
            if (vet > 0) return '/dashboard/admin/users?tab=veterinarians&vetTab=applications';
            if (rec > 0) return '/dashboard/admin/users?tab=reception&receptionTab=applications';
            return '/dashboard/admin/users';
          })(),
          badge: (overview.doctorApplicationsPending ?? 0) + (overview.receptionistApplicationsPending ?? 0),
        },
        {
          title: 'Shop & marketplace',
          description: 'Clinic store catalog, orders, inventory, and pet ad moderation.',
          href:
            (overview.marketplaceAdsPending ?? 0) > 0
              ? '/dashboard/admin/shop?tab=marketplace'
              : '/dashboard/admin/shop',
          badge: overview.marketplaceAdsPending,
        },
        {
          title: 'Blog',
          description: 'Publish articles for the public blog.',
          href: '/dashboard/admin/blog',
        },
      ]
    : [];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-sans text-2xl font-semibold text-gray-900">Admin overview</p>
          <p className="mt-1 text-sm text-gray-600">
            Welcome, <span className="font-semibold">{user?.fullName}</span>. Clinic operations at
            a glance.
          </p>
        </div>
        <button
          type="button"
          onClick={loadStats}
          disabled={loading}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Refresh stats
        </button>
      </div>

      {statsError ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{statsError}</p>
      ) : null}

      {pendingTotal > 0 && overview ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="font-semibold">{pendingTotal} item(s)</span> need attention — vet
          applications, reception applications, marketplace ads, or pending appointments.
        </div>
      ) : null}

      {loading ? (
        <div className="mt-12 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : overview ? (
        <>
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <HeroStat
              label="Revenue (paid)"
              value={formatUsdFromCents(overview.revenueCents)}
              hint="Succeeded payment transactions"
              accent
            />
            <HeroStat
              label="Appointments"
              value={overview.totalAppointments}
              hint={`${overview.pendingAppointments} pending / awaiting payment`}
              accent
            />
            <HeroStat
              label="Pet owners"
              value={overview.totalPetOwners}
              accent
            />
            <HeroStat
              label="Shop orders (paid)"
              value={overview.shopOrdersPaid}
              hint={formatUsdFromCents(overview.shopRevenueCents)}
              accent
            />
          </section>

          <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            <CompactStat label="Doctors" value={overview.totalDoctors} />
            <CompactStat label="Active vet logins" value={overview.doctorsWithActiveLogin} />
            <CompactStat label="Receptionists" value={overview.totalReceptionists} />
            <CompactStat label="Treatment records" value={overview.medicalRecordsCount} />
            <CompactStat label="Vaccines due (30d)" value={overview.vaccinationsDueSoon} />
            <CompactStat label="Unread alerts" value={overview.notificationsUnread} />
          </section>

          <section className="mt-8">
            <p className="font-sans text-lg font-semibold text-gray-900">Management</p>
            <p className="mt-0.5 text-sm text-gray-500">Open a section from the sidebar or below</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickLinks.map((link) => (
                <QuickCard key={link.href} link={link} />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
