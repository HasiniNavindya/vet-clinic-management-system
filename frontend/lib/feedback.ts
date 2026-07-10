import { apiFetch, authHeaders } from './api';

export type AppointmentFeedback = {
  id: number;
  rating: number;
  comment: string | null;
  status?: string;
  createdAt: string;
};

export type PublicFeedback = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  userName: string;
  doctorName: string | null;
  petName: string | null;
};

export async function fetchAppointmentFeedback(token: string, appointmentId: number | string) {
  return apiFetch<{ feedback: AppointmentFeedback | null }>(
    `/api/feedback/appointment/${appointmentId}`,
    { headers: authHeaders(token) }
  );
}

export async function submitAppointmentFeedback(
  token: string,
  body: { appointmentId: number; rating: number; comment?: string }
) {
  return apiFetch<{ message: string; feedback: AppointmentFeedback }>('/api/feedback', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

export async function fetchApprovedFeedback() {
  return apiFetch<{ feedback: PublicFeedback[] }>('/api/feedback/approved');
}
