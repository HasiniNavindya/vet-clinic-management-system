import { apiFetch, authHeaders } from './api';
import type { Appointment } from './appointments';

export async function fetchBillingQueue(token: string) {
  return apiFetch<Appointment[]>('/api/receptionist/billing-queue', {
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
  return apiFetch<Appointment>(`/api/receptionist/appointments/${appointmentId}/billing`, {
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

export function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}
