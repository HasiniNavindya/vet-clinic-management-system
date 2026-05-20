import { API_BASE_URL, authHeaders } from './api';

export interface AdminUserListItem {
  id: number;
  email: string;
  fullName: string;
  mobileNumber?: string | null;
  role: string;
  roleLabel: string;
  accountStatus: string;
  createdAt: string;
}

export interface AdminUsersListResponse {
  users: AdminUserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUserDetailResponse {
  user: {
    id: number;
    email: string;
    fullName: string;
    mobileNumber?: string | null;
    address?: string | null;
    emergencyContact?: string | null;
    role: string;
    roleLabel: string;
    accountStatus: string;
    createdAt: string;
    updatedAt?: string | null;
  };
  summary: {
    petCount?: number;
    appointmentCountAsOwner?: number;
    appointmentCountAsDoctor?: number;
    doctorProfile?: {
      id: number;
      name: string;
      specialization: string;
      email?: string | null;
      phone?: string | null;
    } | null;
  };
  doctorApplication?: { id: number; status: string; specialization: string } | null;
}

export interface ActivityItem {
  kind: string;
  summary: string;
  meta?: string;
  occurredAt: string;
}

async function parseJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(res.status === 404 ? 'Admin API not found' : 'Invalid server response');
  }
}

export async function fetchAdminUsers(
  token: string,
  params: { search?: string; role?: string; status?: string; page?: number; limit?: number }
): Promise<AdminUsersListResponse> {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.role && params.role !== 'all') q.set('role', params.role);
  if (params.status && params.status !== 'all') q.set('status', params.status);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  const res = await fetch(`${API_BASE_URL}/api/admin/users?${q.toString()}`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to load users');
  return data as AdminUsersListResponse;
}

export async function fetchAdminUserDetail(
  token: string,
  id: number
): Promise<AdminUserDetailResponse> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to load user');
  return data as AdminUserDetailResponse;
}

export async function fetchAdminUserActivity(
  token: string,
  id: number
): Promise<{ activity: ActivityItem[] }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}/activity`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to load activity');
  return data as { activity: ActivityItem[] };
}

export async function patchAdminUser(
  token: string,
  id: number,
  body: { role?: string; accountStatus?: string }
): Promise<AdminUserDetailResponse['user']> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({
      ...(body.role !== undefined ? { role: body.role } : {}),
      ...(body.accountStatus !== undefined ? { accountStatus: body.accountStatus } : {}),
    }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Update failed');
  return (data as { user: AdminUserDetailResponse['user'] }).user;
}
