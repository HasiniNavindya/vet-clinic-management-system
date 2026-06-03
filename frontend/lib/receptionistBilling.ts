import { apiFetch, authHeaders } from './api';
import type { Appointment } from './appointments';
import type { MedicalRecord } from './medicalRecords';

export type BillingQueueItem = Appointment & {
  medicalRecord?: MedicalRecord | null;
};

export async function fetchBillingQueue(token: string) {
  return apiFetch<BillingQueueItem[]>('/api/receptionist/billing-queue', {
    headers: authHeaders(token),
  });
}

export async function saveConsultationBilling(
  token: string,
  appointmentId: number,
  body: {
    consultation_fee_cents: number;
    vaccination_fee_cents: number;
    medicine_fee_cents: number;
    record_payment?: boolean;
    payment_method?: 'cash' | 'card_offline' | 'other';
    payment_notes?: string;
  }
) {
  return apiFetch<BillingQueueItem>(`/api/receptionist/appointments/${appointmentId}/billing`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

export function dollarsToCents(value: string): number {
  const n = parseFloat(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

export function centsToDollars(cents: number | null | undefined): string {
  if (cents == null || cents <= 0) return '';
  return (cents / 100).toFixed(2);
}

export function visitChargesTotalCents(apt: Appointment): number {
  const lineTotal =
    (apt.consultationFeeCents || 0) +
    (apt.vaccinationFeeCents || 0) +
    (apt.medicineFeeCents || 0);
  return lineTotal > 0 ? lineTotal : apt.serviceFeeCents || 0;
}
