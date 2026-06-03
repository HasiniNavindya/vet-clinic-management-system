'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DoctorShell from '@/components/doctor/DoctorShell';
import DoctorPageHeader from '@/components/doctor/DoctorPageHeader';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL, authHeaders } from '@/lib/api';
import { fetchDoctorDashboard } from '@/lib/doctorApplications';
import { fetchConsultationByAppointment } from '@/lib/medicalRecords';
import type { MedicalRecord } from '@/lib/medicalRecords';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Pet = { id: number; pet_name: string };
type Doctor = { id: number; name: string };
type Tab = 'medical' | 'vaccination' | 'prescription';

function pageCopy(isDoctor: boolean, isReceptionist: boolean) {
  if (isDoctor) {
    return {
      title: 'Patient clinical records',
      subtitle: 'Document visit notes, vaccinations, and prescriptions for pets in your care',
      backHref: '/dashboard/doctor/appointments',
      backLabel: '← My appointments',
    };
  }
  if (isReceptionist) {
    return {
      title: 'Patient health records',
      subtitle: 'Add medical history, vaccinations, and prescriptions on behalf of the clinic',
      backHref: '/dashboard/receptionist/appointments/calendar',
      backLabel: '← Appointments',
    };
  }
  return {
    title: 'Patient health records',
    subtitle: 'Add medical history, vaccinations, and prescriptions',
    backHref: '/dashboard/calendar',
    backLabel: '← Calendar',
  };
}

export default function HealthManagePage() {
  const searchParams = useSearchParams();
  const { token, hasRole, user } = useAuth();
  const isDoctor = hasRole('doctor');
  const isReceptionist = hasRole('receptionist');
  const copy = pageCopy(isDoctor, isReceptionist);

  const [tab, setTab] = useState<Tab>('medical');
  const [pets, setPets] = useState<Pet[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [consultationLocked, setConsultationLocked] = useState(false);
  const [existingConsultation, setExistingConsultation] = useState<MedicalRecord | null>(null);
  const [consultationLoading, setConsultationLoading] = useState(false);

  const [timeline, setTimeline] = useState<
    { visitDate: string; diagnosis?: string; symptoms?: string; treatment?: string }[]
  >([]);
  const [medical, setMedical] = useState({
    pet_id: '',
    doctor_id: '',
    appointment_id: '',
    visit_date: '',
    symptoms: '',
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
    const petId = searchParams.get('petId');
    const appointmentId = searchParams.get('appointmentId');
    if (petId) {
      setMedical((s) => ({
        ...s,
        pet_id: petId,
        appointment_id: appointmentId || '',
        visit_date: new Date().toISOString().slice(0, 10),
      }));
      setVaccination((s) => ({ ...s, pet_id: petId }));
      setPrescription((s) => ({ ...s, pet_id: petId }));
      fetch(`${API_BASE_URL}/api/medical-records/pet/${petId}/timeline`, {
        headers: authHeaders(token),
      })
        .then((r) => r.json())
        .then((d) => setTimeline(d.timeline || []));
    }
    fetch(`${API_BASE_URL}/api/clinic/pets`, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then((d) => setPets(Array.isArray(d) ? d : []));
    if (!isDoctor) {
      fetch(`${API_BASE_URL}/api/doctors`)
        .then((r) => r.json())
        .then((d) => setDoctors(Array.isArray(d) ? d : []));
    } else {
      fetchDoctorDashboard(token).then((data) => {
        const profile = data as { profile?: { id?: number } };
        const id = profile.profile?.id;
        if (id) {
          const idStr = String(id);
          setMedical((s) => ({ ...s, doctor_id: idStr }));
          setVaccination((s) => ({ ...s, doctor_id: idStr }));
          setPrescription((s) => ({ ...s, doctor_id: idStr }));
        }
      });
    }
  }, [token, searchParams, isDoctor]);

  useEffect(() => {
    const appointmentId = searchParams.get('appointmentId');
    if (!token || !appointmentId) {
      setConsultationLocked(false);
      setExistingConsultation(null);
      return;
    }
    setConsultationLoading(true);
    fetchConsultationByAppointment(token, appointmentId).then((res) => {
      setConsultationLoading(false);
      if (!res.ok) return;
      const locked = res.data.hasRecord || res.data.appointmentStatus === 'completed';
      setConsultationLocked(locked);
      setExistingConsultation(res.data.record);
      if (locked && res.data.record) {
        setMedical((s) => ({
          ...s,
          visit_date: res.data.record!.visitDate?.slice(0, 10) || s.visit_date,
          symptoms: res.data.record!.symptoms || '',
          diagnosis: res.data.record!.diagnosis || '',
          treatment: res.data.record!.treatment || '',
          consultation_notes: res.data.record!.consultationNotes || '',
        }));
      }
    });
  }, [token, searchParams]);

  useEffect(() => {
    if (!token || !medical.pet_id) return;
    fetch(`${API_BASE_URL}/api/medical-records/pet/${medical.pet_id}/timeline`, {
      headers: authHeaders(token),
    })
      .then((r) => r.json())
      .then((d) => setTimeline(d.timeline || []));
  }, [token, medical.pet_id]);

  const submitMedical = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || consultationLocked) return;
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
        appointment_id: medical.appointment_id ? Number(medical.appointment_id) : null,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) return setError(data.error || 'Failed');
    setMessage(
      'Consultation saved. Visit marked Finished — reception will add consultation, vaccination, and medicine charges.'
    );
    if (medical.appointment_id) {
      setConsultationLocked(true);
      setExistingConsultation(data);
    }
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

  const content = (
    <div className="mx-auto max-w-3xl">
      {isDoctor ? (
        <DoctorPageHeader title={copy.title} subtitle={copy.subtitle} />
      ) : (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-sans text-[1.95rem] font-semibold tracking-tight text-gray-900">
              {copy.title}
            </h1>
            <p className="mt-1 text-sm text-gray-600">{copy.subtitle}</p>
          </div>
          <Link href={copy.backHref} className="text-sm font-semibold text-[#ec6d13] hover:underline">
            {copy.backLabel}
          </Link>
        </div>
      )}

      {isDoctor ? (
        <Link
          href={copy.backHref}
          className="mb-6 inline-block text-sm font-semibold text-[#ec6d13] hover:underline"
        >
          {copy.backLabel}
        </Link>
      ) : null}

      <TabBar tab={tab} setTab={setTab} />

      {message ? (
        <p className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">{message}</p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {medical.pet_id && timeline.length > 0 ? (
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="font-sans text-sm font-semibold text-gray-900">Prior visit history</p>
          <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto text-sm text-gray-600">
            {timeline.slice(0, 8).map((t, i) => (
              <li key={i} className="rounded-lg bg-gray-50 px-3 py-2">
                <span className="font-medium text-gray-800">{t.visitDate}</span>
                {' — '}
                {t.symptoms || t.diagnosis || t.treatment || 'Visit recorded'}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {consultationLoading ? (
        <p className="mb-4 text-sm text-gray-500">Checking visit status…</p>
      ) : null}

      {consultationLocked && tab === 'medical' ? (
        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900">
          <p className="font-semibold">Visit finished</p>
          <p className="mt-1">
            Consultation records for this appointment were saved. The visit is complete on your
            side — reception will process payment (consultation, vaccination, medicine).
          </p>
          {existingConsultation ? (
            <ul className="mt-3 space-y-1 text-blue-800">
              {existingConsultation.diagnosis ? (
                <li>
                  <span className="font-medium">Diagnosis:</span> {existingConsultation.diagnosis}
                </li>
              ) : null}
              {existingConsultation.treatment ? (
                <li>
                  <span className="font-medium">Treatment:</span> {existingConsultation.treatment}
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      ) : null}

      {tab === 'medical' ? (
        <RecordForm onSubmit={submitMedical}>
          <PetDoctorFields
            pets={pets}
            doctors={doctors}
            petId={medical.pet_id}
            doctorId={medical.doctor_id}
            onPet={(v) => setMedical((s) => ({ ...s, pet_id: v }))}
            onDoctor={(v) => setMedical((s) => ({ ...s, doctor_id: v }))}
            hideDoctorSelect={isDoctor}
            vetName={isDoctor ? user?.fullName : undefined}
          />
          <fieldset disabled={consultationLocked} className={consultationLocked ? 'opacity-60' : ''}>
            <Field
              label="Visit date"
              type="date"
              value={medical.visit_date}
              onChange={(v) => setMedical((s) => ({ ...s, visit_date: v }))}
              required
            />
            <Field
              label="Symptoms"
              value={medical.symptoms}
              onChange={(v) => setMedical((s) => ({ ...s, symptoms: v }))}
              textarea
            />
            <Field
              label="Diagnosis"
              value={medical.diagnosis}
              onChange={(v) => setMedical((s) => ({ ...s, diagnosis: v }))}
              textarea
            />
            <Field
              label="Treatment plan"
              value={medical.treatment}
              onChange={(v) => setMedical((s) => ({ ...s, treatment: v }))}
              textarea
            />
            <Field
              label="Consultation notes"
              value={medical.consultation_notes}
              onChange={(v) => setMedical((s) => ({ ...s, consultation_notes: v }))}
              textarea
            />
          </fieldset>
          {!consultationLocked ? (
            <SubmitButton submitting={submitting} label="Save medical record" />
          ) : null}
        </RecordForm>
      ) : null}

      {tab === 'vaccination' ? (
        <RecordForm onSubmit={submitVaccination}>
          <PetDoctorFields
            pets={pets}
            doctors={doctors}
            petId={vaccination.pet_id}
            doctorId={vaccination.doctor_id}
            onPet={(v) => setVaccination((s) => ({ ...s, pet_id: v }))}
            onDoctor={(v) => setVaccination((s) => ({ ...s, doctor_id: v }))}
            hideDoctorSelect={isDoctor}
            vetName={isDoctor ? user?.fullName : undefined}
          />
          <Field
            label="Vaccine name"
            value={vaccination.vaccine_name}
            onChange={(v) => setVaccination((s) => ({ ...s, vaccine_name: v }))}
            required
          />
          <Field
            label="Due date"
            type="date"
            value={vaccination.due_date}
            onChange={(v) => setVaccination((s) => ({ ...s, due_date: v }))}
            required
          />
          <Field
            label="Administered date (optional)"
            type="date"
            value={vaccination.administered_date}
            onChange={(v) => setVaccination((s) => ({ ...s, administered_date: v }))}
          />
          <Field
            label="Days until next dose"
            type="number"
            value={vaccination.interval_days}
            onChange={(v) => setVaccination((s) => ({ ...s, interval_days: v }))}
          />
          <Field
            label="Notes"
            value={vaccination.notes}
            onChange={(v) => setVaccination((s) => ({ ...s, notes: v }))}
            textarea
          />
          <SubmitButton submitting={submitting} label="Save vaccination" />
        </RecordForm>
      ) : null}

      {tab === 'prescription' ? (
        <RecordForm onSubmit={submitPrescription}>
          <PetDoctorFields
            pets={pets}
            doctors={doctors}
            petId={prescription.pet_id}
            doctorId={prescription.doctor_id}
            onPet={(v) => setPrescription((s) => ({ ...s, pet_id: v }))}
            onDoctor={(v) => setPrescription((s) => ({ ...s, doctor_id: v }))}
            hideDoctorSelect={isDoctor}
            vetName={isDoctor ? user?.fullName : undefined}
          />
          <Field
            label="Issued date"
            type="date"
            value={prescription.issued_date}
            onChange={(v) => setPrescription((s) => ({ ...s, issued_date: v }))}
          />
          <Field
            label="Diagnosis summary"
            value={prescription.diagnosis_summary}
            onChange={(v) => setPrescription((s) => ({ ...s, diagnosis_summary: v }))}
            textarea
          />
          <Field
            label="General instructions"
            value={prescription.general_instructions}
            onChange={(v) => setPrescription((s) => ({ ...s, general_instructions: v }))}
            textarea
          />
          <hr className="border-gray-100" />
          <p className="text-sm font-semibold text-gray-800">Medication</p>
          <Field
            label="Medicine name"
            value={prescription.medicine_name}
            onChange={(v) => setPrescription((s) => ({ ...s, medicine_name: v }))}
            required
          />
          <Field
            label="Dosage"
            value={prescription.dosage}
            onChange={(v) => setPrescription((s) => ({ ...s, dosage: v }))}
          />
          <Field
            label="Frequency"
            value={prescription.frequency}
            onChange={(v) => setPrescription((s) => ({ ...s, frequency: v }))}
          />
          <Field
            label="Duration"
            value={prescription.duration}
            onChange={(v) => setPrescription((s) => ({ ...s, duration: v }))}
          />
          <Field
            label="Medicine instructions"
            value={prescription.medicine_instructions}
            onChange={(v) => setPrescription((s) => ({ ...s, medicine_instructions: v }))}
            textarea
          />
          <SubmitButton submitting={submitting} label="Save prescription" />
        </RecordForm>
      ) : null}
    </div>
  );

  return (
    <ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']}>
      {isDoctor ? (
        <DoctorShell>{content}</DoctorShell>
      ) : (
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="container mx-auto px-4 py-8 pt-28">{content}</div>
        </div>
      )}
    </ProtectedRoute>
  );
}

function RecordForm({
  children,
  onSubmit,
}: {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
    >
      {children}
    </form>
  );
}

function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const labels: Record<Tab, string> = {
    medical: 'Medical',
    vaccination: 'Vaccination',
    prescription: 'Prescription',
  };
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {(['medical', 'vaccination', 'prescription'] as Tab[]).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setTab(t)}
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
            tab === t
              ? 'bg-[#ec6d13] text-white shadow-sm'
              : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
          }`}
        >
          {labels[t]}
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
  hideDoctorSelect,
  vetName,
}: {
  pets: Pet[];
  doctors: Doctor[];
  petId: string;
  doctorId: string;
  onPet: (v: string) => void;
  onDoctor: (v: string) => void;
  hideDoctorSelect?: boolean;
  vetName?: string;
}) {
  return (
    <>
      <PetSelect pets={pets} petId={petId} onPet={onPet} />
      {hideDoctorSelect ? (
        <div className="rounded-lg bg-gray-50 px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Attending veterinarian
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900">{vetName || 'You'}</p>
        </div>
      ) : (
        <DoctorSelect doctors={doctors} doctorId={doctorId} onDoctor={onDoctor} />
      )}
    </>
  );
}

function PetSelect({
  pets,
  petId,
  onPet,
}: {
  pets: Pet[];
  petId: string;
  onPet: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">Patient (pet)</label>
      <select
        required
        value={petId}
        onChange={(e) => onPet(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#ec6d13] focus:outline-none focus:ring-2 focus:ring-[#ec6d13]/20"
      >
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

function DoctorSelect({
  doctors,
  doctorId,
  onDoctor,
}: {
  doctors: Doctor[];
  doctorId: string;
  onDoctor: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">Veterinarian</label>
      <select
        value={doctorId}
        onChange={(e) => onDoctor(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#ec6d13] focus:outline-none focus:ring-2 focus:ring-[#ec6d13]/20"
      >
        <option value="">Select veterinarian (optional)</option>
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
  const inputClass =
    'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#ec6d13] focus:outline-none focus:ring-2 focus:ring-[#ec6d13]/20';
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {textarea ? (
        <textarea
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={inputClass}
        />
      ) : (
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}
    </div>
  );
}

function SubmitButton({ submitting, label }: { submitting: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="rounded-lg bg-[#ec6d13] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
    >
      {submitting ? 'Saving…' : label}
    </button>
  );
}
