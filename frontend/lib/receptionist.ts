import { API_BASE_URL, authHeaders, isAuthFailure } from './api';
import type { Appointment } from './appointments';
import { fetchAppointments } from './appointments';
import { fetchBillingQueue } from './receptionistBilling';

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(res.status === 404 ? 'API not found' : `Server error (${res.status})`);
  }
}

export type ReceptionistOverview = {
  todayAppointments: number;
  pendingAppointments: number;
  pendingOrders: number;
  vaccinationsDueSoon: number;
  unreadNotifications: number;
  pendingBilling?: number;
};

export type ReceptionistDashboardFeed = {
  recentRequests: Appointment[];
  todayConfirmed: Appointment[];
  upcomingConsultations: Appointment[];
  billingQueue: Appointment[];
  vaccinationsDue: VaccinationDueItem[];
};

export async function fetchReceptionistDashboardFeed(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/receptionist/dashboard-feed`, {
    headers: authHeaders(token),
  });
  const data = await parseJson<{
    overview: ReceptionistOverview;
    feed: ReceptionistDashboardFeed;
    error?: string;
  }>(res);
  if (!res.ok) {
    const msg = data.error || 'Failed to load dashboard';
    if (isAuthFailure(res.status)) {
      throw new Error(`${msg} Please log out and sign in again.`);
    }
    throw new Error(msg);
  }
  if (!data.feed || !data.overview) {
    throw new Error('Dashboard API returned an incomplete response');
  }
  return data;
}

function dateKey(value?: string | null) {
  return String(value || '').slice(0, 10);
}

function buildFeedFromAppointments(
  appointments: Appointment[],
  billingQueue: Appointment[],
  vaccinationsDue: VaccinationDueItem[]
): ReceptionistDashboardFeed {
  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 14);
  const horizonStr = horizon.toISOString().slice(0, 10);

  const byCreated = (a: Appointment, b: Appointment) =>
    String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  const byTime = (a: Appointment, b: Appointment) => {
    const d = dateKey(a.appointmentDate).localeCompare(dateKey(b.appointmentDate));
    if (d !== 0) return d;
    return String(a.appointmentTime || '').localeCompare(String(b.appointmentTime || ''));
  };

  const recentRequests = appointments
    .filter((a) => a.status === 'pending' || a.status === 'reschedule_offered')
    .sort(byCreated)
    .slice(0, 6);

  const todayConfirmed = appointments
    .filter(
      (a) =>
        dateKey(a.appointmentDate) === today &&
        (a.status === 'approved' || a.status === 'awaiting_payment')
    )
    .sort((a, b) => String(a.appointmentTime || '').localeCompare(String(b.appointmentTime || '')))
    .slice(0, 8);

  const upcomingConsultations = appointments
    .filter((a) => {
      const d = dateKey(a.appointmentDate);
      return (
        d > today &&
        d <= horizonStr &&
        (a.status === 'approved' || a.status === 'awaiting_payment')
      );
    })
    .sort(byTime)
    .slice(0, 8);

  return {
    recentRequests,
    todayConfirmed,
    upcomingConsultations,
    billingQueue: billingQueue.slice(0, 6),
    vaccinationsDue: vaccinationsDue.slice(0, 6),
  };
}

/** Loads dashboard data; falls back to legacy endpoints if /dashboard-feed is unavailable. */
export async function loadReceptionistDashboard(token: string): Promise<{
  overview: ReceptionistOverview;
  feed: ReceptionistDashboardFeed;
  warning?: string;
}> {
  try {
    return await fetchReceptionistDashboardFeed(token);
  } catch (primaryErr) {
    const primaryMsg =
      primaryErr instanceof Error ? primaryErr.message : 'Dashboard feed unavailable';

    const [overviewRes, vaccinationsRes, billingRes, appointmentsRes] =
      await Promise.allSettled([
        fetchReceptionistOverview(token),
        fetchVaccinationsDue(token, 30),
        fetchBillingQueue(token),
        fetchAppointments(token),
      ]);

    if (overviewRes.status !== 'fulfilled') {
      throw primaryErr;
    }

    const overview = overviewRes.value;
    const vaccinations =
      vaccinationsRes.status === 'fulfilled' ? vaccinationsRes.value : [];
    const billingQueue =
      billingRes.status === 'fulfilled' && billingRes.value.ok
        ? billingRes.value.data
        : [];
    const appointments =
      appointmentsRes.status === 'fulfilled' && appointmentsRes.value.ok
        ? appointmentsRes.value.data
        : [];

    const feed = buildFeedFromAppointments(appointments, billingQueue, vaccinations);

    return {
      overview,
      feed,
      warning:
        appointments.length > 0 || billingQueue.length > 0
          ? 'Some dashboard data loaded in compatibility mode. Restart the API server for the full feed.'
          : `${primaryMsg} Showing summary stats only — restart the API server and refresh.`,
    };
  }
}

export async function fetchReceptionistOverview(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/receptionist/overview`, {
    headers: authHeaders(token),
  });
  const data = await parseJson<{ overview: ReceptionistOverview; error?: string }>(res);
  if (!res.ok) throw new Error(data.error || 'Failed to load overview');
  return data.overview;
}

export async function fetchReceptionistPets(token: string, search?: string) {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetch(`${API_BASE_URL}/api/receptionist/pets${q}`, {
    headers: authHeaders(token),
  });
  const data = await parseJson<{ pets: ReceptionistPet[]; error?: string }>(res);
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data.pets;
}

export type ReceptionistPet = {
  id: number;
  petName: string;
  species: string;
  breed?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
};

export async function fetchReceptionistOwners(token: string, search?: string) {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await fetch(`${API_BASE_URL}/api/receptionist/owners${q}`, {
    headers: authHeaders(token),
  });
  const data = await parseJson<{ owners: ReceptionistOwner[]; error?: string }>(res);
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data.owners;
}

export type ReceptionistOwner = {
  id: number;
  email: string;
  fullName: string;
  mobileNumber?: string;
  petCount: number;
};

export type ReceptionistOrderItem = {
  name: string;
  quantity: number;
  unitPriceCents: number;
};

export type ReceptionistOrder = {
  id: number;
  userFullName: string;
  userEmail: string;
  paymentStatus: string;
  totalCents: number;
  fulfillmentStatus: string;
  trackingNote?: string;
  createdAt: string;
  items?: ReceptionistOrderItem[];
};

export async function fetchReceptionistOrders(
  token: string,
  params?: { page?: number; limit?: number; paymentStatus?: string }
) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.paymentStatus) q.set('paymentStatus', params.paymentStatus);
  const res = await fetch(`${API_BASE_URL}/api/receptionist/orders?${q}`, {
    headers: authHeaders(token),
  });
  const data = await parseJson<{
    orders: ReceptionistOrder[];
    totalPages: number;
    error?: string;
  }>(res);
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data;
}

export async function patchReceptionistOrder(
  token: string,
  id: number,
  body: { fulfillmentStatus?: string; trackingNote?: string }
) {
  const res = await fetch(`${API_BASE_URL}/api/receptionist/orders/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await parseJson<{ error?: string }>(res);
  if (!res.ok) throw new Error(data.error || 'Update failed');
  return data;
}

export async function broadcastReceptionistNotification(
  token: string,
  body: { title: string; message: string; role?: string; sendEmail?: boolean }
) {
  const res = await fetch(`${API_BASE_URL}/api/receptionist/notifications/broadcast`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await parseJson<{ sent: number; audience: string; error?: string }>(res);
  if (!res.ok) throw new Error(data.error || 'Broadcast failed');
  return data;
}

export async function runReceptionistReminders(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/receptionist/notifications/run-reminders`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  const data = await parseJson<Record<string, unknown> & { error?: string }>(res);
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data;
}

export async function fetchReceptionistNotificationHistory(token: string, type?: string) {
  const q = new URLSearchParams({ limit: '100' });
  if (type) q.set('type', type);
  const res = await fetch(`${API_BASE_URL}/api/receptionist/notifications?${q}`, {
    headers: authHeaders(token),
  });
  const data = await parseJson<{
    notifications: {
      id: number;
      type: string;
      title: string;
      message: string;
      userFullName?: string;
      createdAt: string;
    }[];
    error?: string;
  }>(res);
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data.notifications;
}

export type EodSummary = {
  date: string;
  appointmentsToday: number;
  checkedInToday: number;
  completedToday: number;
  pendingRequests: number;
  ordersPlacedToday: number;
  paymentsRecordedToday: number;
  paymentsTotalCents: number;
};

export async function fetchReceptionistEodSummary(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/receptionist/eod-summary`, {
    headers: authHeaders(token),
  });
  const data = await parseJson<{ summary: EodSummary; error?: string }>(res);
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data.summary;
}

export async function fetchVaccinationsDue(token: string, withinDays = 30) {
  const res = await fetch(
    `${API_BASE_URL}/api/receptionist/vaccinations-due?withinDays=${withinDays}`,
    { headers: authHeaders(token) }
  );
  const data = await parseJson<{ items: VaccinationDueItem[]; error?: string }>(res);
  if (!res.ok) return [];
  return data.items || [];
}

export type VaccinationDueItem = {
  id: number;
  vaccine_name: string;
  due_date: string;
  status: string;
  pet_name: string;
  owner_name: string;
  owner_email: string;
};
