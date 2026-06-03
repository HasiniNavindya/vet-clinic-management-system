'use client';

import { useState, useEffect } from 'react';
import {
  DayScheduleSlot,
  Doctor,
  fetchDoctorAvailability,
  fetchDoctors,
  formatTime,
} from '@/lib/appointments';
import { createAppointmentCheckout } from '@/lib/payments';

interface Pet {
  id: number;
  pet_name: string;
  species: string;
}

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  pets: Pet[];
  selectedDoctorId?: number | null;
}

export default function BookAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  token,
  pets,
  selectedDoctorId,
}: BookAppointmentModalProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [schedule, setSchedule] = useState<DayScheduleSlot[]>([]);
  const [formData, setFormData] = useState({
    doctor_id: '',
    pet_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchDoctors().then((res) => {
        if (res.ok) setDoctors(res.data);
      });
      if (selectedDoctorId) {
        setFormData((prev) => ({ ...prev, doctor_id: selectedDoctorId.toString() }));
      }
    }
  }, [isOpen, selectedDoctorId]);

  useEffect(() => {
    if (!isOpen || !token || !formData.doctor_id || !formData.appointment_date) {
      setSchedule([]);
      return;
    }
    fetchDoctorAvailability(token, Number(formData.doctor_id), formData.appointment_date).then((res) => {
      if (res.ok) {
        const daySchedule =
          res.data.schedule?.length
            ? res.data.schedule
            : res.data.slots.map((time) => ({ time, status: 'available' as const }));
        setSchedule(daySchedule);
      } else {
        setSchedule([]);
      }
    });
  }, [isOpen, token, formData.doctor_id, formData.appointment_date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const res = await createAppointmentCheckout(token, {
      doctor_id: Number(formData.doctor_id),
      pet_id: formData.pet_id ? Number(formData.pet_id) : undefined,
      appointment_date: formData.appointment_date,
      appointment_time: formData.appointment_time,
      notes: formData.notes || undefined,
    });

    setIsSubmitting(false);
    if (!res.ok) {
      setError((res.data as { error?: string }).error || 'Failed to start checkout');
      return;
    }

    if (res.data.url) {
      window.location.href = res.data.url;
    }
  };

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <ModalOverlay onClose={onClose}>
      <ModalPanel onClose={onClose} error={error} onSubmit={handleSubmit}>
        <DoctorSelect
          doctors={doctors}
          value={formData.doctor_id}
          onChange={(doctor_id) => setFormData({ ...formData, doctor_id, appointment_time: '' })}
        />
        {pets.length > 0 ? (
          <PetSelect
            pets={pets}
            value={formData.pet_id}
            onChange={(pet_id) => setFormData({ ...formData, pet_id })}
          />
        ) : null}
        <DateField
          today={today}
          value={formData.appointment_date}
          onChange={(appointment_date) =>
            setFormData({ ...formData, appointment_date, appointment_time: '' })
          }
        />
        <TimeSelect
          schedule={schedule}
          doctorId={formData.doctor_id}
          date={formData.appointment_date}
          value={formData.appointment_time}
          onChange={(appointment_time) => setFormData({ ...formData, appointment_time })}
        />
        <NotesField
          value={formData.notes}
          onChange={(notes) => setFormData({ ...formData, notes })}
        />
        <FormActions isSubmitting={isSubmitting} onClose={onClose} slots={slots} />
      </ModalPanel>
    </ModalOverlay>
  );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      {children}
    </div>
  );
}

function ModalPanel({
  children,
  onClose,
  error,
  onSubmit,
}: {
  children: React.ReactNode;
  onClose: () => void;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div
      className="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-8"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-gray-900">Book Appointment</h2>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ×
        </button>
      </div>
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
      </form>
    </div>
  );
}

function DoctorSelect({
  doctors,
  value,
  onChange,
}: {
  doctors: Doctor[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        Select Doctor <span className="text-red-500">*</span>
      </label>
      <select
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#ec6d13]"
      >
        <option value="">Choose a doctor</option>
        {doctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            {doctor.name} - {doctor.specialization}
          </option>
        ))}
      </select>
    </div>
  );
}

function PetSelect({
  pets,
  value,
  onChange,
}: {
  pets: Pet[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <PetSelectField pets={pets} value={value} onChange={onChange} />
  );
}

function PetSelectField({
  pets,
  value,
  onChange,
}: {
  pets: Pet[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">Select Pet (Optional)</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#ec6d13]"
      >
        <option value="">Choose a pet</option>
        {pets.map((pet) => (
          <option key={pet.id} value={pet.id}>
            {pet.pet_name} ({pet.species})
          </option>
        ))}
      </select>
    </div>
  );
}

function DateField({
  today,
  value,
  onChange,
}: {
  today: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        Appointment Date <span className="text-red-500">*</span>
      </label>
      <input
        type="date"
        required
        min={today}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#ec6d13]"
      />
    </div>
  );
}

function TimeSelect({
  schedule,
  doctorId,
  date,
  value,
  onChange,
}: {
  schedule: DayScheduleSlot[];
  doctorId: string;
  date: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const available = schedule.filter((s) => s.status === 'available');
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        Appointment Time <span className="text-red-500">*</span>
      </label>
      {!doctorId || !date ? (
        <p className="text-sm text-gray-500">Select doctor and date first</p>
      ) : schedule.length === 0 ? (
        <p className="text-sm text-amber-700">No slots available</p>
      ) : (
        <select
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#ec6d13]"
        >
          <option value="">Select time</option>
          {schedule.map((slot) => (
            <option key={slot.time} value={slot.time} disabled={slot.status === 'booked'}>
              {formatTime(slot.time)}
              {slot.status === 'booked' ? ' (Booked)' : ''}
            </option>
          ))}
        </select>
      )}
      {schedule.length > 0 && available.length === 0 ? (
        <p className="mt-1 text-xs text-amber-700">All times on this day are booked.</p>
      ) : null}
    </div>
  );
}

function NotesField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">Notes (Optional)</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-[#ec6d13]"
        rows={3}
        placeholder="Any special requirements or notes..."
      />
    </div>
  );
}

function FormActions({
  isSubmitting,
  onClose,
  slots,
}: {
  isSubmitting: boolean;
  onClose: () => void;
  slots: string[];
}) {
  return (
    <div className="flex gap-3 pt-4">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting || slots.length === 0}
        className="flex-1 rounded-lg bg-[#ec6d13] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#d65e0f] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Booking...' : 'Book Appointment'}
      </button>
    </div>
  );
}
