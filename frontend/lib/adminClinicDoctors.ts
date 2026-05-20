import { API_BASE_URL, authHeaders } from './api';

export interface LinkedUserRef {
  id: number;
  email: string | null;
  fullName: string | null;
  accountStatus: string;
  role: string | null;
}

export interface AdminClinicDoctor {
  id: number;
  name: string;
  specialization: string;
  email: string | null;
  phone: string | null;
  image_url: string | null;
  bio: string | null;
  available_days: string[];
  userId: number | null;
  linkedUser: LinkedUserRef | null;
  appointmentsCount: number;
  created_at?: string;
}

async function parseJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(res.status === 404 ? 'API not found' : 'Invalid server response');
  }
}

export async function fetchClinicDoctors(token: string): Promise<{ doctors: AdminClinicDoctor[] }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/clinic-doctors`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to list doctors');
  return data as { doctors: AdminClinicDoctor[] };
}

export async function fetchClinicDoctor(
  token: string,
  id: number
): Promise<{ doctor: AdminClinicDoctor }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/clinic-doctors/${id}`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to load doctor');
  return data as { doctor: AdminClinicDoctor };
}

export async function createClinicDoctor(
  token: string,
  body: {
    name: string;
    specialization: string;
    email?: string;
    phone?: string;
    bio?: string;
    available_days?: string[];
  }
): Promise<{ doctor: AdminClinicDoctor }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/clinic-doctors`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to create doctor');
  return data as { doctor: AdminClinicDoctor };
}

export async function patchClinicDoctor(
  token: string,
  id: number,
  body: Partial<{
    name: string;
    specialization: string;
    email: string | null;
    phone: string | null;
    bio: string | null;
    available_days: string[];
  }>
): Promise<{ doctor: AdminClinicDoctor; message?: string }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/clinic-doctors/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Update failed');
  return data as { doctor: AdminClinicDoctor; message?: string };
}

export async function fetchDoctorScheduleSample(
  token: string,
  id: number
): Promise<{ slots: { id: number; appointment_date: string; appointment_time: string; status: string }[] }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/clinic-doctors/${id}/upcoming-schedule-sample`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to load schedule');
  return data as {
    slots: { id: number; appointment_date: string; appointment_time: string; status: string }[];
  };
}
