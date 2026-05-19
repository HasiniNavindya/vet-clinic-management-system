'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import {
  Appointment,
  AppointmentStatus,
  fetchAppointments,
  formatAppointmentDate,
  formatTime,
  updateAppointmentStatus,
} from '@/lib/appointments';
import { useAuth } from '@/context/AuthContext';

export default function ManageAppointmentsPage() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<AppointmentStatus | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState<Record<number, string>>({});

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

  const setStatus = async (id: number, status: AppointmentStatus) => {
    if (!token) return;
    const res = await updateAppointmentStatus(token, id, {
      status,
      doctor_notes: notes[id] || undefined,
    });
    if (!res.ok) {
      alert((res.data as { error?: string }).error || 'Update failed');
      return;
    }
    load();
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'doctor', 'staff']}>
      <MotionPage>
        <Header />
        <div className="container mx-auto max-w-5xl px-4 py-8 pt-28">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Appointments</h1>
              <p className="text-gray-600">Approve, reject, or mark visits complete (FR-13)</p>
            </div>
            <Link href="/dashboard/calendar" className="text-sm font-semibold text-[#ec6d13]">
              Calendar view →
            </Link>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {(['pending', 'approved', 'all'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  filter === key ? 'bg-[#ec6d13] text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200'
                }`}
              >
                {key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>

          {error ? <p className="mb-4 text-red-600">{error}</p> : null}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
            </div>
          ) : appointments.length === 0 ? (
            <p className="rounded-xl bg-white p-8 text-center text-gray-600">No appointments in this queue.</p>
          ) : (
            <MotionList
              appointments={appointments}
              notes={notes}
              setNotes={setNotes}
              onApprove={(id) => setStatus(id, 'approved')}
              onReject={(id) => setStatus(id, 'rejected')}
              onComplete={(id) => setStatus(id, 'completed')}
            />
          )}
        </div>
      </MotionPage>
    </ProtectedRoute>
  );
}

function MotionPage({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}

function MotionList({
  appointments,
  notes,
  setNotes,
  onApprove,
  onReject,
  onComplete,
}: {
  appointments: Appointment[];
  notes: Record<number, string>;
  setNotes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onComplete: (id: number) => void;
}) {
  return (
    <div className="space-y-4">
      {appointments.map((apt) => (
        <div key={apt.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <MotionCardHeader apt={apt} />
          {apt.notes ? <p className="mt-2 text-sm text-gray-600">Owner notes: {apt.notes}</p> : null}
          <textarea
            className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="Clinic / doctor notes"
            value={notes[apt.id] || ''}
            onChange={(e) => setNotes((n) => ({ ...n, [apt.id]: e.target.value }))}
            rows={2}
          />
          <MotionCardActions
            apt={apt}
            onApprove={() => onApprove(apt.id)}
            onReject={() => onReject(apt.id)}
            onComplete={() => onComplete(apt.id)}
          />
        </div>
      ))}
    </div>
  );
}

function MotionCardHeader({ apt }: { apt: Appointment }) {
  return (
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
  );
}

function MotionCardActions({
  apt,
  onApprove,
  onReject,
  onComplete,
}: {
  apt: Appointment;
  onApprove: () => void;
  onReject: () => void;
  onComplete: () => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {apt.status === 'pending' ? (
        <>
          <button type="button" onClick={onApprove} className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white">
            Approve
          </button>
          <button type="button" onClick={onReject} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white">
            Reject
          </button>
        </>
      ) : null}
      {apt.status === 'approved' ? (
        <button type="button" onClick={onComplete} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white">
          Mark completed
        </button>
      ) : null}
    </div>
  );
}
