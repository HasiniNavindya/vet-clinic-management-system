'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatUsdFromCents } from '@/lib/adminInsights';
import {
  fetchPaymentOverview,
  fetchPaymentOrderTracking,
  type PaymentOverview,
  type OrderPaymentRow,
} from '@/lib/adminPayments';
import { formatMoney } from '@/lib/payments';

export default function AdminPaymentsHubPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [overview, setOverview] = useState<PaymentOverview | null>(null);
  const [orders, setOrders] = useState<OrderPaymentRow[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      const [o, ot] = await Promise.all([
        fetchPaymentOverview(token),
        fetchPaymentOrderTracking(token, { page: 1, limit: 8 }),
      ]);
      setOverview(o);
      setOrders(ot.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load payments');
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
        <Link href="/dashboard/admin" className="text-sm font-semibold text-[#ec6d13] hover:underline">
          ← Admin home
        </Link>
        <h1 className="mt-4 text-gray-900">Payment management</h1>
        <p className="mt-2 text-gray-600">
          Monitor revenue, verify pending payments, issue refunds, and track shop order payments. Appointment
          bookings stay in awaiting payment until a successful transaction is recorded.
        </p>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        {overview ? (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-gray-500">Total revenue</p>
                <p className="mt-2 text-gray-900">
                  {formatUsdFromCents(overview.totalRevenueCents)}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-gray-500">Last 30 days</p>
                <p className="mt-2 text-gray-900">
                  {formatUsdFromCents(overview.revenueLast30DaysCents)}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-gray-500">Pending / processing</p>
                <p className="mt-2 text-gray-900">{overview.pendingCount}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-gray-500">Stripe online</p>
                <p className="mt-2 text-gray-900">
                  {overview.stripeEnabled ? 'Enabled' : 'Demo / offline only'}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link
                href="/dashboard/admin/payments/transactions"
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md"
              >
                <h3 className="text-gray-900">Transaction history</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Search, filter by status or type, verify payments, and manage refunds.
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">Open →</span>
              </Link>
              <Link
                href="/dashboard/admin/payments/revenue"
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md"
              >
                <h3 className="text-gray-900">Revenue reports</h3>
                <p className="mt-2 text-sm text-gray-600">Status breakdown and revenue by payment type.</p>
                <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">Open →</span>
              </Link>
            </div>

            {overview.recentTransactions.length > 0 ? (
              <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-900">Recent transactions</h3>
                  <Link
                    href="/dashboard/admin/payments/transactions"
                    className="text-sm font-semibold text-[#ec6d13] hover:underline"
                  >
                    View all →
                  </Link>
                </div>
                <ul className="mt-4 divide-y divide-gray-100 text-sm">
                  {overview.recentTransactions.map((t) => (
                    <li key={t.id} className="flex flex-wrap justify-between gap-2 py-3">
                      <span>
                        #{t.id} · {t.type} · {t.status}
                        {t.description ? ` — ${t.description}` : ''}
                      </span>
                      <span className="font-semibold text-gray-900">{formatMoney(t.amountCents)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {orders.length > 0 ? (
              <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-gray-900">Order payment tracking</h3>
                <p className="mt-1 text-sm text-gray-500">Shop orders linked to payment transactions.</p>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-xs uppercase text-gray-500">
                        <th className="py-2 pr-4">Order</th>
                        <th className="py-2 pr-4">Customer</th>
                        <th className="py-2 pr-4">Order status</th>
                        <th className="py-2 pr-4">Payment</th>
                        <th className="py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="border-b border-gray-50">
                          <td className="py-2 pr-4">#{o.id}</td>
                          <td className="py-2 pr-4">{o.user_full_name || o.user_email}</td>
                          <td className="py-2 pr-4">{o.status}</td>
                          <td className="py-2 pr-4">
                            {o.payment_tx_id
                              ? `#${o.payment_tx_id} (${o.payment_status || '—'})`
                              : 'No txn'}
                          </td>
                          <td className="py-2">{formatUsdFromCents(o.total_cents)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Link
                  href="/dashboard/admin/shop/orders"
                  className="mt-4 inline-block text-sm font-semibold text-[#ec6d13] hover:underline"
                >
                  Full order management →
                </Link>
              </section>
            ) : null}
          </>
        ) : !error ? (
          <div className="mt-12 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
          </div>
        ) : null}
    </div>
  );
}
