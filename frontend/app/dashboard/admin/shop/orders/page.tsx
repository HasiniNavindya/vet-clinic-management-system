'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAdminShopOrders,
  fetchAdminShopOrderDetail,
  patchAdminShopOrder,
  type AdminShopOrder,
} from '@/lib/adminShop';

export default function AdminShopOrdersPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [orders, setOrders] = useState<AdminShopOrder[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paymentFilter, setPaymentFilter] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [detail, setDetail] = useState<{
    order: AdminShopOrder;
    items: { itemName: string; quantity: number; unitPriceCents: number }[];
  } | null>(null);
  const [fulfillForm, setFulfillForm] = useState({
    fulfillmentStatus: 'unfulfilled',
    trackingNote: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const r = await fetchAdminShopOrders(token, {
        page,
        limit: 15,
        paymentStatus: paymentFilter || undefined,
      });
      setOrders(r.orders);
      setTotalPages(r.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, [token, page, paymentFilter]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=admin');
    if (!isLoading && isAuthenticated && !hasRole('admin')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, hasRole, router]);

  useEffect(() => {
    if (isAuthenticated && hasRole('admin') && token) load();
  }, [isAuthenticated, hasRole, token, load]);

  const toggleDetail = async (id: number) => {
    if (!token) return;
    if (expanded === id) {
      setExpanded(null);
      setDetail(null);
      return;
    }
    setExpanded(id);
    try {
      const r = await fetchAdminShopOrderDetail(token, id);
      setDetail({ order: r.order, items: r.items });
      setFulfillForm({
        fulfillmentStatus: r.order.fulfillmentStatus || 'unfulfilled',
        trackingNote: r.order.trackingNote || '',
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed');
    }
  };

  const saveFulfillment = async () => {
    if (!token || expanded === null) return;
    try {
      await patchAdminShopOrder(token, expanded, {
        fulfillmentStatus: fulfillForm.fulfillmentStatus,
        trackingNote: fulfillForm.trackingNote || null,
      });
      load();
      alert('Order updated');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed');
    }
  };

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
      <div className="container mx-auto max-w-5xl px-4 py-8 pt-28">
        <Link href="/dashboard/admin/shop" className="text-sm font-semibold text-[#ec6d13] hover:underline">
          ← Shop hub
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Order management</h1>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="text-sm text-gray-600">
            Payment status:{' '}
            <select
              className="ml-1 rounded border border-gray-300 px-2 py-1"
              value={paymentFilter}
              onChange={(e) => {
                setPage(1);
                setPaymentFilter(e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="pending_payment">Pending payment</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <div className="mt-10 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
          </div>
        ) : (
          <div className="mt-6 space-y-2">
            {orders.map((o) => (
              <div key={o.id} className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleDetail(o.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left hover:bg-gray-50"
                >
                  <span className="font-semibold text-gray-900">Order #{o.id}</span>
                  <span className="text-sm text-gray-600">{o.userEmail}</span>
                  <span className="text-sm capitalize">{o.paymentStatus}</span>
                  <span className="text-sm">
                    ${(o.totalCents / 100).toFixed(2)} · {o.fulfillmentStatus}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</span>
                </button>
                {expanded === o.id && detail && detail.order.id === o.id && (
                  <div className="border-t border-gray-100 px-4 py-4 text-sm">
                    <p className="font-semibold text-gray-900">Line items</p>
                    <ul className="mt-2 list-inside list-disc text-gray-700">
                      {detail.items.map((li) => (
                        <li key={`${li.itemName}-${li.quantity}`}>
                          {li.itemName} × {li.quantity} @ ${(li.unitPriceCents / 100).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-gray-600">
                      Ship to: {detail.order.shippingName || '—'}, {detail.order.shippingAddress || ''}{' '}
                      {detail.order.shippingCity || ''} {detail.order.shippingZip || ''}
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase text-gray-500">Fulfillment</span>
                        <select
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-2"
                          value={fulfillForm.fulfillmentStatus}
                          onChange={(e) =>
                            setFulfillForm((f) => ({ ...f, fulfillmentStatus: e.target.value }))
                          }
                        >
                          <option value="unfulfilled">Unfulfilled</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="text-xs font-semibold uppercase text-gray-500">Tracking / internal note</span>
                        <textarea
                          rows={2}
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-2"
                          value={fulfillForm.trackingNote}
                          onChange={(e) => setFulfillForm((f) => ({ ...f, trackingNote: e.target.value }))}
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={saveFulfillment}
                      className="mt-3 rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Save fulfillment
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border px-3 py-1 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
