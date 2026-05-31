'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import {
  fetchPetOwnersForStaff,
  fetchTransactions,
  formatMoney,
  recordOfflinePayment,
  paymentTypeLabel,
} from '@/lib/payments';

export default function StaffPaymentsManagePage() {
  const { token, hasRole } = useAuth();
  const [owners, setOwners] = useState<Array<{ id: number; full_name: string; email: string }>>([]);
  const [transactions, setTransactions] = useState<
    import('@/lib/payments').PaymentTransaction[]
  >([]);
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

  const canManage = hasRole('admin', 'doctor', 'receptionist');

  useEffect(() => {
    if (!token || !canManage) return;
    fetchPetOwnersForStaff(token).then((res) => {
      if (res.ok) setOwners(res.data);
    });
    fetchTransactions(token).then((res) => {
      if (res.ok) setTransactions(res.data);
    });
  }, [token, canManage]);

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
    const txRes = await fetchTransactions(token);
    if (txRes.ok) setTransactions(txRes.data);
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-32">
          <Link href="/dashboard/calendar" className="text-sm font-medium text-[#ec6d13]">
            ← Calendar
          </Link>
          <h1 className="mt-2 text-gray-900">Record offline payment</h1>
          <p className="mt-1 text-gray-600">
            After consultation, record medicine and other fees paid in person. These appear on the
            pet owner&apos;s transaction history.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Pet owner</label>
              <select
                required
                value={form.user_id}
                onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
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
                placeholder="e.g. Post-visit medicine — Shagi"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes (optional)</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {message ? <p className="text-sm text-green-700">{message}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#ec6d13] px-6 py-3 font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Record payment'}
            </button>
          </form>

          <section className="mt-10">
            <h3 className="text-gray-900">Recent clinic payments</h3>
            <ul className="mt-4 space-y-2">
              {transactions.slice(0, 15).map((tx) => (
                <li key={tx.id} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium text-gray-900">
                      {tx.ownerName || `User #${tx.userId}`} — {paymentTypeLabel(tx.type)}
                    </span>
                    <span className="font-semibold">{formatMoney(tx.amountCents, tx.currency)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{tx.description}</p>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
