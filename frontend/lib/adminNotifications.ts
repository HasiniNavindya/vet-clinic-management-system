import { API_BASE_URL, authHeaders } from './api';

async function parseJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid response');
  }
}

export interface AdminNotification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  linkPath?: string | null;
  isRead: boolean;
  emailSent: boolean;
  createdAt: string;
  userEmail?: string;
  userFullName?: string;
}

export async function fetchAdminNotifications(
  token: string,
  params?: { type?: string; limit?: number }
): Promise<{ notifications: AdminNotification[] }> {
  const q = new URLSearchParams();
  if (params?.type) q.set('type', params.type);
  if (params?.limit) q.set('limit', String(params.limit));
  const res = await fetch(`${API_BASE_URL}/api/admin/notifications?${q}`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed');
  return data as { notifications: AdminNotification[] };
}

export async function fetchNotificationSystemStatus(token: string): Promise<{
  emailConfigured: boolean;
  reminderJobs: string[];
}> {
  const res = await fetch(`${API_BASE_URL}/api/admin/notifications/system-status`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed');
  return data as { emailConfigured: boolean; reminderJobs: string[] };
}

export async function broadcastAnnouncement(
  token: string,
  body: { title: string; message: string; role?: string; sendEmail?: boolean }
): Promise<{ sent: number; audience: string }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/notifications/broadcast`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Broadcast failed');
  return data as { sent: number; audience: string };
}

export async function runAdminReminders(token: string): Promise<{
  appointment: { sent: number; checked: number };
  vaccination: { sent: number; usersProcessed: number };
}> {
  const res = await fetch(`${API_BASE_URL}/api/admin/notifications/run-reminders`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({}),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed');
  return data as {
    appointment: { sent: number; checked: number };
    vaccination: { sent: number; usersProcessed: number };
  };
}
