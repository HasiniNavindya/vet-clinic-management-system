'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import {
  fetchPaymentConfig,
  fetchTransactions,
  formatMoney,
  PaymentConfig,
  PaymentTransaction,
  paymentStatusLabel,
  paymentTypeLabel,
} from '@/lib/payments';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    succeeded: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-700',
    refunded: 'bg-purple-100 text-purple-800',
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status] || 'bg-gray-100 text-gray-700'}`}
    >
      {paymentStatusLabel(status as PaymentTransaction['status'])}
    </span>
  );
}

export default function TransactionHistoryPage() {
  const { token } = useAuth();
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      const [cfgRes, txRes] = await Promise.all([
        fetchPaymentConfig(token),
        fetchTransactions(token),
      ]);
      if (cfgRes.ok) setConfig(cfgRes.data);
      if (txRes.ok) setTransactions(txRes.data);
      else setError((txRes.data as { error?: string }).error || 'Failed to load transactions');
      setLoading(false);
    };
    load();
  }, [token]);

  return (
    <PetOwnerShell>
      <div className="mb-6">
        <h1 className="text-gray-900">Transaction History</h1>
        <p className="mt-1 text-gray-600">
          Online payments for appointments and shop orders. Consultation and medicine fees paid at the
          clinic appear here after staff records them.
        </p>
        {config ? (
          <p className="mt-2 text-sm text-gray-500">
            Appointment booking fee: {formatMoney(config.appointmentBookingFeeCents, config.currency)}
            {config.stripeEnabled ? ' · Stripe enabled' : ' · Demo payment mode (no Stripe keys)'}
          </p>
        ) : null}
      </div>

      {error ? <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
          <p className="text-gray-600">No transactions yet.</p>
          <Link
            href="/dashboard/pet-owner/appointments/book"
            className="mt-4 inline-block font-semibold text-[#ec6d13]"
          >
            Book an appointment →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{paymentTypeLabel(tx.type)}</p>
                  <p className="mt-1 text-sm text-gray-600">{tx.description}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ''}
                    {tx.paymentMethod !== 'stripe' ? ` · ${tx.paymentMethod.replace('_', ' ')}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-900">
                    {formatMoney(tx.amountCents, tx.currency)}
                  </p>
                  <StatusBadge status={tx.status} />
                </div>
              </div>
              {tx.type === 'appointment_booking' && tx.referenceId && tx.status === 'succeeded' ? (
                <Link
                  href={`/dashboard/pet-owner/appointments/${tx.referenceId}`}
                  className="mt-3 inline-block text-sm font-semibold text-[#ec6d13]"
                >
                  View appointment →
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </PetOwnerShell>
  );
}
