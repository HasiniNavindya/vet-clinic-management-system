'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL, authHeaders } from '@/lib/api';
import { useEffect, useState } from 'react';

type Pet = { id: number; pet_name: string };
type Doctor = { id: number; name: string };
type Tab = 'medical' | 'vaccination' | 'prescription';

export default function HealthManagePage() {
  const { token } = useAuth();
  const [tab, setTab] = useState<Tab>('medical');
  const [pets, setPets] = useState<Pet[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [medical, setMedical] = useState({
    pet_id: '',
    doctor_id: '',
    visit_date: '',
    diagnosis: '',
    treatment: '',
    consultation_notes: '',
  });

  const [vaccination, setVaccination] = useState({
    pet_id: '',
    vaccine_name: '',
    due_date: '',
    administered_date: '',
    interval_days: '',
    notes: '',
    doctor_id: '',
  });

  const [prescription, setPrescription] = useState({
    pet_id: '',
    doctor_id: '',
    issued_date: '',
    diagnosis_summary: '',
    general_instructions: '',
    medicine_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    medicine_instructions: '',
  });

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/clinic/pets`, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then((d) => setPets(Array.isArray(d) ? d : []));
    fetch(`${API_BASE_URL}/api/doctors`)
      .then((r) => r.json())
      .then((d) => setDoctors(Array.isArray(d) ? d : []));
  }, [token]);

  const submitMedical = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError('');
    setMessage('');
    const res = await fetch(`${API_BASE_URL}/api/medical-records`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        ...medical,
        pet_id: Number(medical.pet_id),
        doctor_id: medical.doctor_id ? Number(medical.doctor_id) : null,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) return setError(data.error || 'Failed');
    setMessage('Medical record saved.');
  };

  const submitVaccination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError('');
    setMessage('');
    const res = await fetch(`${API_BASE_URL}/api/vaccinations`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        pet_id: Number(vaccination.pet_id),
        vaccine_name: vaccination.vaccine_name,
        due_date: vaccination.due_date,
        administered_date: vaccination.administered_date || null,
        interval_days: vaccination.interval_days ? Number(vaccination.interval_days) : null,
        notes: vaccination.notes || null,
        doctor_id: vaccination.doctor_id ? Number(vaccination.doctor_id) : null,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) return setError(data.error || 'Failed');
    setMessage('Vaccination record saved.');
  };

  const submitPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError('');
    setMessage('');
    const res = await fetch(`${API_BASE_URL}/api/prescriptions`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        pet_id: Number(prescription.pet_id),
        doctor_id: prescription.doctor_id ? Number(prescription.doctor_id) : null,
        issued_date: prescription.issued_date || undefined,
        diagnosis_summary: prescription.diagnosis_summary || null,
        general_instructions: prescription.general_instructions || null,
        medicines: prescription.medicine_name
          ? [
              {
                medicine_name: prescription.medicine_name,
                dosage: prescription.dosage,
                frequency: prescription.frequency,
                duration: prescription.duration,
                instructions: prescription.medicine_instructions,
              },
            ]
          : [],
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) return setError(data.error || 'Failed');
    setMessage(`Prescription ${data.prescriptionNumber} created.`);
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'doctor', 'staff']}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto max-w-3xl px-4 py-8 pt-28">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Health records (clinic)</h1>
              <p className="text-gray-600">Add medical history, vaccinations, and prescriptions</p>
            </div>
            <Link href="/dashboard/calendar" className="text-sm font-semibold text-[#ec6d13]">
              ← Calendar
            </Link>
          </div>

          <TabBar tab={tab} setTab={setTab} />

          {message ? <p className="mb-4 text-green-700">{message}</p> : null}
          {error ? <p className="mb-4 text-red-600">{error}</p> : null}

          {tab === 'medical' ? (
            <form onSubmit={submitMedical} className="max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-sm">
              <PetDoctorFields pets={pets} doctors={doctors} petId={medical.pet_id} doctorId={medical.doctor_id} onPet={(v) => setMedical((s) => ({ ...s, pet_id: v }))} onDoctor={(v) => setMedical((s) => ({ ...s, doctor_id: v }))} />
              <Field label="Visit date" type="date" value={medical.visit_date} onChange={(v) => setMedical((s) => ({ ...s, visit_date: v }))} required />
              <Field label="Diagnosis" value={medical.diagnosis} onChange={(v) => setMedical((s) => ({ ...s, diagnosis: v }))} textarea />
              <Field label="Treatment" value={medical.treatment} onChange={(v) => setMedical((s) => ({ ...s, treatment: v }))} textarea />
              <Field label="Consultation notes" value={medical.consultation_notes} onChange={(v) => setMedical((s) => ({ ...s, consultation_notes: v }))} textarea />
              <SubmitButton submitting={submitting} />
            </form>
          ) : null}

          {tab === 'vaccination' ? (
            <form onSubmit={submitVaccination} className="max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-sm">
              <PetDoctorFields pets={pets} doctors={doctors} petId={vaccination.pet_id} doctorId={vaccination.doctor_id} onPet={(v) => setVaccination((s) => ({ ...s, pet_id: v }))} onDoctor={(v) => setVaccination((s) => ({ ...s, doctor_id: v }))} />
              <Field label="Vaccine name" value={vaccination.vaccine_name} onChange={(v) => setVaccination((s) => ({ ...s, vaccine_name: v }))} required />
              <Field label="Due date" type="date" value={vaccination.due_date} onChange={(v) => setVaccination((s) => ({ ...s, due_date: v }))} required />
              <Field label="Administered date (optional)" type="date" value={vaccination.administered_date} onChange={(v) => setVaccination((s) => ({ ...s, administered_date: v }))} />
              <Field label="Interval days until next dose" type="number" value={vaccination.interval_days} onChange={(v) => setVaccination((s) => ({ ...s, interval_days: v }))} />
              <Field label="Notes" value={vaccination.notes} onChange={(v) => setVaccination((s) => ({ ...s, notes: v }))} textarea />
              <SubmitButton submitting={submitting} />
            </form>
          ) : null}

          {tab === 'prescription' ? (
            <form onSubmit={submitPrescription} className="max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-sm">
              <PetDoctorFields pets={pets} doctors={doctors} petId={prescription.pet_id} doctorId={prescription.doctor_id} onPet={(v) => setPrescription((s) => ({ ...s, pet_id: v }))} onDoctor={(v) => setPrescription((s) => ({ ...s, doctor_id: v }))} />
              <Field label="Issued date" type="date" value={prescription.issued_date} onChange={(v) => setPrescription((s) => ({ ...s, issued_date: v }))} />
              <Field label="Diagnosis summary" value={prescription.diagnosis_summary} onChange={(v) => setPrescription((s) => ({ ...s, diagnosis_summary: v }))} textarea />
              <Field label="General instructions" value={prescription.general_instructions} onChange={(v) => setPrescription((s) => ({ ...s, general_instructions: v }))} textarea />
              <hr />
              <p className="text-sm font-semibold text-gray-700">Medicine</p>
              <Field label="Medicine name" value={prescription.medicine_name} onChange={(v) => setPrescription((s) => ({ ...s, medicine_name: v }))} required />
              <Field label="Dosage" value={prescription.dosage} onChange={(v) => setPrescription((s) => ({ ...s, dosage: v }))} />
              <Field label="Frequency" value={prescription.frequency} onChange={(v) => setPrescription((s) => ({ ...s, frequency: v }))} />
              <Field label="Duration" value={prescription.duration} onChange={(v) => setPrescription((s) => ({ ...s, duration: v }))} />
              <Field label="Medicine instructions" value={prescription.medicine_instructions} onChange={(v) => setPrescription((s) => ({ ...s, medicine_instructions: v }))} textarea />
              <SubmitButton submitting={submitting} />
            </form>
          ) : null}
        </div>
      </div>
    </ProtectedRoute>
  );
}

function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {(['medical', 'vaccination', 'prescription'] as Tab[]).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setTab(t)}
          className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
            tab === t ? 'bg-[#ec6d13] text-white' : 'bg-white ring-1 ring-gray-200'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function PetDoctorFields({
  pets,
  doctors,
  petId,
  doctorId,
  onPet,
  onDoctor,
}: {
  pets: Pet[];
  doctors: Doctor[];
  petId: string;
  doctorId: string;
  onPet: (v: string) => void;
  onDoctor: (v: string) => void;
}) {
  return (
    <>
      <PetSelect pets={pets} petId={petId} onPet={onPet} />
      <DoctorSelect doctors={doctors} doctorId={doctorId} onDoctor={onDoctor} />
    </>
  );
}

function PetSelect({ pets, petId, onPet }: { pets: Pet[]; petId: string; onPet: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">Pet</label>
      <select required value={petId} onChange={(e) => onPet(e.target.value)} className="w-full rounded-lg border px-3 py-2">
        <option value="">Select pet</option>
        {pets.map((p) => (
          <option key={p.id} value={p.id}>
            {p.pet_name} (#{p.id})
          </option>
        ))}
      </select>
    </div>
  );
}

function DoctorSelect({ doctors, doctorId, onDoctor }: { doctors: Doctor[]; doctorId: string; onDoctor: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">Doctor</label>
      <select value={doctorId} onChange={(e) => onDoctor(e.target.value)} className="w-full rounded-lg border px-3 py-2">
        <option value="">Optional</option>
        {doctors.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {textarea ? (
        <textarea required={required} value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full rounded-lg border px-3 py-2" />
      ) : (
        <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
      )}
    </div>
  );
}

function SubmitButton({ submitting }: { submitting: boolean }) {
  return (
    <button type="submit" disabled={submitting} className="rounded-lg bg-[#ec6d13] px-4 py-2.5 font-semibold text-white disabled:opacity-50">
      {submitting ? 'Saving…' : 'Save'}
    </button>
  );
}
