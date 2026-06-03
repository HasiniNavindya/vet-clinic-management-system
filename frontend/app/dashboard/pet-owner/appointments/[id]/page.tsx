'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import {
  Appointment,
  acceptRescheduleOffer,
  cancelAppointment,
  fetchAppointment,
  DayScheduleSlot,
  fetchDoctorAvailability,
  formatAppointmentDate,
  formatTime,
  OWNER_CANCELLABLE,
  OWNER_RESCHEDULABLE,
  rescheduleAppointment,
} from '@/lib/appointments';
import { createAppointmentCheckout, fetchPaymentConfig, formatMoney } from '@/lib/payments';
import { visitChargesTotalCents } from '@/lib/receptionistBilling';
import { fetchConsultationByAppointment } from '@/lib/medicalRecords';
import AppointmentFeedbackForm from '@/components/appointments/AppointmentFeedbackForm';

export default function AppointmentDetailPage() {
  const params = useParams();
  const { token } = useAuth();
  const id = params.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [showReschedule, setShowReschedule] = useState(false);
  const [schedule, setSchedule] = useState<DayScheduleSlot[]>([]);
  const [rescheduleForm, setRescheduleForm] = useState({ appointment_date: '', appointment_time: '' });
  const [cancelReason, setCancelReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [feeLabel, setFeeLabel] = useState('');
  const [hasConsultationRecord, setHasConsultationRecord] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    const res = await fetchAppointment(token, id);
    if (!res.ok) {
      setError((res.data as { error?: string }).error || 'Not found');
      setAppointment(null);
    } else {
      setAppointment(res.data);
      setRescheduleForm({
        appointment_date: res.data.appointmentDate,
        appointment_time: res.data.appointmentTime,
      });
    }
    if (res.ok && res.data.status === 'completed') {
      const consult = await fetchConsultationByAppointment(token, id);
      if (consult.ok) setHasConsultationRecord(consult.data.hasRecord);
    } else {
      setHasConsultationRecord(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [token, id]);

  useEffect(() => {
    if (!token) return;
    fetchPaymentConfig(token).then((res) => {
      if (res.ok) setFeeLabel(formatMoney(res.data.appointmentBookingFeeCents, res.data.currency));
    });
  }, [token]);

  useEffect(() => {
    if (!token || !appointment || !showReschedule || !rescheduleForm.appointment_date) return;
    fetchDoctorAvailability(token, appointment.doctorId, rescheduleForm.appointment_date).then((res) => {
      if (res.ok) {
        const daySchedule =
          res.data.schedule?.length
            ? res.data.schedule
            : res.data.slots.map((time) => ({ time, status: 'available' as const }));
        setSchedule(daySchedule);
      } else {
        setSchedule([]);
      }
    });
  }, [token, appointment, showReschedule, rescheduleForm.appointment_date]);

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    setActionError('');
    const res = await rescheduleAppointment(token, id, rescheduleForm);
    setBusy(false);
    if (!res.ok) {
      setActionError((res.data as { error?: string }).error || 'Reschedule failed');
      return;
    }
    setShowReschedule(false);
    setAppointment(res.data);
  };

  const handlePay = async () => {
    if (!token || !appointment) return;
    setBusy(true);
    setActionError('');
    const res = await createAppointmentCheckout(token, { appointment_id: appointment.id });
    setBusy(false);
    if (!res.ok) {
      setActionError((res.data as { error?: string }).error || 'Could not start payment');
      return;
    }
    if (res.data.url) window.location.href = res.data.url;
  };

  const handleAcceptReschedule = async () => {
    if (!token) return;
    setBusy(true);
    setActionError('');
    const res = await acceptRescheduleOffer(token, id);
    setBusy(false);
    if (!res.ok) {
      setActionError((res.data as { error?: string }).error || 'Could not accept');
      return;
    }
    setAppointment(res.data);
  };

  const handleCancel = async () => {
    if (!token || !confirm('Cancel this appointment?')) return;
    setBusy(true);
    setActionError('');
    const res = await cancelAppointment(token, id, cancelReason);
    setBusy(false);
    if (!res.ok) {
      setActionError((res.data as { error?: string }).error || 'Cancel failed');
      return;
    }
    setAppointment(res.data);
  };

  if (loading) {
    return (
      <PetOwnerShell>
        <LoadingSpinner />
      </PetOwnerShell>
    );
  }

  if (!appointment) {
    return (
      <PetOwnerShell>
        <p className="text-red-600">{error || 'Appointment not found'}</p>
        <Link href="/dashboard/pet-owner/appointments" className="mt-4 inline-block text-[#ec6d13]">
          Back to list
        </Link>
      </PetOwnerShell>
    );
  }

  const canReschedule = OWNER_RESCHEDULABLE.includes(appointment.status);
  const canCancel = OWNER_CANCELLABLE.includes(appointment.status);
  const needsPayment = appointment.status === 'awaiting_payment';
  const hasRescheduleOffer = appointment.status === 'reschedule_offered';
  const isCompleted = appointment.status === 'completed';
  const visitTotalCents = visitChargesTotalCents(appointment);
  const billingPending = appointment.billingStatus === 'ready' && visitTotalCents > 0;
  const billingPaid = appointment.billingStatus === 'paid' && visitTotalCents > 0;

  return (
    <PetOwnerShell>
      <Link href="/dashboard/pet-owner/appointments" className="text-sm font-medium text-[#ec6d13]">
        ← My appointments
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-gray-900">Appointment Details</h1>
        <AppointmentStatusBadge status={appointment.status} />
      </div>

      <div className="mt-6 space-y-6">
        {appointment.confirmationMessage ? (
          <ConfirmationBanner message={appointment.confirmationMessage} />
        ) : null}

        <DetailsCard appointment={appointment} />

        {hasConsultationRecord && appointment.petId ? (
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm">
            <p className="font-semibold text-blue-900">Consultation record</p>
            <p className="mt-1 text-blue-800">
              Your veterinarian saved visit notes for this appointment.
            </p>
            <Link
              href={`/dashboard/pet-owner/medical-records/${appointment.petId}`}
              className="mt-2 inline-block font-semibold text-[#ec6d13] hover:underline"
            >
              View in pet health records →
            </Link>
          </div>
        ) : null}

        {billingPending ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="font-semibold text-amber-900">Visit balance due</p>
            <VisitChargesBreakdown appointment={appointment} totalCents={visitTotalCents} />
            <p className="mt-3 text-sm text-amber-800">
              Please pay this amount at the reception desk. Your appointment will show as paid once
              reception records your payment.
            </p>
          </div>
        ) : null}

        {billingPaid ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="font-semibold text-green-900">Visit charges paid</p>
            <VisitChargesBreakdown appointment={appointment} totalCents={visitTotalCents} />
            <p className="mt-2 text-sm text-green-800">
              Thank you — this visit is fully settled. Details are also in your payment history.
            </p>
            <Link
              href="/dashboard/pet-owner/payments"
              className="mt-2 inline-block text-sm font-semibold text-[#ec6d13] hover:underline"
            >
              Payment history →
            </Link>
          </div>
        ) : null}

        {isCompleted && token ? (
          <AppointmentFeedbackForm token={token} appointmentId={appointment.id} />
        ) : null}

        {appointment.staffResponseReason ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Message from clinic</p>
            <p className="mt-1">{appointment.staffResponseReason}</p>
          </div>
        ) : null}

        {hasRescheduleOffer && appointment.proposedAppointmentDate ? (
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
            <p className="font-semibold text-purple-900">New time proposed</p>
            <p className="mt-1 text-sm text-purple-800">
              {formatAppointmentDate(appointment.proposedAppointmentDate)} at{' '}
              {formatTime(appointment.proposedAppointmentTime || '')}
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={handleAcceptReschedule}
              className="mt-3 rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
            >
              Accept new time
            </button>
          </div>
        ) : null}

        {needsPayment ? (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="font-semibold text-orange-900">Payment required to confirm</p>
            <p className="mt-1 text-sm text-orange-800">
              Your request was approved. Complete online payment{feeLabel ? ` (${feeLabel})` : ''} to
              confirm your booking.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={handlePay}
              className="mt-3 rounded-lg bg-[#ec6d13] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
            >
              {busy ? 'Redirecting…' : 'Pay & confirm booking'}
            </button>
          </div>
        ) : null}

        {showReschedule && canReschedule ? (
          <RescheduleForm
            form={rescheduleForm}
            setForm={setRescheduleForm}
            schedule={schedule}
            busy={busy}
            onSubmit={handleReschedule}
            onCancel={() => setShowReschedule(false)}
          />
        ) : null}

        {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}

        <div className="flex flex-wrap gap-3">
          {canReschedule && !showReschedule ? (
            <button
              type="button"
              onClick={() => setShowReschedule(true)}
              className="rounded-lg border border-[#ec6d13] px-4 py-2 text-sm font-semibold text-[#ec6d13] hover:bg-orange-50"
            >
              Reschedule
            </button>
          ) : null}
          {canCancel ? (
            <CancelBlock
              reason={cancelReason}
              setReason={setCancelReason}
              busy={busy}
              onCancel={handleCancel}
            />
          ) : null}
        </div>
      </div>
    </PetOwnerShell>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
    </div>
  );
}

function ConfirmationBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
      <p className="font-semibold">Confirmation</p>
      <p className="mt-1">{message}</p>
    </div>
  );
}

function DetailsCard({ appointment }: { appointment: Appointment }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase text-gray-500">Date & time</dt>
          <dd className="mt-1 font-medium text-gray-900">
            {formatAppointmentDate(appointment.appointmentDate)} at {formatTime(appointment.appointmentTime)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-gray-500">Veterinarian</dt>
          <dd className="mt-1 font-medium text-gray-900">
            {appointment.doctorName}
            {appointment.specialization ? ` · ${appointment.specialization}` : ''}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-gray-500">Pet</dt>
          <dd className="mt-1 font-medium text-gray-900">{appointment.petName || '—'}</dd>
        </div>
        <NotesField appointment={appointment} />
      </dl>
      {appointment.doctorNotes ? (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-xs font-medium uppercase text-gray-500">Clinic notes</p>
          <p className="mt-1 text-sm text-gray-700">{appointment.doctorNotes}</p>
        </div>
      ) : null}
    </div>
  );
}

function NotesField({ appointment }: { appointment: Appointment }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-gray-500">Your notes</dt>
      <dd className="mt-1 text-gray-900">{appointment.notes || '—'}</dd>
    </div>
  );
}

function RescheduleForm({
  form,
  setForm,
  schedule,
  busy,
  onSubmit,
  onCancel,
}: {
  form: { appointment_date: string; appointment_time: string };
  setForm: (f: { appointment_date: string; appointment_time: string }) => void;
  schedule: DayScheduleSlot[];
  busy: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const minDate = new Date().toISOString().slice(0, 10);
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">Reschedule</h3>
      <input
        type="date"
        required
        min={minDate}
        value={form.appointment_date}
        onChange={(e) => setForm({ ...form, appointment_date: e.target.value, appointment_time: '' })}
        className="w-full rounded-lg border border-gray-300 px-3 py-2"
      />
      <select
        required
        value={form.appointment_time}
        onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
        className="w-full rounded-lg border border-gray-300 px-3 py-2"
      >
        <option value="">Select time</option>
        {schedule.map((s) => (
          <option key={s.time} value={s.time} disabled={s.status === 'booked'}>
            {formatTime(s.time)}
            {s.status === 'booked' ? ' (Booked)' : ''}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white">
          Save
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm text-gray-600">
          Close
        </button>
      </div>
    </form>
  );
}

function VisitChargesBreakdown({
  appointment,
  totalCents,
}: {
  appointment: Appointment;
  totalCents: number;
}) {
  const lines = [
    { label: 'Consultation', cents: appointment.consultationFeeCents },
    { label: 'Vaccination', cents: appointment.vaccinationFeeCents },
    { label: 'Medicine', cents: appointment.medicineFeeCents },
  ].filter((l) => l.cents && l.cents > 0);

  return (
    <div className="mt-2 text-sm">
      {lines.length > 0 ? (
        <ul className="space-y-1 text-gray-800">
          {lines.map((l) => (
            <li key={l.label} className="flex justify-between gap-4">
              <span>{l.label}</span>
              <span className="font-medium">{formatMoney(l.cents!)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-2 flex justify-between gap-4 font-semibold text-gray-900">
        <span>Total</span>
        <span>{formatMoney(totalCents)}</span>
      </p>
    </div>
  );
}

function CancelBlock({
  reason,
  setReason,
  busy,
  onCancel,
}: {
  reason: string;
  setReason: (v: string) => void;
  busy: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <input
        type="text"
        placeholder="Cancellation reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <button
        type="button"
        disabled={busy}
        onClick={onCancel}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
      >
        Cancel appointment
      </button>
    </div>
  );
}
