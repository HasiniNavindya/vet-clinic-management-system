'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import DoctorBookingCalendar from '@/components/appointments/DoctorBookingCalendar';
import { API_BASE_URL, authHeaders } from '@/lib/api';
import { Doctor, fetchDoctors, submitAppointmentRequest } from '@/lib/appointments';

type Pet = { id: number; pet_name: string; species?: string };

function BookAppointmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorFromUrl = searchParams.get('doctor');
  const { token } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [form, setForm] = useState({
    doctor_id: '',
    pet_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchDoctors().then((res) => {
      if (res.ok) setDoctors(res.data);
    });
  }, []);

  useEffect(() => {
    if (!doctorFromUrl || doctors.length === 0) return;
    if (doctors.some((d) => String(d.id) === doctorFromUrl)) {
      setForm((f) => ({ ...f, doctor_id: doctorFromUrl, appointment_date: '', appointment_time: '' }));
    }
  }, [doctorFromUrl, doctors]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/pets`, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then((data) => setPets(Array.isArray(data) ? data : []))
      .catch(() => setPets([]));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError('');

    const res = await submitAppointmentRequest(token, {
      doctor_id: Number(form.doctor_id),
      pet_id: form.pet_id ? Number(form.pet_id) : undefined,
      appointment_date: form.appointment_date,
      appointment_time: form.appointment_time,
      notes: form.notes || undefined,
    });

    setSubmitting(false);
    if (!res.ok) {
      setError((res.data as { error?: string }).error || 'Could not submit request');
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push(`/dashboard/pet-owner/appointments/${res.data.id}`), 1500);
  };

  const selectedDoctor = doctors.find((d) => String(d.id) === form.doctor_id);

  return (
    <PetOwnerShell>
      <div className="mb-6">
        <Link href="/dashboard/pet-owner/appointments" className="text-sm font-medium text-[#ec6d13] hover:text-[#d65e0f]">
          ← My appointments
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">Request appointment</h1>
        <p className="mt-1 text-gray-600">
          View the doctor&apos;s calendar, pick an available slot, and submit a request. Payment is only
          required after the clinic approves your booking.
        </p>
      </div>

      {success ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center text-green-800">
          Request submitted! Redirecting to your appointment…
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <label className="mb-1 block text-sm font-medium text-gray-700">Veterinarian</label>
            <select
              required
              value={form.doctor_id}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  doctor_id: e.target.value,
                  appointment_date: '',
                  appointment_time: '',
                }))
              }
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

          {form.doctor_id && token ? (
            <DoctorBookingCalendar
              token={token}
              doctorId={Number(form.doctor_id)}
              selectedDate={form.appointment_date}
              selectedTime={form.appointment_time}
              onSelectDate={(date) => setForm((f) => ({ ...f, appointment_date: date, appointment_time: '' }))}
              onSelectTime={(time) => setForm((f) => ({ ...f, appointment_time: time }))}
            />
          ) : null}

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4">
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
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes for the clinic</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-[#ec6d13] focus:outline-none focus:ring-1 focus:ring-[#ec6d13]"
                placeholder="Reason for visit, symptoms, etc."
              />
            </div>
          </div>

          {selectedDoctor && form.appointment_date && form.appointment_time ? (
            <p className="text-sm text-gray-600">
              Requesting: <strong>{selectedDoctor.name}</strong> on{' '}
              <strong>{form.appointment_date}</strong> at <strong>{form.appointment_time}</strong>
            </p>
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting || !form.doctor_id || !form.appointment_date || !form.appointment_time}
            className="w-full rounded-lg bg-[#ec6d13] py-3 font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
          >
            {submitting ? 'Submitting request…' : 'Submit appointment request'}
          </button>
        </form>
      )}
    </PetOwnerShell>
  );
}

export default function BookAppointmentPage() {
  return (
    <Suspense
      fallback={
        <PetOwnerShell>
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
          </div>
        </PetOwnerShell>
      }
    >
      <BookAppointmentContent />
    </Suspense>
  );
}
