'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchDoctorAvailability, fetchDoctorMonthCalendar, formatTime } from '@/lib/appointments';

type Props = {
  token: string;
  doctorId: number;
  selectedDate: string;
  selectedTime: string;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
};

export default function DoctorBookingCalendar({
  token,
  doctorId,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
}: Props) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [dates, setDates] = useState<Record<string, { availableCount: number; hasSlots: boolean }>>({});
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!doctorId) return;
    setLoadingMonth(true);
    fetchDoctorMonthCalendar(token, doctorId, month).then((res) => {
      if (res.ok) setDates(res.data.dates);
      setLoadingMonth(false);
    });
  }, [token, doctorId, month]);

  useEffect(() => {
    if (!doctorId || !selectedDate) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    fetchDoctorAvailability(token, doctorId, selectedDate).then((res) => {
      if (res.ok) setSlots(res.data.slots);
      else setSlots([]);
      setLoadingSlots(false);
    });
  }, [token, doctorId, selectedDate]);

  const calendarDays = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const last = new Date(y, m, 0);
    const startPad = first.getDay() === 0 ? 6 : first.getDay() - 1;
    const days: (string | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    return days;
  }, [month]);

  const monthLabel = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [month]);

  const shiftMonth = (delta: number) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{monthLabel}</h3>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="rounded-lg p-2 hover:bg-gray-100"
              aria-label="Previous month"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="rounded-lg p-2 hover:bg-gray-100"
              aria-label="Next month"
            >
              ›
            </button>
          </div>
        </div>
        {loadingMonth ? (
          <p className="py-8 text-center text-sm text-gray-500">Loading calendar…</p>
        ) : (
          <>
            <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-gray-500">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dateStr, i) => {
                if (!dateStr) return <div key={`e-${i}`} className="h-9" />;
                const info = dates[dateStr];
                const hasSlots = info?.hasSlots;
                const isPast = dateStr < today;
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={isPast || !hasSlots}
                    onClick={() => {
                      onSelectDate(dateStr);
                      onSelectTime('');
                    }}
                    className={`h-9 rounded-lg text-sm font-medium transition ${
                      isSelected
                        ? 'bg-[#ec6d13] text-white'
                        : isPast || !hasSlots
                          ? 'cursor-not-allowed text-gray-300'
                          : hasSlots
                            ? 'bg-green-50 text-green-800 hover:bg-green-100'
                            : 'text-gray-400'
                    }`}
                    title={
                      hasSlots
                        ? `${info?.availableCount ?? 0} slots available`
                        : isPast
                          ? 'Past date'
                          : 'No availability'
                    }
                  >
                    {Number(dateStr.slice(8, 10))}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Green days have open slots. Select a date to see times.
            </p>
          </>
        )}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="mb-3 font-semibold text-gray-900">Available times</h3>
        {!selectedDate ? (
          <p className="text-sm text-gray-500">Select a date on the calendar</p>
        ) : loadingSlots ? (
          <p className="text-sm text-gray-500">Loading times…</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-amber-700">No slots available for this day</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => onSelectTime(slot)}
                className={`rounded-lg border px-2 py-2 text-sm font-medium ${
                  selectedTime === slot
                    ? 'border-[#ec6d13] bg-[#ec6d13] text-white'
                    : 'border-gray-200 text-gray-700 hover:border-[#ec6d13]/50'
                }`}
              >
                {formatTime(slot)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
