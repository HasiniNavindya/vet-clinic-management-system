'use client';

import Link from 'next/link';
import {
  formatUsdFromCents,
  type AdminOverviewStats,
} from '@/lib/adminInsights';

const ORANGE = '#ec6d13';
const COLORS = ['#ec6d13', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

type ActivityEvent = { kind: string; summary: string; meta?: string; occurredAt: string };

function barHeight(value: number, max: number, maxPx = 88) {
  if (max <= 0) return 4;
  return Math.max(4, Math.round((value / max) * maxPx));
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function kindLabel(kind: string) {
  if (kind === 'payment') return 'Payments';
  if (kind === 'registration') return 'New accounts';
  if (kind === 'appointment') return 'Appointments';
  return kind;
}

function DonutChart({
  segments,
  size = 140,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total <= 0) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-gray-100 text-xs text-gray-500"
        style={{ width: size, height: size }}
      >
        No data
      </div>
    );
  }

  let gradient = '';
  let pct = 0;
  segments.forEach((seg) => {
    const share = (seg.value / total) * 100;
    gradient += `${seg.color} ${pct}% ${pct + share}%, `;
    pct += share;
  });

  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${gradient.slice(0, -2)})`,
      }}
    >
      <div
        className="absolute inset-[22%] flex items-center justify-center rounded-full bg-white text-center"
      >
        <span className="text-gray-900">{total}</span>
      </div>
    </div>
  );
}

function Legend({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <ul className="space-y-2 text-sm">
      {segments.map((seg) => (
        <li key={seg.label} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-gray-700">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: seg.color }} />
            {seg.label}
          </span>
          <span className="font-semibold text-gray-900">
            {seg.value}
            <span className="ml-1 text-xs font-normal text-gray-500">
              ({Math.round((seg.value / total) * 100)}%)
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function MiniBarChart({
  title,
  subtitle,
  series,
  valueKey,
  formatValue,
  color,
}: {
  title: string;
  subtitle?: string;
  series: { day: string; count?: number; cents?: number }[];
  valueKey: 'count' | 'cents';
  formatValue?: (n: number) => string;
  color: string;
}) {
  const values = series.map((p) => (valueKey === 'cents' ? p.cents ?? 0 : p.count ?? 0));
  const max = Math.max(1, ...values);

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {subtitle ? <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p> : null}
      {series.length === 0 ? (
        <p className="mt-4 text-xs text-gray-400">No data in this period.</p>
      ) : (
        <div className="mt-4 flex h-24 items-end gap-1 overflow-x-auto pb-1">
          {series.map((p) => {
            const v = valueKey === 'cents' ? p.cents ?? 0 : p.count ?? 0;
            const label = p.day.slice(5);
            const tip = formatValue ? formatValue(v) : String(v);
            return (
              <div
                key={p.day}
                className="flex min-w-[10px] flex-1 flex-col items-center justify-end"
                title={`${p.day}: ${tip}`}
              >
                <div
                  className="w-full min-w-[8px] rounded-t transition-all"
                  style={{ height: barHeight(v, max), background: color }}
                />
                <span className="mt-1 text-[9px] text-gray-400">{label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

type Props = {
  overview: AdminOverviewStats;
  breakdown: { status: string; count: number }[];
  apSeries: { day: string; count: number }[];
  revSeries: { day: string; cents: number }[];
  activity: ActivityEvent[];
  /** When false, hides link to full analytics (use on the analytics page itself). */
  showFullAnalyticsLink?: boolean;
  className?: string;
};

export default function AdminDashboardCharts({
  overview,
  breakdown,
  apSeries,
  revSeries,
  activity,
  showFullAnalyticsLink = true,
  className = 'mt-10',
}: Props) {
  const userSegments = [
    { label: 'Pet owners', value: overview.totalPetOwners, color: ORANGE },
    { label: 'Doctors', value: overview.totalDoctors, color: COLORS[1] },
    { label: 'Staff', value: overview.totalStaff, color: COLORS[2] },
    { label: 'Admins', value: overview.totalAdmins, color: COLORS[3] },
  ].filter((s) => s.value > 0);

  const statusSegments = breakdown
    .filter((r) => r.count > 0)
    .map((r, i) => ({
      label: formatStatus(r.status),
      value: r.count,
      color: COLORS[i % COLORS.length],
    }));

  const kindCounts: Record<string, number> = {};
  activity.forEach((ev) => {
    kindCounts[ev.kind] = (kindCounts[ev.kind] || 0) + 1;
  });
  const activitySegments = Object.entries(kindCounts).map(([kind, value], i) => ({
    label: kindLabel(kind),
    value,
    color: COLORS[i % COLORS.length],
  }));

  const shopCents = overview.shopRevenueCents;
  const paymentCents = Math.max(0, overview.revenueCents);
  const revenueSegments = [
    { label: 'Paid transactions', value: paymentCents, color: COLORS[1] },
    { label: 'Shop orders', value: shopCents, color: ORANGE },
  ].filter((s) => s.value > 0);

  const revenueDisplay = revenueSegments.map((s) => ({
    ...s,
    display: formatUsdFromCents(s.value),
  }));

  const maxRevenueBar = Math.max(1, ...revenueDisplay.map((s) => s.value));

  const dayCounts: Record<string, number> = {};
  activity.forEach((ev) => {
    if (!ev.occurredAt) return;
    const day = ev.occurredAt.slice(0, 10);
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  const timelineDays = Object.entries(dayCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([day, count]) => ({ day, count }));
  const timelineMax = Math.max(1, ...timelineDays.map((d) => d.count));

  return (
    <section className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-gray-900">Analytics snapshot</h3>
          <p className="text-sm text-gray-500">Visual overview of clinic activity and revenue</p>
        </div>
        {showFullAnalyticsLink ? (
          <Link href="/dashboard/admin/analytics" className="text-sm font-semibold text-[#ec6d13] hover:underline">
            Full analytics →
          </Link>
        ) : null}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Appointments by status */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-5">
          <h3 className="font-semibold text-gray-900">Appointments by status</h3>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <DonutChart segments={statusSegments} />
            <div className="min-w-[10rem] flex-1">
              <Legend segments={statusSegments} />
            </div>
          </div>
        </div>

        {/* User accounts */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-5">
          <h3 className="font-semibold text-gray-900">Accounts by role</h3>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <DonutChart segments={userSegments} />
            <div className="min-w-[10rem] flex-1">
              <Legend segments={userSegments} />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-5">
          <h3 className="font-semibold text-gray-900">Revenue breakdown</h3>
          <p className="mt-1 text-xs text-gray-500">Recorded paid amounts (lifetime totals)</p>
          <div className="mt-4 space-y-3">
            {revenueDisplay.length === 0 ? (
              <p className="text-sm text-gray-400">No revenue recorded yet.</p>
            ) : (
              revenueDisplay.map((seg) => (
                <div key={seg.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-700">{seg.label}</span>
                    <span className="font-semibold text-gray-900">{seg.display}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.round((seg.value / maxRevenueBar) * 100)}%`,
                        background: seg.color,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent activity types */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-5">
          <h3 className="font-semibold text-gray-900">Recent activity mix</h3>
          <p className="mt-1 text-xs text-gray-500">Last {activity.length} events by type</p>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <DonutChart segments={activitySegments} size={120} />
            <div className="min-w-[10rem] flex-1">
              <Legend segments={activitySegments} />
            </div>
          </div>
        </div>

        {/* Daily bookings */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-5 lg:col-span-1">
          <MiniBarChart
            title="New bookings per day"
            subtitle="Last 14 days"
            series={apSeries}
            valueKey="count"
            color={ORANGE}
          />
        </div>

        {/* Daily revenue */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-5 lg:col-span-1">
          <MiniBarChart
            title="Paid revenue per day"
            subtitle="Last 14 days · successful payments"
            series={revSeries}
            valueKey="cents"
            formatValue={(c) => formatUsdFromCents(c)}
            color="#10b981"
          />
        </div>

        {/* Activity timeline */}
        {timelineDays.length > 0 ? (
          <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900">Activity timeline</h3>
            <p className="mt-0.5 text-xs text-gray-500">Events per day (from recent feed)</p>
            <div className="mt-4 flex h-20 items-end gap-2">
              {timelineDays.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center" title={`${d.day}: ${d.count} events`}>
                  <div
                    className="w-full max-w-[2rem] rounded-t bg-[#3b82f6]/85"
                    style={{ height: barHeight(d.count, timelineMax, 72) }}
                  />
                  <span className="mt-1 text-[9px] text-gray-400">{d.day.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
