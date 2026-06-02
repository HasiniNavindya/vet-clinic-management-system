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
  petImage?: string | null;
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

export function formatAppointmentDate(dateStr: string | null | undefined): string {
  if (dateStr == null || dateStr === '') return 'Date pending';
  const raw = String(dateStr).trim();
  const dateOnly = /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : raw;
  const d = new Date(`${dateOnly}T12:00:00`);
  if (Number.isNaN(d.getTime())) return 'Date pending';
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(timeStr: string | null | undefined): string {
  if (timeStr == null || timeStr === '') return '—';
  const normalized = String(timeStr).trim().slice(0, 8);
  const match = normalized.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return normalized;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (Number.isNaN(h) || Number.isNaN(m)) return normalized;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function doctorImageUrl(imagePath?: string | null, cacheBust?: string | number): string | null {
  if (!imagePath) return null;
  let url: string;
  if (imagePath.startsWith('http')) {
    url = imagePath;
  } else if (imagePath.startsWith('/')) {
    url = `${API_BASE_URL}${imagePath}`;
  } else {
    url = imagePath;
  }
  if (cacheBust == null) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}v=${cacheBust}`;
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

export function normalizeAppointmentStatus(status: string | undefined): string {
  return String(status || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

export type PetAppointmentGroup = {
  petId: number | null;
  petName: string;
  petSpecies?: string | null;
  petImage?: string | null;
  appointments: Appointment[];
};

export function resolvePetImageUrl(imagePath?: string | null): string | null {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/')) return `${API_BASE_URL}${imagePath}`;
  return imagePath;
}

export function groupAppointmentsByPet(appointments: Appointment[]): PetAppointmentGroup[] {
  const map = new Map<string, PetAppointmentGroup>();

  for (const apt of appointments) {
    const petId = apt.petId ?? null;
    const key = petId != null ? `pet-${petId}` : 'unassigned';
    const petName =
      petId != null
        ? apt.petName?.trim() || `Pet #${petId}`
        : 'All pets';

    if (!map.has(key)) {
      map.set(key, {
        petId,
        petName,
        petSpecies: apt.petSpecies,
        petImage: apt.petImage,
        appointments: [],
      });
    }
    const group = map.get(key)!;
    if (!group.petSpecies && apt.petSpecies) group.petSpecies = apt.petSpecies;
    if (!group.petImage && apt.petImage) group.petImage = apt.petImage;
    group.appointments.push(apt);
  }

  return Array.from(map.values())
    .sort((a, b) => a.petName.localeCompare(b.petName))
    .map((group) => ({
      ...group,
      appointments: [...group.appointments].sort((a, b) => {
        const aKey = `${String(a.appointmentDate).slice(0, 10)}T${a.appointmentTime}`;
        const bKey = `${String(b.appointmentDate).slice(0, 10)}T${b.appointmentTime}`;
        return aKey.localeCompare(bKey);
      }),
    }));
}
