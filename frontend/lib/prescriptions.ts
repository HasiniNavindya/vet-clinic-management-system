import { API_BASE_URL, apiFetch, authHeaders } from './api';

export type PrescriptionMedicine = {
  id: number;
  medicineName: string;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  instructions?: string | null;
};

export type Prescription = {
  id: number;
  petId: number;
  prescriptionNumber: string;
  issuedDate: string;
  diagnosisSummary?: string | null;
  generalInstructions?: string | null;
  documentUrl?: string | null;
  status: string;
  petName?: string;
  doctorName?: string;
  specialization?: string;
  medicines?: PrescriptionMedicine[];
};

export async function fetchPrescriptions(token: string, petId?: number) {
  const q = petId ? `?pet_id=${petId}` : '';
  return apiFetch<Prescription[]>(`/api/prescriptions${q}`, {
    headers: authHeaders(token),
  });
}

export async function fetchPrescription(token: string, id: number | string) {
  return apiFetch<Prescription>(`/api/prescriptions/${id}`, {
    headers: authHeaders(token),
  });
}

export function prescriptionDocumentUrl(documentUrl?: string | null): string | null {
  if (!documentUrl) return null;
  if (documentUrl.startsWith('http')) return documentUrl;
  if (documentUrl.startsWith('/')) return `${API_BASE_URL}${documentUrl}`;
  return documentUrl;
}

export function formatIssuedDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
