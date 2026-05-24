import { apiFetch } from './api';

export type HomeStats = {
  registeredPets: number;
  totalAppointments: number;
  registeredVeterinarians: number;
  clientSatisfactionPercent: number | null;
  feedbackCount: number;
};

export async function fetchHomeStats() {
  return apiFetch<HomeStats>('/api/public/home-stats');
}

export function formatStatCount(value: number) {
  return value.toLocaleString();
}

export function formatSatisfaction(percent: number | null, feedbackCount: number) {
  if (feedbackCount === 0 || percent == null) return 'N/A';
  return `${percent}%`;
}
