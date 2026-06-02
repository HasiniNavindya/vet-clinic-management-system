'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
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

type FilterKey = AppointmentStatus | 'all';

const FILTER_LABELS: Record<FilterKey, string> = {
  pending: 'Pending',
  awaiting_payment: 'Awaiting payment',
  approved: 'Confirmed',
  reschedule_offered: 'Reschedule',
  completed: 'Completed',
  all: 'All',
  rejected: 'Declined',
  cancelled: 'Cancelled',
};

type RouteConfig = {
  defaultFilter: FilterKey;
  todayOnly: boolean;
  showCheckIn: boolean;
  filters: FilterKey[];
};

function configForPath(pathname: string): RouteConfig {
  if (pathname.includes('/appointments/manage')) {
    return {
      defaultFilter: 'pending',
      todayOnly: false,
      showCheckIn: false,
      filters: ['pending', 'awaiting_payment', 'reschedule_offered', 'all'],
    };
  }
  if (pathname.includes('/appointments/queue')) {
    return {
      defaultFilter: 'approved',
      todayOnly: true,
      showCheckIn: true,
      filters: [],
    };
  }
  if (pathname.includes('/appointments/today')) {
    return {
      defaultFilter: 'approved',
      todayOnly: true,
      showCheckIn: false,
      filters: ['approved', 'awaiting_payment', 'completed', 'all'],
    };
  }
  return {
    defaultFilter: 'all',
    todayOnly: false,
    showCheckIn: false,
    filters: ['pending', 'awaiting_payment', 'approved', 'reschedule_offered', 'completed', 'all'],
  };
}

export default function ManageAppointmentsPanel() {
  const pathname = usePathname();
  const route = useMemo(() => configForPath(pathname), [pathname]);
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<{ id: number; name: string }[]>([]);
  const [assignDoctor, setAssignDoctor] = useState<Record<number, string>>({});
  const [filter, setFilter] = useState<FilterKey>(route.defaultFilter);
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
    setFilter(route.defaultFilter);
  }, [route.defaultFilter]);

  useEffect(() => {
    fetchDoctors().then((res) => {
      if (res.ok) setDoctors(res.data.map((d) => ({ id: d.id, name: d.name })));
    });
  }, []);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    const listRes = await fetchAppointments(
      token,
      filter === 'all' ? undefined : (filter as AppointmentStatus)
    );
    if (!listRes.ok) {
      setError((listRes.data as { error?: string }).error || 'Failed to load');
      setAppointments([]);
    } else {
      let list = listRes.data;
      if (route.todayOnly) {
        const today = new Date().toISOString().slice(0, 10);
        list = list.filter((a) => String(a.appointmentDate || '').slice(0, 10) === today);
      }
      setAppointments(list);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [token, filter, route.todayOnly]);

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
      {route.filters.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {route.filters.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === key
                  ? 'bg-[#ec6d13] text-white'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
              }`}
            >
              {FILTER_LABELS[key]}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-500">
            {loading ? 'Loading…' : `${appointments.length} shown`}
          </span>
        </div>
      ) : (
        <p className="mb-4 text-xs text-gray-500">
          {loading ? 'Loading…' : `${appointments.length} appointment(s) today`}
        </p>
      )}

      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center text-sm text-gray-500">
          No appointments match this view.
        </div>
      ) : (
        <ul className="space-y-3">
          {appointments.map((apt) => (
            <li
              key={apt.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">
                    {apt.petName || 'Pet'} · {apt.ownerName || apt.ownerEmail}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-600">
                    {formatAppointmentDate(apt.appointmentDate)} · {formatTime(apt.appointmentTime)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <AppointmentStatusBadge status={apt.status} />
                  {apt.checkedInAt ? (
                    <span className="text-xs font-medium text-green-700">Checked in</span>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-gray-500">Vet:</span>
                <select
                  value={assignDoctor[apt.id] || String(apt.doctorId || '')}
                  onChange={(e) => setAssignDoctor((m) => ({ ...m, [apt.id]: e.target.value }))}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {apt.status !== 'pending' && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => reassignDoctor(apt.id)}
                    className="text-xs font-semibold text-[#ec6d13] hover:underline disabled:opacity-50"
                  >
                    Save vet
                  </button>
                )}
              </div>

              {apt.staffResponseReason ? (
                <p className="mt-2 text-xs text-amber-800">{apt.staffResponseReason}</p>
              ) : null}

              {(apt.status === 'pending' || apt.status === 'approved') && (
                <input
                  type="text"
                  placeholder="Internal note (optional)"
                  value={notes[apt.id] || ''}
                  onChange={(e) => setNotes((n) => ({ ...n, [apt.id]: e.target.value }))}
                  className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              )}

              <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                {apt.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => approve(apt.id, apt.doctorId)}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        setModal({ id: apt.id, doctorId: apt.doctorId, action: 'reject' })
                      }
                      className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-600 ring-1 ring-red-200 hover:bg-red-50 disabled:opacity-50"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        setModal({ id: apt.id, doctorId: apt.doctorId, action: 'reschedule' })
                      }
                      className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Reschedule
                    </button>
                  </>
                )}
                {route.showCheckIn && apt.status === 'approved' && !apt.checkedInAt && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => checkIn(apt.id)}
                    className="rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Check in
                  </button>
                )}
                {apt.status === 'approved' && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => complete(apt.id)}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
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
