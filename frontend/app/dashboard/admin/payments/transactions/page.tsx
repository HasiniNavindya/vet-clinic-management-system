'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAdminTransactions,
  verifyAdminTransaction,
  refundAdminTransaction,
} from '@/lib/adminPayments';
import { formatMoney, type PaymentTransaction } from '@/lib/payments';

export default function AdminPaymentTransactionsPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const r = await fetchAdminTransactions(token, {
        page,
        limit: 20,
        status: status || undefined,
        type: type || undefined,
        search: search.trim() || undefined,
      });
      setTransactions(r.transactions);
      setTotalPages(r.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, [token, page, status, type, search]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=admin');
    if (!isLoading && isAuthenticated && !hasRole('admin')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, hasRole, router]);

  useEffect(() => {
    if (isAuthenticated && hasRole('admin') && token) load();
  }, [isAuthenticated, hasRole, token, load]);

  const verify = async (id: number) => {
    if (!token || !confirm('Mark this payment as succeeded and fulfill linked booking/order?')) return;
    setActionId(id);
    try {
      await verifyAdminTransaction(token, id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Verify failed');
    } finally {
      setActionId(null);
    }
  };

  const refund = async (id: number) => {
    if (!token) return;
    const reason = prompt('Refund reason (optional):') ?? '';
    if (!confirm('Mark this payment as refunded? (Status only — no Stripe refund API.)')) return;
    setActionId(id);
    try {
      await refundAdminTransaction(token, id, reason);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Refund failed');
    } finally {
      setActionId(null);
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
      <div className="container mx-auto max-w-6xl px-4 py-8 pt-28">
        <Link href="/dashboard/admin/payments" className="text-sm font-semibold text-[#ec6d13] hover:underline">
          ← Payment dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Transaction history</h1>

        <div className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500">Status</label>
            <select
              className="mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="succeeded">Succeeded</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500">Type</label>
            <select
              className="mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={type}
              onChange={(e) => {
                setPage(1);
                setType(e.target.value);
              }}
            >
              <option value="">All</option>
              <option value="appointment_booking">Appointment booking</option>
              <option value="shop_order">Shop order</option>
              <option value="consultation">Consultation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="min-w-[12rem] flex-1">
            <label className="block text-xs font-semibold uppercase text-gray-500">Search</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="ID, email, or description"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load())}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setPage(1);
              load();
            }}
            className="rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f]"
          >
            Apply
          </button>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">#{t.id}</td>
                    <td className="px-4 py-3">
                      <div>{t.ownerName || '—'}</div>
                      <div className="text-xs text-gray-500">{t.ownerEmail}</div>
                    </td>
                    <td className="px-4 py-3">{t.type}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          t.status === 'succeeded'
                            ? 'bg-green-100 text-green-800'
                            : t.status === 'pending' || t.status === 'processing'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatMoney(t.amountCents)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {t.paidAt ? new Date(t.paidAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {(t.status === 'pending' || t.status === 'processing') && (
                          <button
                            type="button"
                            disabled={actionId === t.id}
                            onClick={() => verify(t.id)}
                            className="rounded border border-green-600 px-2 py-1 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50"
                          >
                            Verify
                          </button>
                        )}
                        {t.status === 'succeeded' && (
                          <button
                            type="button"
                            disabled={actionId === t.id}
                            onClick={() => refund(t.id)}
                            className="rounded border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 ? (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border px-3 py-1 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border px-3 py-1 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
