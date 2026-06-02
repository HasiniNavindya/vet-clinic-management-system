import { API_BASE_URL, authHeaders } from './api';

export interface DoctorApplicationMeta {
  specializations: string[];
  weekDays: string[];
}

export interface DoctorRegisterPayload {
  email: string;
  password: string;
  fullName: string;
  mobileNumber?: string;
  address?: string;
  emergencyContact?: string;
  specialization: string;
  licenseNumber: string;
  qualifications: string;
  education?: string;
  yearsOfExperience?: number;
  bio?: string;
  availableDays?: string[];
  /** Base64 file contents (data URL or raw base64) */
  licenseDocumentBase64: string;
  licenseDocumentFilename: string;
  profileImageBase64?: string;
  profileImageFilename?: string;
}

export interface DoctorApplication {
  id: number;
  userId: number;
  specialization: string;
  licenseNumber: string;
  qualifications: string;
  education?: string;
  yearsOfExperience?: number;
  bio?: string;
  availableDays: string[];
  licenseDocumentUrl?: string;
  status: string;
  adminNotes?: string;
  rejectionReason?: string;
  applicant: {
    email: string;
    fullName: string;
    mobileNumber?: string;
    address?: string;
    accountStatus?: string;
  };
}

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    if (!res.ok) {
      throw new Error(
        res.status === 404
          ? 'Registration service not found. Restart the backend (node server.js) on port 5000.'
          : `Server error (${res.status}). Expected JSON but received non-JSON response.`
      );
    }
    throw new Error('Invalid response from server.');
  }
}

export async function fetchDoctorApplicationMeta(): Promise<DoctorApplicationMeta> {
  const paths = ['/auth/doctor-application-meta', '/api/doctor-applications/meta'];
  let lastErr: Error | null = null;
  for (const p of paths) {
    try {
      const res = await fetch(`${API_BASE_URL}${p}`, { cache: 'no-store' });
      const data = (await parseJsonResponse(res)) as DoctorApplicationMeta & { error?: string };
      if (res.ok && Array.isArray(data.specializations) && Array.isArray(data.weekDays)) {
        return data;
      }
      lastErr = new Error(data.error || `Failed to load form options (${res.status})`);
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error('Failed to load form options');
    }
  }
  throw lastErr || new Error('Failed to load form options');
}

export async function submitDoctorApplication(
  payload: DoctorRegisterPayload
): Promise<{ pendingApproval: boolean; message: string }> {
  const paths = ['/auth/register-doctor', '/api/doctor-applications/register'];
  for (const p of paths) {
    const res = await fetch(`${API_BASE_URL}${p}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await parseJsonResponse(res)) as { error?: string; pendingApproval?: boolean; message?: string };
    if (res.ok) {
      return {
        pendingApproval: Boolean(data.pendingApproval),
        message: data.message || 'Submitted',
      };
    }
    if (res.status !== 404) {
      throw new Error(data.error || 'Application failed');
    }
  }
  throw new Error('Application failed: registration endpoint not found. Restart the backend.');
}

export async function fetchDoctorApplications(
  token: string,
  status?: string
): Promise<DoctorApplication[]> {
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`${API_BASE_URL}/api/doctor-applications/admin/list${q}`, {
    headers: authHeaders(token),
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to load applications');
  return data as DoctorApplication[];
}

export async function approveDoctorApplication(
  token: string,
  id: number,
  adminNotes?: string
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/doctor-applications/admin/${id}/approve`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ adminNotes }),
  });
  const data = (await parseJsonResponse(res)) as { error?: string };
  if (!res.ok) throw new Error(data.error || 'Approval failed');
}

export async function rejectDoctorApplication(
  token: string,
  id: number,
  rejectionReason: string,
  adminNotes?: string
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/doctor-applications/admin/${id}/reject`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ rejectionReason, adminNotes }),
  });
  const data = (await parseJsonResponse(res)) as { error?: string };
  if (!res.ok) throw new Error(data.error || 'Rejection failed');
}

export async function fetchDoctorDashboard(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/doctor-applications/doctor/dashboard`, {
    headers: authHeaders(token),
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to load dashboard');
  return data;
}
