'use client';

import { useEffect, useState } from 'react';
import { DayScheduleSlot, fetchDoctorAvailability, formatTime } from '@/lib/appointments';

type Action = 'reject' | 'reschedule';

type Props = {
  open: boolean;
  action: Action;
  doctorId: number;
  token: string;
  onClose: () => void;
  onSubmit: (data: {
    reason: string;
    appointment_date?: string;
    appointment_time?: string;
  }) => void;
  busy?: boolean;
};

export default function StaffRespondModal({
  open,
  action,
  doctorId,
  token,
  onClose,
  onSubmit,
  busy,
}: Props) {
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [schedule, setSchedule] = useState<DayScheduleSlot[]>([]);

  useEffect(() => {
    if (!open) {
      setReason('');
      setDate('');
      setTime('');
      setSchedule([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open || action !== 'reschedule' || !date || !token) {
      setSchedule([]);
      return;
    }
    fetchDoctorAvailability(token, doctorId, date).then((res) => {
      if (res.ok) {
        const daySchedule =
          res.data.schedule?.length
            ? res.data.schedule
            : res.data.slots.map((t) => ({ time: t, status: 'available' as const }));
        setSchedule(daySchedule);
      } else {
        setSchedule([]);
      }
    });
  }, [open, action, date, doctorId, token]);

  if (!open) return null;

  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-gray-900">
          {action === 'reject' ? 'Decline request' : 'Offer new time'}
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          {action === 'reject'
            ? 'A reason is required. The pet owner will be notified.'
            : 'Choose a new date and time. The pet owner can accept or contact the clinic.'}
        </p>

        <div className="mt-4 space-y-4">
          {action === 'reschedule' ? (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">New date</label>
                <input
                  type="date"
                  required
                  min={minDate}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setTime('');
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">New time</label>
                {schedule.length === 0 && date ? (
                  <p className="text-sm text-amber-700">No slots on this day</p>
                ) : (
                  <select
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="">Select time</option>
                    {schedule.map((s) => (
                      <option key={s.time} value={s.time} disabled={s.status === 'booked'}>
                        {formatTime(s.time)}
                        {s.status === 'booked' ? ' (Booked)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </>
          ) : null}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Reason</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder={
                action === 'reject'
                  ? 'Why this request cannot be accepted…'
                  : 'Why the time is being changed…'
              }
            />
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={
              busy ||
              !reason.trim() ||
              (action === 'reschedule' && (!date || !time))
            }
            onClick={() =>
              onSubmit({
                reason,
                appointment_date: action === 'reschedule' ? date : undefined,
                appointment_time: action === 'reschedule' ? time : undefined,
              })
            }
            className="flex-1 rounded-lg bg-[#ec6d13] py-2.5 text-sm font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
