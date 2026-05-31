'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import StaffRespondModal from '@/components/appointments/StaffRespondModal';
import {
  Appointment,
  AppointmentStatus,
  fetchAppointments,
  formatAppointmentDate,
  formatTime,
  staffRespondToAppointment,
} from '@/lib/appointments';
import { useAuth } from '@/context/AuthContext';

export default function ManageAppointmentsPage() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<AppointmentStatus | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [modal, setModal] = useState<{
    id: number;
    doctorId: number;
    action: 'reject' | 'reschedule';
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    const listRes = await fetchAppointments(
      token,
      filter === 'all' ? undefined : (filter as AppointmentStatus)
    );
    if (!listRes.ok) {
      setError((listRes.data as { error?: string }).error || 'Failed to load');
    } else {
      setAppointments(listRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [token, filter]);

  const approve = async (id: number) => {
    if (!token) return;
    setBusy(true);
    const res = await staffRespondToAppointment(token, id, {
      action: 'approve',
      doctor_notes: notes[id] || undefined,
    });
    setBusy(false);
    if (!res.ok) {
      alert((res.data as { error?: string }).error || 'Update failed');
      return;
    }
    load();
  };

  const submitModal = async (data: {
    reason: string;
    appointment_date?: string;
    appointment_time?: string;
  }) => {
    if (!token || !modal) return;
    setBusy(true);
    const res = await staffRespondToAppointment(token, modal.id, {
      action: modal.action,
      reason: data.reason,
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time,
      doctor_notes: notes[modal.id] || undefined,
    });
    setBusy(false);
    if (!res.ok) {
      alert((res.data as { error?: string }).error || 'Update failed');
      return;
    }
    setModal(null);
    load();
  };

  const complete = async (id: number) => {
    if (!token) return;
    const { updateAppointmentStatus } = await import('@/lib/appointments');
    const res = await updateAppointmentStatus(token, id, { status: 'completed' });
    if (!res.ok) alert((res.data as { error?: string }).error || 'Update failed');
    else load();
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto max-w-5xl px-4 py-8 pt-28">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-gray-900">Manage appointment requests</h1>
              <p className="text-gray-600">
                Approve (owner pays to confirm), decline with reason, or offer a new date and time
              </p>
            </div>
            <Link href="/dashboard/calendar" className="text-sm font-semibold text-[#ec6d13]">
              Calendar view →
            </Link>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {(['pending', 'awaiting_payment', 'reschedule_offered', 'approved', 'all'] as const).map(
              (key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                    filter === key ? 'bg-[#ec6d13] text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200'
                  }`}
                >
                  {key === 'all' ? 'All' : key.replace(/_/g, ' ')}
                </button>
              )
            )}
          </div>

          {error ? <p className="mb-4 text-red-600">{error}</p> : null}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
            </div>
          ) : appointments.length === 0 ? (
            <p className="rounded-xl bg-white p-8 text-center text-gray-600">No appointments in this queue.</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatAppointmentDate(apt.appointmentDate)} · {formatTime(apt.appointmentTime)}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {apt.ownerName} ({apt.ownerEmail}) · Dr. {apt.doctorName}
                        {apt.petName ? ` · ${apt.petName}` : ''}
                      </p>
                    </div>
                    <AppointmentStatusBadge status={apt.status} />
                  </div>
                  {apt.notes ? <p className="mt-2 text-sm text-gray-600">Owner notes: {apt.notes}</p> : null}
                  {apt.staffResponseReason ? (
                    <p className="mt-2 text-sm text-amber-800">Clinic note: {apt.staffResponseReason}</p>
                  ) : null}
                  {apt.proposedAppointmentDate ? (
                    <p className="mt-1 text-sm text-purple-800">
                      Proposed: {apt.proposedAppointmentDate} {apt.proposedAppointmentTime}
                    </p>
                  ) : null}
                  <textarea
                    className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Clinic / doctor notes (optional)"
                    value={notes[apt.id] || ''}
                    onChange={(e) => setNotes((n) => ({ ...n, [apt.id]: e.target.value }))}
                    rows={2}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {apt.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => approve(apt.id)}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white"
                        >
                          Approve (awaiting payment)
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setModal({ id: apt.id, doctorId: apt.doctorId, action: 'reject' })}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            setModal({ id: apt.id, doctorId: apt.doctorId, action: 'reschedule' })
                          }
                          className="rounded-lg border border-[#ec6d13] px-3 py-1.5 text-sm font-semibold text-[#ec6d13]"
                        >
                          Reschedule
                        </button>
                      </>
                    ) : null}
                    {apt.status === 'approved' ? (
                      <button
                        type="button"
                        onClick={() => complete(apt.id)}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white"
                      >
                        Mark completed
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {token && modal ? (
          <StaffRespondModal
            open
            action={modal.action}
            doctorId={modal.doctorId}
            token={token}
            busy={busy}
            onClose={() => setModal(null)}
            onSubmit={submitModal}
          />
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
