'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import DoctorBookingCalendar from '@/components/appointments/DoctorBookingCalendar';
import DoctorAvatar from '@/components/doctor/DoctorAvatar';
import { useAuth } from '@/context/AuthContext';
import {
  CLINIC_HOURS_LABEL,
  DoctorProfile,
  fetchDoctorProfile,
  formatAvailableDays,
} from '@/lib/doctors';
import {
  Appointment,
  fetchAppointments,
  formatAppointmentDate,
  formatTime,
} from '@/lib/appointments';

type ApptFilter = 'all' | 'upcoming' | 'pending';

export default function ReceptionistVeterinarianDetail() {
  const params = useParams();
  const doctorId = Number(params.id);
  const { token } = useAuth();

  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptLoading, setApptLoading] = useState(true);
  const [apptFilter, setApptFilter] = useState<ApptFilter>('upcoming');

  const [checkDate, setCheckDate] = useState('');
  const [checkTime, setCheckTime] = useState('');

  useEffect(() => {
    if (!Number.isFinite(doctorId)) {
      setError('Invalid veterinarian');
      setLoading(false);
      return;
    }
    fetchDoctorProfile(doctorId).then((res) => {
      if (!res.ok) setError((res.data as { error?: string }).error || 'Veterinarian not found');
      else setDoctor(res.data);
      setLoading(false);
    });
  }, [doctorId]);

  useEffect(() => {
    if (!token || !Number.isFinite(doctorId)) return;
    setApptLoading(true);
    fetchAppointments(token, { doctorId })
      .then((res) => {
        if (res.ok) setAppointments(res.data);
      })
      .finally(() => setApptLoading(false));
  }, [token, doctorId]);

  const filteredAppointments = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return appointments.filter((a) => {
      if (apptFilter === 'pending') {
        return ['pending', 'awaiting_payment', 'reschedule_offered'].includes(a.status);
      }
      if (apptFilter === 'upcoming') {
        const d = String(a.appointmentDate || '').slice(0, 10);
        return (
          d >= today &&
          !['cancelled', 'rejected', 'completed'].includes(a.status)
        );
      }
      return true;
    });
  }, [appointments, apptFilter]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div>
        <Link
          href="/dashboard/receptionist/doctors"
          className="text-sm font-semibold text-[#ec6d13] hover:text-[#d65e0f]"
        >
          ← All veterinarians
        </Link>
        <p className="mt-6 text-red-600">{error || 'Veterinarian not found'}</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard/receptionist/doctors"
        className="text-sm font-semibold text-[#ec6d13] hover:text-[#d65e0f]"
      >
        ← All veterinarians
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,300px)_1fr]">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="aspect-[4/5] bg-gray-100">
            <DoctorAvatar
              name={doctor.name}
              imageUrl={doctor.imageUrl}
              className="h-full w-full"
              textClassName="text-5xl"
            />
          </div>
          <div className="p-5">
            <h1 className="font-sans text-xl font-semibold text-gray-900">{doctor.name}</h1>
            <p className="mt-1 font-semibold text-[#ec6d13]">{doctor.specialization}</p>
            {(doctor.email || doctor.phone) && (
              <ul className="mt-4 space-y-1 text-sm text-gray-600">
                {doctor.email ? <li>{doctor.email}</li> : null}
                {doctor.phone ? <li>{doctor.phone}</li> : null}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {doctor.bio ? (
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">About</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{doctor.bio}</p>
            </section>
          ) : null}

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="font-sans text-base font-semibold text-gray-900">Weekly schedule</h2>
            <dl className="mt-3 space-y-2 text-sm text-gray-700">
              <div>
                <dt className="font-semibold text-gray-900">Consultation days</dt>
                <dd>{formatAvailableDays(doctor.availableDays)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Clinic hours</dt>
                <dd>{CLINIC_HOURS_LABEL}</dd>
              </div>
            </dl>
          </section>

          {token ? (
            <section className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5 shadow-sm">
              <h2 className="font-sans text-base font-semibold text-gray-900">
                Check availability
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Pick a date and time slot to see if this veterinarian is free before confirming
                or rescheduling an appointment.
              </p>
              <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4">
                <DoctorBookingCalendar
                  token={token}
                  doctorId={doctor.id}
                  selectedDate={checkDate}
                  selectedTime={checkTime}
                  onSelectDate={(d) => {
                    setCheckDate(d);
                    setCheckTime('');
                  }}
                  onSelectTime={setCheckTime}
                />
              </div>
              {checkDate && checkTime ? (
                <p className="mt-3 text-sm font-medium text-green-800">
                  Selected slot: {formatAppointmentDate(checkDate)} at {formatTime(checkTime)} —
                  use Manage appointments to book or adjust visits.
                </p>
              ) : null}
            </section>
          ) : null}

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-sans text-base font-semibold text-gray-900">
                  Appointments
                </h2>
                <p className="mt-0.5 text-sm text-gray-600">
                  Visits assigned to {doctor.name.split(' ')[0]}
                </p>
              </div>
              <Link
                href="/dashboard/receptionist/appointments/manage"
                className="rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f]"
              >
                Manage appointments
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(
                [
                  ['upcoming', 'Upcoming'],
                  ['pending', 'Needs action'],
                  ['all', 'All'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setApptFilter(id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    apptFilter === id
                      ? 'bg-[#ec6d13] text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {apptLoading ? (
              <div className="mt-6 flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
              </div>
            ) : filteredAppointments.length === 0 ? (
              <p className="mt-6 text-sm text-gray-500">No appointments in this view.</p>
            ) : (
              <ul className="mt-4 max-h-[420px] space-y-2 overflow-y-auto">
                {filteredAppointments.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-xl border border-gray-100 px-4 py-3 text-sm hover:bg-gray-50"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-gray-900">
                        {a.petName || 'Pet'} · {a.ownerName || 'Owner'}
                      </span>
                      <AppointmentStatusBadge status={a.status} />
                    </div>
                    <p className="mt-1 text-gray-600">
                      {formatAppointmentDate(a.appointmentDate)} · {formatTime(a.appointmentTime)}
                    </p>
                    {a.notes ? (
                      <p className="mt-1 text-xs text-gray-500 line-clamp-1">{a.notes}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
