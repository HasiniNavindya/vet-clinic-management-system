import { API_BASE_URL, apiFetch, authHeaders } from './api';

export type AppointmentStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'approved'
  | 'rejected'
  | 'reschedule_offered'
  | 'completed'
  | 'cancelled';

export type Appointment = {
  id: number;
  userId: number;
  petId: number | null;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  notes?: string | null;
  doctorNotes?: string | null;
  confirmationMessage?: string | null;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
  doctorName?: string;
  specialization?: string;
  doctorImage?: string;
  petName?: string;
  petSpecies?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  paymentStatus?: string;
  staffResponseReason?: string | null;
  proposedAppointmentDate?: string | null;
  proposedAppointmentTime?: string | null;
  staffRespondedAt?: string | null;
  checkedInAt?: string | null;
  serviceFeeCents?: number | null;
};

export type StatusMeta = {
  id: AppointmentStatus;
  label: string;
  description: string;
};

export type Doctor = {
  id: number;
  name: string;
  specialization: string;
  image_url?: string;
  available_days?: string[];
};

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  awaiting_payment: 'bg-orange-100 text-orange-900',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  reschedule_offered: 'bg-purple-100 text-purple-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-700',
};

export function statusBadgeClass(status: AppointmentStatus): string {
  return STATUS_STYLES[status] || STATUS_STYLES.pending;
}

export async function fetchAppointmentMeta(token: string) {
  return apiFetch<{ statuses: StatusMeta[] }>('/api/appointments/meta', {
    headers: authHeaders(token),
  });
}

export async function fetchAppointments(token: string, status?: AppointmentStatus) {
  const query = status ? `?status=${status}` : '';
  return apiFetch<Appointment[]>(`/api/appointments${query}`, {
    headers: authHeaders(token),
  });
}

export async function fetchAppointment(token: string, id: number | string) {
  return apiFetch<Appointment>(`/api/appointments/${id}`, {
    headers: authHeaders(token),
  });
}

export async function submitAppointmentRequest(
  token: string,
  body: {
    doctor_id: number;
    pet_id?: number;
    appointment_date: string;
    appointment_time: string;
    notes?: string;
  }
) {
  return apiFetch<Appointment>('/api/appointments/request', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

export async function staffRespondToAppointment(
  token: string,
  id: number | string,
  body: {
    action: 'approve' | 'reject' | 'reschedule';
    reason?: string;
    appointment_date?: string;
    appointment_time?: string;
    doctor_notes?: string;
    confirmation_message?: string;
    doctor_id?: number;
  }
) {
  return apiFetch<Appointment>(`/api/appointments/${id}/respond`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

export async function acceptRescheduleOffer(token: string, id: number | string) {
  return apiFetch<Appointment>(`/api/appointments/${id}/accept-reschedule`, {
    method: 'POST',
    headers: authHeaders(token),
  });
}

export async function fetchDoctorMonthCalendar(
  token: string,
  doctorId: number,
  month: string
) {
  return apiFetch<{
    yearMonth: string;
    dates: Record<string, { availableCount: number; hasSlots: boolean }>;
  }>(`/api/doctors/${doctorId}/availability-calendar?month=${month}`, {
    headers: authHeaders(token),
  });
}

export async function rescheduleAppointment(
  token: string,
  id: number | string,
  body: { appointment_date: string; appointment_time: string; notes?: string }
) {
  return apiFetch<Appointment>(`/api/appointments/${id}/reschedule`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

export async function cancelAppointment(
  token: string,
  id: number | string,
  reason?: string
) {
  return apiFetch<Appointment>(`/api/appointments/${id}/cancel`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ reason }),
  });
}

export async function checkInAppointment(token: string, id: number | string) {
  return apiFetch<Appointment>(`/api/appointments/${id}/check-in`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
}

export async function assignAppointmentDoctor(
  token: string,
  id: number | string,
  doctor_id: number
) {
  return apiFetch<Appointment>(`/api/appointments/${id}/assign-doctor`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ doctor_id }),
  });
}

export async function setAppointmentServiceFee(
  token: string,
  id: number | string,
  service_fee_cents: number
) {
  return apiFetch<Appointment>(`/api/appointments/${id}/service-fee`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ service_fee_cents }),
  });
}

export async function updateAppointmentStatus(
  token: string,
  id: number | string,
  body: { status: AppointmentStatus; doctor_notes?: string; confirmation_message?: string }
) {
  return apiFetch<Appointment>(`/api/appointments/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

export async function fetchDoctors() {
  return apiFetch<Doctor[]>('/api/doctors');
}

export async function fetchDoctorAvailability(
  token: string,
  doctorId: number,
  date: string
) {
  return apiFetch<{ date: string; doctorId: number; slots: string[] }>(
    `/api/doctors/${doctorId}/availability?date=${date}`,
    { headers: authHeaders(token) }
  );
}

export function formatAppointmentDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function doctorImageUrl(imagePath?: string | null): string | null {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/')) return `${API_BASE_URL}${imagePath}`;
  return imagePath;
}

export const OWNER_CANCELLABLE: AppointmentStatus[] = [
  'pending',
  'awaiting_payment',
  'approved',
  'reschedule_offered',
];
export const OWNER_RESCHEDULABLE: AppointmentStatus[] = ['pending', 'approved'];

export function statusLabel(status: AppointmentStatus): string {
  const labels: Record<AppointmentStatus, string> = {
    pending: 'Pending review',
    awaiting_payment: 'Awaiting payment',
    approved: 'Confirmed',
    rejected: 'Declined',
    reschedule_offered: 'Reschedule offered',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
}
