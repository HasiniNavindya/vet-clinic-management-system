'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchReceptionistOrders,
  patchReceptionistOrder,
  type ReceptionistOrder,
} from '@/lib/receptionist';

const FULFILLMENT = ['unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    cents / 100
  );
}

export default function ReceptionistOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<ReceptionistOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchReceptionistOrders(token, { page: 1 });
      setOrders(data.orders);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

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

  return (
    <div>
      <h1 className="text-gray-900">Shop orders</h1>
      <p className="mt-1 text-sm text-gray-600">Track and update fulfillment status</p>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.length === 0 ? (
            <p className="text-gray-500">No orders yet.</p>
          ) : (
            orders.map((o) => (
              <li
                key={o.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Order #{o.id} — {o.userFullName}
                    </p>
                    <p className="text-sm text-gray-600">{o.userEmail}</p>
                    <p className="mt-1 text-sm">
                      {formatMoney(o.totalCents)} · Payment: {o.paymentStatus}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <select
                    value={o.fulfillmentStatus}
                    disabled={busyId === o.id}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium"
                  >
                    {FULFILLMENT.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                {o.trackingNote ? (
                  <p className="mt-2 text-sm text-gray-600">Note: {o.trackingNote}</p>
                ) : null}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
