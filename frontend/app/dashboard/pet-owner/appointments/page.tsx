'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import {
  Appointment,
  AppointmentStatus,
  fetchAppointments,
  fetchAppointmentMeta,
  formatAppointmentDate,
  formatTime,
  StatusMeta,
} from '@/lib/appointments';

export default function MyAppointmentsPage() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statuses, setStatuses] = useState<StatusMeta[]>([]);
  const [filter, setFilter] = useState<AppointmentStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    const [listRes, metaRes] = await Promise.all([
      fetchAppointments(token, filter || undefined),
      fetchAppointmentMeta(token),
    ]);
    if (!listRes.ok) {
      setError((listRes.data as { error?: string }).error || 'Failed to load appointments');
    } else {
      setAppointments(listRes.data);
    }
    if (metaRes.ok) setStatuses(metaRes.data.statuses);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [token, filter]);

  return (
    <PetOwnerShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">My Appointments</h1>
          <p className="mt-1 text-gray-600">View status, reschedule, or cancel</p>
        </div>
        <Link
          href="/dashboard/pet-owner/appointments/book"
          className="inline-flex items-center justify-center rounded-lg bg-[#ec6d13] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d65e0f]"
        >
          New Appointment
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter('')}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            filter === '' ? 'bg-[#ec6d13] text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200'
          }`}
        >
          All
        </button>
        {statuses.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setFilter(s.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              filter === s.id ? 'bg-[#ec6d13] text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
          <p className="text-gray-600">No appointments found.</p>
          <Link href="/dashboard/pet-owner/appointments/book" className="mt-4 inline-block text-[#ec6d13] font-semibold">
            New appointment →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <Link
              key={apt.id}
              href={`/dashboard/pet-owner/appointments/${apt.id}`}
              className="block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {formatAppointmentDate(apt.appointmentDate)} · {formatTime(apt.appointmentTime)}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Dr. {apt.doctorName}
                    {apt.petName ? ` · ${apt.petName}` : ''}
                  </p>
                </div>
                <AppointmentStatusBadge status={apt.status} />
              </div>
              {apt.confirmationMessage ? (
                <p className="mt-3 text-sm text-gray-600 line-clamp-2">{apt.confirmationMessage}</p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </PetOwnerShell>
  );
}
