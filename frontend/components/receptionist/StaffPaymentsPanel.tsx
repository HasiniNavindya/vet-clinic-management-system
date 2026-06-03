'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  fetchPetOwnersForStaff,
  fetchTransactions,
  formatMoney,
  recordOfflinePayment,
  paymentTypeLabel,
  type PaymentTransaction,
} from '@/lib/payments';

type PaymentsTab = 'record' | 'recent';

function parseTab(value: string | null): PaymentsTab {
  return value === 'recent' ? 'recent' : 'record';
}

export default function StaffPaymentsPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get('tab'));
  const { token } = useAuth();

  const setTab = (next: PaymentsTab) => {
    const q = next === 'recent' ? '?tab=recent' : '';
    router.replace(`/dashboard/receptionist/payments${q}`, { scroll: false });
  };

  const [owners, setOwners] = useState<Array<{ id: number; full_name: string; email: string }>>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [form, setForm] = useState({
    user_id: '',
    amount: '',
    type: 'consultation' as 'consultation' | 'prescription' | 'other',
    description: '',
    payment_method: 'cash' as 'cash' | 'card_offline' | 'other',
    notes: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchPetOwnersForStaff(token).then((res) => {
      if (res.ok) setOwners(res.data);
    });
  }, [token]);

  const loadTransactions = useCallback(async () => {
    if (!token) return;
    setHistoryLoading(true);
    const res = await fetchTransactions(token);
    if (res.ok) setTransactions(res.data);
    setHistoryLoading(false);
  }, [token]);

  useEffect(() => {
    if (tab === 'recent') loadTransactions();
  }, [tab, loadTransactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError('');
    setMessage('');

    const amountCents = Math.round(parseFloat(form.amount) * 100);
    if (!form.user_id || !amountCents || amountCents <= 0) {
      setError('Select a pet owner and enter a valid amount.');
      setSubmitting(false);
      return;
    }

    const res = await recordOfflinePayment(token, {
      user_id: Number(form.user_id),
      amount_cents: amountCents,
      type: form.type,
      description: form.description || `${form.type} payment at clinic`,
      payment_method: form.payment_method,
      notes: form.notes,
    });

    setSubmitting(false);
    if (!res.ok) {
      setError((res.data as { error?: string }).error || 'Failed to record payment');
      return;
    }
    setMessage('Payment recorded on pet owner profile.');
    setForm((f) => ({ ...f, amount: '', description: '', notes: '' }));
    await loadTransactions();
  };

  return (
    <div>
      <p className="font-sans text-xl font-semibold text-gray-900">Payments</p>
      <p className="mt-0.5 text-sm text-gray-500">
        Record in-person fees or review recent clinic payment activity
      </p>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab('record')}
          className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
            tab === 'record'
              ? 'border-b-2 border-[#ec6d13] text-[#ec6d13]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Record offline payment
        </button>
        <button
          type="button"
          onClick={() => setTab('recent')}
          className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
            tab === 'recent'
              ? 'border-b-2 border-[#ec6d13] text-[#ec6d13]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Recent clinic payments
        </button>
      </div>

      {tab === 'record' ? (
        <section className="mt-6">
          <p className="text-sm text-gray-600">
            After consultation, record fees paid in person on the pet owner&apos;s account.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-4 max-w-xl space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Pet owner</label>
              <select
                required
                value={form.user_id}
                onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
              >
                <option value="">Select owner</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.full_name} ({o.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      type: e.target.value as 'consultation' | 'prescription' | 'other',
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                >
                  <option value="consultation">Consultation fee</option>
                  <option value="prescription">Prescription / medicine</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Payment method</label>
              <select
                value={form.payment_method}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    payment_method: e.target.value as 'cash' | 'card_offline' | 'other',
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
              >
                <option value="cash">Cash</option>
                <option value="card_offline">Card (at clinic)</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {message ? (
              <p className="text-sm text-green-700">
                {message}{' '}
                <button
                  type="button"
                  onClick={() => setTab('recent')}
                  className="font-semibold text-[#ec6d13] hover:underline"
                >
                  View in recent payments →
                </button>
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#ec6d13] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Record payment'}
            </button>
          </form>
        </section>
      ) : null}

      {tab === 'recent' ? (
        <section className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-600">
              Latest payments recorded at the clinic (offline and related transactions).
            </p>
            <button
              type="button"
              onClick={loadTransactions}
              disabled={historyLoading}
              className="text-sm font-semibold text-[#ec6d13] hover:text-[#d65e0f] disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {historyLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">
              No clinic payments recorded yet.
            </p>
          ) : (
            <ul className="max-w-2xl space-y-3">
              {transactions.slice(0, 50).map((tx) => (
                <li
                  key={tx.id}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-medium text-gray-900">
                      {tx.ownerName || `User #${tx.userId}`} — {paymentTypeLabel(tx.type)}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatMoney(tx.amountCents, tx.currency)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{tx.description}</p>
                  {tx.createdAt ? (
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
