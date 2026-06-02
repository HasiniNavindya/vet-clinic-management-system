import { API_BASE_URL, authHeaders } from './api';

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
};

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

export type ReceptionistOrder = {
  id: number;
  userFullName: string;
  userEmail: string;
  paymentStatus: string;
  totalCents: number;
  fulfillmentStatus: string;
  trackingNote?: string;
  createdAt: string;
};

export async function fetchReceptionistOrders(
  token: string,
  params?: { page?: number; paymentStatus?: string }
) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
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
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data.items;
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
