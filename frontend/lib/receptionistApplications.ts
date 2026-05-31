import { API_BASE_URL, authHeaders } from './api';

export interface ReceptionistRegisterPayload {
  email: string;
  password: string;
  fullName: string;
  mobileNumber?: string;
  address?: string;
}

export interface ReceptionistApplication {
  id: number;
  userId: number;
  status: string;
  rejectionReason?: string;
  adminNotes?: string;
  applicant: {
    email: string;
    fullName: string;
    mobileNumber?: string;
    address?: string;
    accountStatus?: string;
  };
}

async function parseJsonResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    if (!res.ok) {
      throw new Error(
        res.status === 404
          ? 'Registration API not found. Restart the backend: cd backend && npm start'
          : `Server error (${res.status}). Expected JSON but received an HTML error page.`
      );
    }
    throw new Error('Invalid response from server.');
  }
}

export async function submitReceptionistApplication(payload: ReceptionistRegisterPayload) {
  const res = await fetch(`${API_BASE_URL}/auth/register-receptionist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) throw new Error((data.error as string) || 'Application failed');
  return data as { pendingApproval: boolean; message: string };
}

export async function fetchReceptionistApplications(
  token: string,
  status?: string
): Promise<ReceptionistApplication[]> {
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`${API_BASE_URL}/api/receptionist-applications${q}`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load applications');
  return data.applications || [];
}

export async function approveReceptionistApplication(
  token: string,
  id: number,
  adminNotes?: string
) {
  const res = await fetch(`${API_BASE_URL}/api/receptionist-applications/${id}/approve`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminNotes }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Approval failed');
  return data;
}

export async function rejectReceptionistApplication(
  token: string,
  id: number,
  rejectionReason: string,
  adminNotes?: string
) {
  const res = await fetch(`${API_BASE_URL}/api/receptionist-applications/${id}/reject`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ rejectionReason, adminNotes }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Rejection failed');
  return data;
}
