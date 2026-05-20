import { API_BASE_URL, authHeaders } from './api';

export interface AdminOverviewStats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalDoctors: number;
  doctorsWithActiveLogin: number;
  totalPetOwners: number;
  totalStaff: number;
  totalAdmins: number;
  revenueCents: number;
  shopOrdersPaid: number;
  shopRevenueCents: number;
  medicalRecordsCount: number;
  vaccinationsDueSoon: number;
  notificationsUnread: number;
  doctorApplicationsPending: number;
  marketplaceAdsPending: number;
}

async function parseJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(res.status === 404 ? 'API not found' : 'Invalid server response');
  }
}

export async function fetchAdminOverview(token: string): Promise<{ overview: AdminOverviewStats }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/stats/overview`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to load overview');
  return data as { overview: AdminOverviewStats };
}

export async function fetchAppointmentBreakdown(
  token: string
): Promise<{ breakdown: { status: string; count: number }[] }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/stats/appointments-by-status`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed');
  return data as { breakdown: { status: string; count: number }[] };
}

export async function fetchAppointmentsDaily(
  token: string,
  days?: number
): Promise<{ days: number; series: { day: string; count: number }[] }> {
  const q = days ? `?days=${days}` : '';
  const res = await fetch(`${API_BASE_URL}/api/admin/analytics/appointments-daily${q}`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed');
  return data as { days: number; series: { day: string; count: number }[] };
}

export async function fetchRevenueDaily(
  token: string,
  days?: number
): Promise<{ days: number; series: { day: string; cents: number }[] }> {
  const q = days ? `?days=${days}` : '';
  const res = await fetch(`${API_BASE_URL}/api/admin/analytics/revenue-daily${q}`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed');
  return data as { days: number; series: { day: string; cents: number }[] };
}

export async function fetchMonthlyReport(
  token: string,
  year: number,
  month: number
): Promise<{
  year: number;
  month: number;
  bookingsCreated: number;
  visitsCompleted: number;
  treatmentsRecorded: number;
  paymentRevenueCents: number;
  shopPaidOrders: number;
  shopRevenueCents: number;
}> {
  const q = new URLSearchParams({ year: String(year), month: String(month) });
  const res = await fetch(`${API_BASE_URL}/api/admin/reports/monthly-summary?${q}`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed');
  return data as {
    year: number;
    month: number;
    bookingsCreated: number;
    visitsCompleted: number;
    treatmentsRecorded: number;
    paymentRevenueCents: number;
    shopPaidOrders: number;
    shopRevenueCents: number;
  };
}

export async function fetchAdminRecentActivity(
  token: string,
  limit?: number
): Promise<{ activity: { kind: string; summary: string; meta?: string; occurredAt: string }[] }> {
  const q = limit ? `?limit=${limit}` : '';
  const res = await fetch(`${API_BASE_URL}/api/admin/activity/recent${q}`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed');
  return data as { activity: { kind: string; summary: string; meta?: string; occurredAt: string }[] };
}

export async function fetchVaccinationsDue(
  token: string,
  withinDays?: number
): Promise<{ withinDays: number; items: unknown[] }> {
  const q = withinDays ? `?withinDays=${withinDays}` : '';
  const res = await fetch(`${API_BASE_URL}/api/admin/insights/vaccinations-due${q}`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed');
  return data as { withinDays: number; items: unknown[] };
}

export function formatUsdFromCents(cents: number): string {
  const n = Number.isFinite(cents) ? cents / 100 : 0;
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}
