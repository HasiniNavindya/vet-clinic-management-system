'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Appointment,
  formatAppointmentDate,
  formatTime,
} from '@/lib/appointments';
import {
  BillingQueueItem,
  centsToDollars,
  dollarsToCents,
  fetchBillingQueue,
  saveConsultationBilling,
  visitChargesTotalCents,
} from '@/lib/receptionistBilling';
import { formatMoney } from '@/lib/payments';
import { fetchConsultationByAppointment, type MedicalRecord } from '@/lib/medicalRecords';

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

function formFromAppointment(apt: Appointment): BillingForm {
  return {
    consultation: centsToDollars(apt.consultationFeeCents),
    vaccination: centsToDollars(apt.vaccinationFeeCents),
    medicine: centsToDollars(apt.medicineFeeCents),
    payment_method: 'cash',
    notes: '',
  };
}

export default function ConsultationBillingPanel({
  focusAppointmentId,
}: {
  focusAppointmentId?: number;
}) {
  const { token } = useAuth();
  const [queue, setQueue] = useState<BillingQueueItem[]>([]);
  const [forms, setForms] = useState<Record<number, BillingForm>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    if (!token) return;
    setLoading(true);
    fetchBillingQueue(token).then((res) => {
      if (res.ok) {
        const items = res.data;
        setQueue(items);
        setForms((prev) => {
          const next = { ...prev };
          for (const apt of items) {
            if (!next[apt.id]) next[apt.id] = formFromAppointment(apt);
          }
          return next;
        });
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, [token]);

  useEffect(() => {
    if (!focusAppointmentId || loading) return;
    const el = document.getElementById(`billing-apt-${focusAppointmentId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusAppointmentId, loading, queue.length]);

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

  const submit = async (apt: BillingQueueItem, recordPayment: boolean) => {
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
        ? `Payment recorded. ${apt.petName || 'Patient'}'s appointment and profile are updated.`
        : `Charges sent to ${apt.ownerName || 'pet owner'}. They can view the balance on their appointment.`
    );
    load();
  };

  const pendingCount = queue.filter((a) => a.billingStatus === 'pending').length;
  const awaitingPayCount = queue.filter((a) => a.billingStatus === 'ready').length;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-semibold tracking-tight text-gray-900">
            Consultation billing
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            When a doctor saves consultation records, the visit appears here. Add visit charges,
            notify the pet owner, then record payment at the desk — updates appear on their
            appointment and health profile.
          </p>
        </div>
        <div className="flex gap-2">
          <StatPill label="Awaiting charges" value={pendingCount} tone="amber" />
          <StatPill label="Awaiting payment" value={awaitingPayCount} tone="blue" />
        </div>
      </div>

      <ol className="mt-6 grid gap-2 sm:grid-cols-3">
        <WorkflowStep n={1} title="Doctor completes visit" desc="Medical record saved" />
        <WorkflowStep n={2} title="Add charges" desc="Owner notified of balance" />
        <WorkflowStep n={3} title="Record payment" desc="Appointment & profile updated" />
      </ol>

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
          <p className="font-medium text-gray-700">No consultations waiting for billing</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            After a veterinarian saves consultation records for an appointment, the visit will
            appear here automatically.
          </p>
          <Link
            href="/dashboard/receptionist"
            className="mt-4 inline-block text-sm font-semibold text-[#ec6d13] hover:underline"
          >
            ← Back to dashboard
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-6">
          {queue.map((apt) => {
            const form = forms[apt.id] || emptyForm();
            const total = totalCents(form);
            const savedTotal = visitChargesTotalCents(apt);
            const isPaid = apt.billingStatus === 'paid';

            return (
              <li
                id={`billing-apt-${apt.id}`}
                key={apt.id}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
                  focusAppointmentId === apt.id
                    ? 'border-[#ec6d13] ring-2 ring-[#ec6d13]/25'
                    : 'border-gray-100'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 bg-gray-50/80 px-5 py-4">
                  <div>
                    <p className="font-sans text-base font-semibold text-gray-900">
                      {apt.petName || 'Pet'} · {apt.ownerName || apt.ownerEmail}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatAppointmentDate(apt.appointmentDate)} · {formatTime(apt.appointmentTime)}{' '}
                      · Dr. {apt.doctorName || '—'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {apt.userId ? (
                        <Link
                          href={`/dashboard/receptionist/pets?view=owners&highlight=${apt.userId}`}
                          className="text-xs font-semibold text-[#ec6d13] hover:underline"
                        >
                          Pet owner profile →
                        </Link>
                      ) : null}
                      {apt.petId ? (
                        <Link
                          href={`/dashboard/receptionist/pets`}
                          className="text-xs font-semibold text-gray-600 hover:underline"
                        >
                          Pet list →
                        </Link>
                      ) : null}
                    </div>
                  </div>
                  <BillingStatusBadge status={apt.billingStatus} />
                </div>

                <ConsultationRecordBlock
                  appointmentId={apt.id}
                  record={apt.medicalRecord}
                  token={token}
                />

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Visit charges (USD)
                  </p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-3">
                    <ChargeField
                      label="Consultation"
                      value={form.consultation}
                      onChange={(v) => setField(apt.id, 'consultation', v)}
                      disabled={isPaid}
                    />
                    <ChargeField
                      label="Vaccination"
                      value={form.vaccination}
                      onChange={(v) => setField(apt.id, 'vaccination', v)}
                      disabled={isPaid}
                    />
                    <ChargeField
                      label="Medicine"
                      value={form.medicine}
                      onChange={(v) => setField(apt.id, 'medicine', v)}
                      disabled={isPaid}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-end gap-4">
                    {!isPaid ? (
                      <>
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
                          <label className="mb-1 block text-xs font-medium text-gray-600">
                            Notes
                          </label>
                          <input
                            type="text"
                            value={form.notes}
                            onChange={(e) => setField(apt.id, 'notes', e.target.value)}
                            placeholder="Optional"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                          />
                        </div>
                      </>
                    ) : null}
                    <p className="text-sm font-semibold text-gray-900">
                      Total:{' '}
                      {total > 0
                        ? formatMoney(total)
                        : savedTotal > 0
                          ? formatMoney(savedTotal)
                          : '$0.00'}
                    </p>
                  </div>

                  {!isPaid ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyId === apt.id}
                        onClick={() => submit(apt, false)}
                        className="rounded-lg border border-[#ec6d13] px-4 py-2 text-sm font-semibold text-[#ec6d13] hover:bg-orange-50 disabled:opacity-50"
                      >
                        {busyId === apt.id ? 'Saving…' : 'Save charges & notify owner'}
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
                  ) : (
                    <p className="mt-4 text-sm font-medium text-green-800">
                      Paid — visible on the pet owner&apos;s appointment and payment history.
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'amber' | 'blue';
}) {
  const styles =
    tone === 'amber'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : 'border-blue-200 bg-blue-50 text-blue-900';
  return (
    <div className={`rounded-xl border px-3 py-2 text-center ${styles}`}>
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{label}</p>
    </div>
  );
}

function WorkflowStep({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <li className="flex gap-3 rounded-xl border border-gray-100 bg-white px-3 py-3 text-sm">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ec6d13]/15 text-xs font-bold text-[#b6530f]">
        {n}
      </span>
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </li>
  );
}

function BillingStatusBadge({ status }: { status?: string }) {
  if (status === 'paid') {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
        Paid
      </span>
    );
  }
  if (status === 'ready') {
    return (
      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-900">
        Awaiting payment
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
      Add charges
    </span>
  );
}

function ConsultationRecordBlock({
  appointmentId,
  record: initialRecord,
  token,
}: {
  appointmentId: number;
  record?: MedicalRecord | null;
  token: string | null;
}) {
  const [record, setRecord] = useState<MedicalRecord | null | undefined>(initialRecord);
  const [loading, setLoading] = useState(!initialRecord);

  useEffect(() => {
    setRecord(initialRecord);
    setLoading(!initialRecord);
  }, [initialRecord, appointmentId]);

  useEffect(() => {
    if (initialRecord || !token) return;
    let cancelled = false;
    (async () => {
      const res = await fetchConsultationByAppointment(token, appointmentId);
      if (cancelled) return;
      if (res.ok && res.data.record) setRecord(res.data.record);
      else setRecord(null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [appointmentId, token, initialRecord]);

  if (loading) {
    return (
      <div className="border-b border-gray-100 bg-slate-50/60 px-5 py-4">
        <p className="text-sm text-gray-500">Loading consultation record…</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="border-b border-gray-100 bg-amber-50/50 px-5 py-3">
        <p className="text-sm text-amber-800">
          Consultation record not found. Ask the doctor to save medical records for this visit.
        </p>
      </div>
    );
  }

  return <ConsultationRecordSummary record={record} />;
}

function ConsultationRecordSummary({ record }: { record: MedicalRecord }) {
  const fields = [
    { label: 'Diagnosis', value: record.diagnosis },
    { label: 'Symptoms', value: record.symptoms },
    { label: 'Treatment', value: record.treatment },
    { label: 'Notes', value: record.consultationNotes },
  ].filter((f) => f.value);

  return (
    <div className="border-b border-gray-100 bg-slate-50/60 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Doctor consultation record
      </p>
      {fields.length === 0 ? (
        <p className="mt-2 text-sm text-gray-600">Record saved (no detail text).</p>
      ) : (
        <dl className="mt-2 grid gap-2 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.label}>
              <dt className="text-[10px] font-semibold uppercase text-gray-500">{f.label}</dt>
              <dd className="mt-0.5 text-sm text-gray-800">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function ChargeField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.00"
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm disabled:bg-gray-50"
      />
    </div>
  );
}
