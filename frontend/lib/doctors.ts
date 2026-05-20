import { API_BASE_URL, apiFetch } from './api';
import { doctorImageUrl } from './appointments';

export type DoctorProfile = {
  id: number;
  name: string;
  specialization: string;
  email?: string | null;
  phone?: string | null;
  imageUrl?: string | null;
  bio?: string | null;
  availableDays: string[];
};

export const CLINIC_HOURS_LABEL = '8:00 AM – 5:00 PM (30-minute slots)';

function mapDoctor(row: Record<string, unknown>): DoctorProfile {
  const days = row.available_days;
  return {
    id: Number(row.id),
    name: String(row.name || ''),
    specialization: String(row.specialization || ''),
    email: (row.email as string) || null,
    phone: (row.phone as string) || null,
    imageUrl: doctorImageUrl((row.image_url as string) || (row.imageUrl as string)),
    bio: (row.bio as string) || null,
    availableDays: Array.isArray(days) ? (days as string[]) : [],
  };
}

export async function fetchDoctorProfiles() {
  const res = await apiFetch<Record<string, unknown>[]>('/api/doctors');
  if (!res.ok) return { ...res, data: [] as DoctorProfile[] };
  return { ...res, data: res.data.map(mapDoctor) };
}

export async function fetchDoctorProfile(id: number | string) {
  const res = await apiFetch<Record<string, unknown>>(`/api/doctors/${id}`);
  if (!res.ok) return res as { ok: false; data: { error?: string }; status: number };
  return { ...res, data: mapDoctor(res.data) };
}

export function formatAvailableDays(days: string[]) {
  if (!days || days.length === 0) return 'Contact clinic for schedule';
  return days.join(', ');
}

export function uniqueSpecializations(doctors: DoctorProfile[]) {
  const set = new Set(doctors.map((d) => d.specialization).filter(Boolean));
  return ['All', ...Array.from(set).sort()];
}
