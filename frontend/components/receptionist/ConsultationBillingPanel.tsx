'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Appointment,
  formatAppointmentDate,
  formatTime,
} from '@/lib/appointments';
import {
  dollarsToCents,
  fetchBillingQueue,
  saveConsultationBilling,
} from '@/lib/receptionistBilling';
import { formatMoney } from '@/lib/payments';

type BillingForm = {
  consultation: string;
  vaccination: string;
  medicine: string;
  payment_method: 'cash' | 'card_offline' | 'other';
  notes: string;
};

const emptyForm = (): BillingForm => ({
  consultation: '',
  vaccination: '',
  medicine: '',
  payment_method: 'cash',
  notes: '',
});

export default function ConsultationBillingPanel() {
  const { token } = useAuth();
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [forms, setForms] = useState<Record<number, BillingForm>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    if (!token) return;
    setLoading(true);
    fetchBillingQueue(token).then((res) => {
      if (res.ok) setQueue(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, [token]);

  const setField = (id: number, key: keyof BillingForm, value: string) => {
    setForms((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || emptyForm()), [key]: value },
    }));
  };

  const totalCents = (form: BillingForm) =>
    dollarsToCents(form.consultation) +
    dollarsToCents(form.vaccination) +
    dollarsToCents(form.medicine);

  const submit = async (apt: Appointment, recordPayment: boolean) => {
    if (!token) return;
    const form = forms[apt.id] || emptyForm();
    const total = totalCents(form);
    if (total <= 0) {
      setError('Enter at least one charge (consultation, vaccination, or medicine).');
      return;
    }
    setBusyId(apt.id);
    setError('');
    setMessage('');
    const res = await saveConsultationBilling(token, apt.id, {
      consultation_fee_cents: dollarsToCents(form.consultation),
      vaccination_fee_cents: dollarsToCents(form.vaccination),
      medicine_fee_cents: dollarsToCents(form.medicine),
      record_payment: recordPayment,
      payment_method: form.payment_method,
      payment_notes: form.notes || undefined,
    });
    setBusyId(null);
    if (!res.ok) {
      setError((res.data as { error?: string }).error || 'Failed to save billing');
      return;
    }
    setMessage(
      recordPayment
        ? `Payment recorded for ${apt.petName || 'patient'}.`
        : `Charges saved for ${apt.petName || 'patient'}.`
    );
    load();
  };

  return (
    <div>
      <h1 className="font-sans text-2xl font-semibold tracking-tight text-gray-900">
        Consultation billing
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        After a veterinarian finishes consultation, add consultation, vaccination, and medicine
        charges here, then record payment at the desk.
      </p>

      {message ? (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">{message}</p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : queue.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <p className="font-medium text-gray-700">No visits waiting for billing</p>
          <p className="mt-1 text-sm text-gray-500">
            Finished consultations from doctors will appear here automatically.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-5">
          {queue.map((apt) => {
            const form = forms[apt.id] || emptyForm();
            const total = totalCents(form);
            return (
              <li
                key={apt.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <p className="font-sans text-base font-semibold text-gray-900">
                      {apt.petName || 'Pet'} · {apt.ownerName || apt.ownerEmail}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatAppointmentDate(apt.appointmentDate)} · {formatTime(apt.appointmentTime)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Dr. {apt.doctorName || '—'}
                      {apt.billingStatus === 'ready' ? ' · Charges saved, payment pending' : ''}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                    Consultation finished
                  </span>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <ChargeField
                    label="Consultation (USD)"
                    value={form.consultation}
                    onChange={(v) => setField(apt.id, 'consultation', v)}
                  />
                  <ChargeField
                    label="Vaccination (USD)"
                    value={form.vaccination}
                    onChange={(v) => setField(apt.id, 'vaccination', v)}
                  />
                  <ChargeField
                    label="Medicine (USD)"
                    value={form.medicine}
                    onChange={(v) => setField(apt.id, 'medicine', v)}
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-end gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Payment method
                    </label>
                    <select
                      value={form.payment_method}
                      onChange={(e) =>
                        setField(apt.id, 'payment_method', e.target.value)
                      }
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    >
                      <option value="cash">Cash</option>
                      <option value="card_offline">Card (at desk)</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="min-w-[200px] flex-1">
                    <label className="mb-1 block text-xs font-medium text-gray-600">Notes</label>
                    <input
                      type="text"
                      value={form.notes}
                      onChange={(e) => setField(apt.id, 'notes', e.target.value)}
                      placeholder="Optional"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    Total: {total > 0 ? formatMoney(total) : '$0.00'}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busyId === apt.id}
                    onClick={() => submit(apt, false)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Save charges
                  </button>
                  <button
                    type="button"
                    disabled={busyId === apt.id}
                    onClick={() => submit(apt, true)}
                    className="rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
                  >
                    {busyId === apt.id ? 'Saving…' : 'Save & record payment'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ChargeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.00"
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
      />
    </div>
  );
}
