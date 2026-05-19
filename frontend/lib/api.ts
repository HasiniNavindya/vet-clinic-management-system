export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export function authHeaders(token: string | null, extra: Record<string, string> = {}): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T; ok: boolean; status: number }> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = (await response.json().catch(() => ({}))) as T;
  return { data, ok: response.ok, status: response.status };
}
