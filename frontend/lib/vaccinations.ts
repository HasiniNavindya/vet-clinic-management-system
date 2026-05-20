import { apiFetch, authHeaders } from './api';

export type VaccinationStatus =
  | 'completed'
  | 'overdue'
  | 'due_today'
  | 'upcoming'
  | 'scheduled';

export type Vaccination = {
  id: number;
  petId: number;
  petName?: string;
  vaccineName: string;
  dueDate: string;
  administeredDate?: string | null;
  intervalDays?: number | null;
  notes?: string | null;
  doctorName?: string;
  status: VaccinationStatus;
};

export type VaccinationDashboard = {
  total: number;
  completed: number;
  overdue: Vaccination[];
  dueToday: Vaccination[];
  upcoming: Vaccination[];
  history: Vaccination[];
};

export type VaccinationReminders = {
  active: Array<{
    vaccinationId: number;
    petId: number;
    petName: string;
    vaccineName: string;
    dueDate: string;
    status: VaccinationStatus;
    reminderType: string;
    message: string;
  }>;
  recent: Array<{
    id: number;
    vaccinationId: number;
    petName: string;
    vaccineName: string;
    dueDate: string;
    reminderType: string;
    message: string;
    sentAt: string;
  }>;
  reminderDaysBefore: number;
};

const STATUS_STYLES: Record<VaccinationStatus, string> = {
  completed: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  due_today: 'bg-orange-100 text-orange-900',
  upcoming: 'bg-amber-100 text-amber-800',
  scheduled: 'bg-gray-100 text-gray-700',
};

export function vaccinationBadgeClass(status: VaccinationStatus): string {
  return STATUS_STYLES[status] || STATUS_STYLES.scheduled;
}

export function vaccinationStatusLabel(status: VaccinationStatus): string {
  return status.replace(/_/g, ' ');
}

export async function fetchVaccinations(
  token: string,
  opts?: { petId?: number; filter?: string }
) {
  const params = new URLSearchParams();
  if (opts?.petId) params.set('pet_id', String(opts.petId));
  if (opts?.filter) params.set('filter', opts.filter);
  const q = params.toString() ? `?${params}` : '';
  return apiFetch<Vaccination[]>(`/api/vaccinations${q}`, {
    headers: authHeaders(token),
  });
}

export async function fetchVaccinationDashboard(token: string) {
  return apiFetch<VaccinationDashboard>('/api/vaccinations/dashboard', {
    headers: authHeaders(token),
  });
}

export async function fetchVaccinationReminders(token: string) {
  return apiFetch<VaccinationReminders>('/api/vaccinations/reminders', {
    headers: authHeaders(token),
  });
}

export function formatDueDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
