import { apiFetch, authHeaders } from './api';

export type MedicalRecord = {
  id: number;
  petId: number;
  doctorId?: number | null;
  appointmentId?: number | null;
  visitDate: string;
  diagnosis?: string | null;
  symptoms?: string | null;
  treatment?: string | null;
  consultationNotes?: string | null;
  petName?: string;
  petSpecies?: string;
  doctorName?: string;
  specialization?: string;
  createdAt?: string;
};

export type PetTimeline = {
  petId: number;
  petName: string;
  timeline: MedicalRecord[];
};

export async function fetchMedicalRecords(token: string, petId?: number) {
  const q = petId ? `?pet_id=${petId}` : '';
  return apiFetch<MedicalRecord[]>(`/api/medical-records${q}`, {
    headers: authHeaders(token),
  });
}

export async function fetchPetTimeline(token: string, petId: number) {
  return apiFetch<PetTimeline>(`/api/medical-records/pet/${petId}/timeline`, {
    headers: authHeaders(token),
  });
}

export async function fetchMedicalRecord(token: string, id: number | string) {
  return apiFetch<MedicalRecord>(`/api/medical-records/${id}`, {
    headers: authHeaders(token),
  });
}

export async function fetchConsultationByAppointment(
  token: string,
  appointmentId: number | string
) {
  return apiFetch<{
    appointmentId: number;
    appointmentStatus: string;
    hasRecord: boolean;
    record: MedicalRecord | null;
  }>(`/api/medical-records/by-appointment/${appointmentId}`, {
    headers: authHeaders(token),
  });
}

export function formatVisitDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
