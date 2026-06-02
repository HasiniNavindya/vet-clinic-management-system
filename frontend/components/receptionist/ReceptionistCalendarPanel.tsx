'use client';

import { useCallback, useEffect, useState } from 'react';
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge';
import { useAuth } from '@/context/AuthContext';
import { Appointment, fetchAppointments, formatTime } from '@/lib/appointments';

export default function ReceptionistCalendarPanel() {
  const { token } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await fetchAppointments(token);
    if (res.ok) setAppointments(res.data);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const apptsOnDay = (d: number) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return appointments.filter((a) => String(a.appointmentDate || '').slice(0, 10) === key);
  };

  const selectedKey = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    : '';
  const selectedAppts = appointments.filter(
    (a) => String(a.appointmentDate || '').slice(0, 10) === selectedKey
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="rounded-lg px-2 py-1 text-gray-600 hover:bg-gray-100"
            >
              ‹
            </button>
            <h2 className="font-bold text-gray-900">
              {monthNames[month]} {year}
            </h2>
            <button
              type="button"
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="rounded-lg px-2 py-1 text-gray-600 hover:bg-gray-100"
            >
              ›
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`e-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const count = apptsOnDay(day).length;
                  const isSelected =
                    selectedDate &&
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === month &&
                    selectedDate.getFullYear() === year;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDate(new Date(year, month, day))}
                      className={`relative rounded-lg py-2 text-sm ${
                        isSelected ? 'bg-[#ec6d13] text-white' : 'hover:bg-gray-100'
                      }`}
                    >
                      {day}
                      {count > 0 ? (
                        <span
                          className={`absolute bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-[#ec6d13]'
                          }`}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-gray-900">
            {selectedDate
              ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
              : 'Select a day'}
          </h3>
          {selectedAppts.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No appointments on this day.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {selectedAppts.map((a) => (
                <li key={a.id} className="rounded-lg border border-gray-100 p-4">
                  <p className="font-medium text-gray-900">
                    {formatTime(a.appointmentTime)} — {a.petName || 'Pet'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {a.ownerName} · Dr. {a.doctorName}
                  </p>
                  <AppointmentStatusBadge status={a.status} className="mt-2" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
  );
}
