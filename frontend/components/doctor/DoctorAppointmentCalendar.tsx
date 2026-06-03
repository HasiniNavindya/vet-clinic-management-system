'use client';

import { useMemo, useState } from 'react';
import DoctorVisitCard from '@/components/doctor/DoctorVisitCard';
import {
  Appointment,
  formatAppointmentDate,
  formatTime,
} from '@/lib/appointments';

function dateKeyFromAppointment(appt: Appointment): string {
  return String(appt.appointmentDate || '').slice(0, 10);
}

type Props = {
  appointments: Appointment[];
};

export default function DoctorAppointmentCalendar({ appointments }: Props) {
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  const sorted = useMemo(
    () =>
      [...appointments].sort((a, b) => {
        const da = `${a.appointmentDate}T${a.appointmentTime}`;
        const db = `${b.appointmentDate}T${b.appointmentTime}`;
        return da.localeCompare(db);
      }),
    [appointments]
  );

  const dayKeys = useMemo(
    () => new Set(sorted.map((a) => dateKeyFromAppointment(a)).filter(Boolean)),
    [sorted]
  );

  const selectedDayAppointments = useMemo(
    () => sorted.filter((a) => dateKeyFromAppointment(a) === selectedDateKey),
    [sorted, selectedDateKey]
  );

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-sans text-base font-semibold text-gray-900">{monthName}</p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setMonthDate(new Date(year, month - 1, 1))}
              className="rounded-lg px-2.5 py-1 text-sm text-gray-600 hover:bg-gray-100"
              aria-label="Previous month"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setMonthDate(new Date())}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-[#ec6d13] hover:bg-orange-50"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setMonthDate(new Date(year, month + 1, 1))}
              className="rounded-lg px-2.5 py-1 text-sm text-gray-600 hover:bg-gray-100"
              aria-label="Next month"
            >
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-gray-500">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, idx) => (
            <div key={`empty-${idx}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasAppointment = dayKeys.has(dateKey);
            const isSelected = selectedDateKey === dateKey;
            const isToday = dateKey === new Date().toISOString().slice(0, 10);
            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => setSelectedDateKey(dateKey)}
                className={`relative rounded-lg py-2 text-xs font-medium transition ${
                  isSelected
                    ? 'bg-[#ec6d13] text-white'
                    : isToday
                      ? 'bg-orange-50 text-[#ec6d13]'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {day}
                {hasAppointment ? (
                  <span
                    className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-[#ec6d13]'
                    }`}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="font-sans text-base font-semibold text-gray-900">
          {new Date(`${selectedDateKey}T12:00:00`).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        {selectedDayAppointments.length === 0 ? (
          <p className="mt-4 font-sans text-sm text-gray-500">No visits on this day.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {selectedDayAppointments.map((appt) => (
              <li key={appt.id}>
                <DoctorVisitCard appointment={appt} compact />
              </li>
            ))}
          </ul>
        )}

        {sorted.length > 0 ? (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-gray-500">
              All visits ({sorted.length})
            </p>
            <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto">
              {sorted.slice(0, 12).map((appt) => (
                <li key={`all-${appt.id}`} className="text-xs text-gray-600">
                  <span className="font-medium text-gray-800">
                    {formatAppointmentDate(appt.appointmentDate)}
                  </span>
                  {' · '}
                  {formatTime(appt.appointmentTime)} · {appt.petName || 'Pet'}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
