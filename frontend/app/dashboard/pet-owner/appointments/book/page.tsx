'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import { API_BASE_URL, authHeaders } from '@/lib/api';
import {
  bookAppointment,
  Doctor,
  fetchDoctorAvailability,
  fetchDoctors,
} from '@/lib/appointments';

type Pet = { id: number; pet_name: string; species?: string };

export default function BookAppointmentPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [form, setForm] = useState({
    doctor_id: '',
    pet_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDoctors().then((res) => {
      if (res.ok) setDoctors(res.data);
    });
    if (!token) return;
    fetch(`${API_BASE_URL}/api/pets`, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then((data) => setPets(Array.isArray(data) ? data : []))
      .catch(() => setPets([]));
  }, [token]);

  useEffect(() => {
    if (!token || !form.doctor_id || !form.appointment_date) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    fetchDoctorAvailability(token, Number(form.doctor_id), form.appointment_date).then((res) => {
      if (res.ok) setSlots(res.data.slots);
      else {
        setSlots([]);
        setError((res.data as { error?: string }).error || '');
      }
      setSlotsLoading(false);
    });
  }, [token, form.doctor_id, form.appointment_date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError('');
    setSuccess('');

    const res = await bookAppointment(token, {
      doctor_id: Number(form.doctor_id),
      pet_id: form.pet_id ? Number(form.pet_id) : undefined,
      appointment_date: form.appointment_date,
      appointment_time: form.appointment_time,
      notes: form.notes || undefined,
    });

    setSubmitting(false);
    if (!res.ok) {
      setError((res.data as { error?: string }).error || 'Booking failed');
      return;
    }

    setSuccess(res.data.confirmationMessage || 'Appointment booked successfully.');
    setTimeout(() => {
      router.push(`/dashboard/pet-owner/appointments/${res.data.id}`);
    }, 1500);
  };

  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <PetOwnerShell>
      <div className="mb-6">
        <Link href="/dashboard/pet-owner/appointments" className="text-sm font-medium text-[#ec6d13] hover:text-[#d65e0f]">
          ← My appointments
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">Book Appointment</h1>
        <p className="mt-1 text-gray-600">Choose veterinarian, date, and time</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Veterinarian</label>
          <select
            required
            value={form.doctor_id}
            onChange={(e) => setForm((f) => ({ ...f, doctor_id: e.target.value, appointment_time: '' }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-[#ec6d13] focus:outline-none focus:ring-1 focus:ring-[#ec6d13]"
          >
            <option value="">Select a doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.specialization}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Pet (optional)</label>
          <select
            value={form.pet_id}
            onChange={(e) => setForm((f) => ({ ...f, pet_id: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-[#ec6d13] focus:outline-none focus:ring-1 focus:ring-[#ec6d13]"
          >
            <option value="">No pet selected</option>
            {pets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.pet_name}
                {p.species ? ` (${p.species})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            required
            min={minDate}
            value={form.appointment_date}
            onChange={(e) => setForm((f) => ({ ...f, appointment_date: e.target.value, appointment_time: '' }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-[#ec6d13] focus:outline-none focus:ring-1 focus:ring-[#ec6d13]"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Time</label>
          {slotsLoading ? (
            <p className="text-sm text-gray-500">Loading available times…</p>
          ) : !form.doctor_id || !form.appointment_date ? (
            <p className="text-sm text-gray-500">Select doctor and date first</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-amber-700">No slots available for this day</p>
          ) : (
            <select
              required
              value={form.appointment_time}
              onChange={(e) => setForm((f) => ({ ...f, appointment_time: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-[#ec6d13] focus:outline-none focus:ring-1 focus:ring-[#ec6d13]"
            >
              <option value="">Select time</option>
              {slots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-[#ec6d13] focus:outline-none focus:ring-1 focus:ring-[#ec6d13]"
            placeholder="Reason for visit, symptoms, etc."
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-green-700">{success}</p> : null}

        <button
          type="submit"
          disabled={submitting || slots.length === 0}
          className="w-full rounded-lg bg-[#ec6d13] py-3 font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
        >
          {submitting ? 'Booking…' : 'Confirm booking'}
        </button>
      </form>
    </PetOwnerShell>
  );
}
