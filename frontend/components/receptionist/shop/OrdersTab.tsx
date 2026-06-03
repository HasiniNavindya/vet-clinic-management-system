'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchReceptionistOrders,
  patchReceptionistOrder,
} from '@/lib/receptionist';
import {
  FULFILLMENT_STEPS,
  formatMoney,
  type ReceptionistOrderWithItems,
} from '@/lib/receptionistShop';
import FulfillmentProgress from './FulfillmentProgress';

const FULFILLMENT_IDS = [...FULFILLMENT_STEPS.map((s) => s.id), 'cancelled'] as const;

type Filter = 'all' | 'active' | 'pending_payment' | 'delivered';

export default function OrdersTab() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<ReceptionistOrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchReceptionistOrders(token, { page: 1, limit: 50 });
      setOrders(data.orders);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter === 'pending_payment') return o.paymentStatus === 'pending_payment';
      if (filter === 'delivered') return o.fulfillmentStatus === 'delivered';
      if (filter === 'active') {
        return (
          o.paymentStatus === 'paid' &&
          !['delivered', 'cancelled'].includes(o.fulfillmentStatus)
        );
      }
      return true;
    });
  }, [orders, filter]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pendingPay: orders.filter((o) => o.paymentStatus === 'pending_payment').length,
      inProgress: orders.filter(
        (o) =>
          o.paymentStatus === 'paid' &&
          !['delivered', 'cancelled'].includes(o.fulfillmentStatus)
      ).length,
      delivered: orders.filter((o) => o.fulfillmentStatus === 'delivered').length,
    };
  }, [orders]);

  const updateStatus = async (id: number, fulfillmentStatus: string) => {
    if (!token) return;
    setBusyId(id);
    try {
      await patchReceptionistOrder(token, id, { fulfillmentStatus });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Total orders" value={stats.total} />
        <StatCard label="Awaiting payment" value={stats.pendingPay} tone="amber" />
        <StatCard label="In fulfillment" value={stats.inProgress} tone="blue" />
        <StatCard label="Delivered" value={stats.delivered} tone="green" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ['all', 'All'],
            ['active', 'In progress'],
            ['pending_payment', 'Awaiting payment'],
            ['delivered', 'Delivered'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === id
                ? 'bg-[#ec6d13] text-white'
                : 'bg-white text-gray-700 ring-1 ring-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <ul className="mt-6 space-y-4">
        {filtered.length === 0 ? (
          <li className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-gray-500">
            No orders in this view.
          </li>
        ) : (
          filtered.map((o) => (
            <li
              key={o.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 bg-gray-50/80 px-5 py-4">
                <div>
                  <p className="font-sans text-base font-semibold text-gray-900">
                    Order #{o.id} · {o.userFullName}
                  </p>
                  <p className="text-sm text-gray-600">{o.userEmail}</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {formatMoney(o.totalCents)}
                  </p>
                  <PaymentBadge status={o.paymentStatus} />
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <select
                    value={o.fulfillmentStatus}
                    disabled={busyId === o.id || o.paymentStatus !== 'paid'}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium disabled:opacity-50"
                    title={
                      o.paymentStatus !== 'paid'
                        ? 'Payment must be completed before fulfillment'
                        : undefined
                    }
                  >
                    {FULFILLMENT_IDS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  {o.paymentStatus !== 'paid' ? (
                    <p className="text-[10px] text-amber-700">Waiting for payment</p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 px-5 py-4 lg:grid-cols-2">
                <FulfillmentProgress status={o.fulfillmentStatus} />
                {o.items && o.items.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Items
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-700">
                      {o.items.map((item, i) => (
                        <li key={i} className="flex justify-between gap-2">
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <span className="text-gray-500">
                            {formatMoney(item.unitPriceCents * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              {o.trackingNote ? (
                <p className="border-t border-gray-100 px-5 py-2 text-sm text-gray-600">
                  Note: {o.trackingNote}
                </p>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: 'amber' | 'blue' | 'green';
}) {
  const styles =
    tone === 'amber'
      ? 'border-amber-200 bg-amber-50'
      : tone === 'blue'
        ? 'border-blue-200 bg-blue-50'
        : tone === 'green'
          ? 'border-green-200 bg-green-50'
          : 'border-gray-200 bg-white';
  return (
    <div className={`rounded-xl border px-3 py-3 ${styles}`}>
      <p className="text-2xl font-bold tabular-nums text-gray-900">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-green-100 text-green-800',
    pending_payment: 'bg-amber-100 text-amber-900',
    cancelled: 'bg-gray-100 text-gray-700',
  };
  return (
    <span
      className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
        styles[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      Payment: {status.replace(/_/g, ' ')}
    </span>
  );
}
