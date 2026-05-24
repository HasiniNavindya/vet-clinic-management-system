import { apiFetch, authHeaders } from './api';

export type AppointmentFeedback = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
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
