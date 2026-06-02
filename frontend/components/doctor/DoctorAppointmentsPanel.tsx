'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import {
  Appointment,
  fetchAppointments,
  formatAppointmentDate,
  formatTime,
} from '@/lib/appointments';
import { useAuth } from '@/context/AuthContext';

export default function DoctorAppointmentsPanel() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchAppointments(token).then((res) => {
      if (res.ok) setAppointments(res.data);
      setLoading(false);
    });
  }, [token]);

  return (
    <div>
      <h1 className="text-gray-900">My assigned appointments</h1>
      <p className="mt-1 text-sm text-gray-600">
        View-only schedule assigned by reception. Use Consultation to record visit notes.
      </p>

      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : appointments.length === 0 ? (
        <p className="mt-6 text-gray-500">No appointments assigned to you.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {appointments.map((apt) => (
            <li key={apt.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="font-semibold text-gray-900">
                {apt.petName || 'Pet'} — {apt.ownerName}
              </p>
              <p className="text-sm text-gray-600">
                {formatAppointmentDate(apt.appointmentDate)} at {formatTime(apt.appointmentTime)}
              </p>
              <AppointmentStatusBadge status={apt.status} className="mt-2" />
              {apt.checkedInAt ? (
                <p className="mt-2 text-xs font-semibold text-green-700">Checked in</p>
              ) : null}
              {apt.serviceFeeCents ? (
                <p className="mt-1 text-xs text-gray-600">
                  Service fee due: ${(apt.serviceFeeCents / 100).toFixed(2)}
                </p>
              ) : null}
              {apt.status === 'approved' && apt.petId ? (
                <Link
                  href={`/dashboard/doctor/consultation?petId=${apt.petId}&appointmentId=${apt.id}`}
                  className="mt-3 inline-block text-sm font-semibold text-[#ec6d13]"
                >
                  Open consultation →
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
