'use client';

import { useEffect, useState } from 'react';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import StaffRespondModal from '@/components/appointments/StaffRespondModal';
import {
  Appointment,
  AppointmentStatus,
  assignAppointmentDoctor,
  checkInAppointment,
  fetchAppointments,
  fetchDoctors,
  formatAppointmentDate,
  formatTime,
  staffRespondToAppointment,
  updateAppointmentStatus,
} from '@/lib/appointments';
import { useAuth } from '@/context/AuthContext';

type Props = {
  title?: string;
  defaultFilter?: AppointmentStatus | 'all';
  todayOnly?: boolean;
  showCheckIn?: boolean;
};

export default function ManageAppointmentsPanel({
  title = 'Appointment requests',
  defaultFilter = 'pending',
  todayOnly = false,
  showCheckIn = false,
}: Props) {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<{ id: number; name: string }[]>([]);
  const [assignDoctor, setAssignDoctor] = useState<Record<number, string>>({});
  const [filter, setFilter] = useState<AppointmentStatus | 'all'>(defaultFilter);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [modal, setModal] = useState<{
    id: number;
    doctorId: number;
    action: 'reject' | 'reschedule';
  } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchDoctors().then((res) => {
      if (res.ok) setDoctors(res.data.map((d) => ({ id: d.id, name: d.name })));
    });
  }, []);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    const listRes = await fetchAppointments(
      token,
      filter === 'all' ? undefined : (filter as AppointmentStatus)
    );
    if (!listRes.ok) {
      setError((listRes.data as { error?: string }).error || 'Failed to load');
      setAppointments([]);
    } else {
      let list = listRes.data;
      if (todayOnly) {
        const today = new Date().toISOString().slice(0, 10);
        list = list.filter((a) => a.appointmentDate?.slice(0, 10) === today);
      }
      setAppointments(list);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [token, filter, todayOnly]);

  const approve = async (id: number, currentDoctorId: number) => {
    if (!token) return;
    setBusy(true);
    const doctorId = assignDoctor[id] ? Number(assignDoctor[id]) : currentDoctorId;
    const res = await staffRespondToAppointment(token, id, {
      action: 'approve',
      doctor_notes: notes[id] || undefined,
      doctor_id: doctorId,
    });
    setBusy(false);
    if (!res.ok) alert((res.data as { error?: string }).error || 'Update failed');
    else load();
  };

  const reassignDoctor = async (id: number) => {
    const doctorId = Number(assignDoctor[id]);
    if (!token || !doctorId) return alert('Select a veterinarian');
    setBusy(true);
    const res = await assignAppointmentDoctor(token, id, doctorId);
    setBusy(false);
    if (!res.ok) alert((res.data as { error?: string }).error || 'Failed');
    else load();
  };

  const checkIn = async (id: number) => {
    if (!token) return;
    setBusy(true);
    const res = await checkInAppointment(token, id);
    setBusy(false);
    if (!res.ok) alert((res.data as { error?: string }).error || 'Check-in failed');
    else load();
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
    if (!res.ok) alert((res.data as { error?: string }).error || 'Update failed');
    else {
      setModal(null);
      load();
    }
  };

  const complete = async (id: number) => {
    if (!token) return;
    const res = await updateAppointmentStatus(token, id, { status: 'completed' });
    if (!res.ok) alert((res.data as { error?: string }).error || 'Update failed');
    else load();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-gray-900">{title}</h1>
        <p className="text-sm text-gray-600">
          Confirm availability, assign veterinarians, check in patients, update status
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(['pending', 'awaiting_payment', 'approved', 'reschedule_offered', 'completed', 'all'] as const).map(
          (key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold capitalize ${
                filter === key ? 'bg-[#ec6d13] text-white' : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {key.replace(/_/g, ' ')}
            </button>
          )
        )}
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : appointments.length === 0 ? (
        <p className="text-gray-600">No appointments in this view.</p>
      ) : (
        <ul className="space-y-4">
          {appointments.map((apt) => (
            <li key={apt.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {apt.petName || 'Pet'} — {apt.ownerName || apt.ownerEmail}
                  </p>
                  <p className="text-sm text-gray-600">
                    Dr. {apt.doctorName} · {formatAppointmentDate(apt.appointmentDate)} at{' '}
                    {formatTime(apt.appointmentTime)}
                  </p>
                  <AppointmentStatusBadge status={apt.status} className="mt-2" />
                  {apt.checkedInAt ? (
                    <p className="mt-1 text-xs font-semibold text-green-700">Checked in</p>
                  ) : null}
                  {apt.staffResponseReason ? (
                    <p className="mt-2 text-sm text-amber-800">Note: {apt.staffResponseReason}</p>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="text-xs font-medium text-gray-600">Veterinarian</label>
                <select
                  value={assignDoctor[apt.id] || String(apt.doctorId)}
                  onChange={(e) => setAssignDoctor((m) => ({ ...m, [apt.id]: e.target.value }))}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {apt.status !== 'pending' ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => reassignDoctor(apt.id)}
                    className="text-xs font-semibold text-[#ec6d13]"
                  >
                    Reassign
                  </button>
                ) : null}
              </div>

              <textarea
                placeholder="Internal notes (optional)"
                value={notes[apt.id] || ''}
                onChange={(e) => setNotes((n) => ({ ...n, [apt.id]: e.target.value }))}
                className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                rows={2}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {apt.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => approve(apt.id, apt.doctorId)}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        setModal({ id: apt.id, doctorId: apt.doctorId, action: 'reject' })
                      }
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        setModal({ id: apt.id, doctorId: apt.doctorId, action: 'reschedule' })
                      }
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700"
                    >
                      Reschedule
                    </button>
                  </>
                )}
                {(showCheckIn || apt.status === 'approved') && apt.status === 'approved' && !apt.checkedInAt ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => checkIn(apt.id)}
                    className="rounded-lg bg-[#ec6d13] px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    Check in patient
                  </button>
                ) : null}
                {apt.status === 'approved' && (
                  <button
                    type="button"
                    onClick={() => complete(apt.id)}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    Mark completed
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal ? (
        <StaffRespondModal
          action={modal.action}
          doctorId={modal.doctorId}
          onClose={() => setModal(null)}
          onSubmit={submitModal}
          busy={busy}
        />
      ) : null}
    </div>
  );
}
