import { API_BASE_URL } from './api';

export interface PublicRole {
  id: string;
  label: string;
  selfRegisterable: boolean;
  requiresPetInfo: boolean;
  requiresDoctorApplication?: boolean;
  requiresReceptionistApplication?: boolean;
  dashboardPath: string;
}

/** Fallback when API is unavailable — mirrors backend/config/roles.js */
export const FALLBACK_ROLES: PublicRole[] = [
  {
    id: 'user',
    label: 'Pet Owner',
    selfRegisterable: true,
    requiresPetInfo: true,
    dashboardPath: '/dashboard/pet-owner',
  },
  {
    id: 'admin',
    label: 'Admin',
    selfRegisterable: true,
    requiresPetInfo: false,
    dashboardPath: '/dashboard/admin',
  },
  {
    id: 'doctor',
    label: 'Doctor',
    selfRegisterable: true,
    requiresPetInfo: false,
    requiresDoctorApplication: true,
    dashboardPath: '/dashboard/doctor',
  },
  {
    id: 'receptionist',
    label: 'Receptionist',
    selfRegisterable: true,
    requiresPetInfo: false,
    requiresReceptionistApplication: true,
    dashboardPath: '/dashboard/receptionist',
  },
];

export function normalizeRoleId(input?: string | null): string | null {
  if (!input) return null;
  const value = input.toLowerCase().trim();
  if (value === 'staff') return 'receptionist';
  for (const role of FALLBACK_ROLES) {
    if (role.id === value) return role.id;
    if (value === 'pet owner' || value === 'petowner' || value === 'owner') {
      return 'user';
    }
    if (value === role.label.toLowerCase()) return role.id;
  }
  if (['admin', 'doctor', 'receptionist', 'user'].includes(value)) return value;
  return null;
}

export function getRoleFromList(roles: PublicRole[], roleId?: string | null): PublicRole | undefined {
  const normalized = normalizeRoleId(roleId);
  if (!normalized) return undefined;
  return roles.find((r) => r.id === normalized);
}

export function getDashboardPath(roles: PublicRole[], roleId?: string | null): string {
  const normalized = normalizeRoleId(roleId);
  if (!normalized) return '/dashboard/pet-owner';
  const list = roles.length > 0 ? roles : FALLBACK_ROLES;
  return (
    getRoleFromList(list, normalized)?.dashboardPath ??
    getRoleFromList(FALLBACK_ROLES, normalized)?.dashboardPath ??
    '/dashboard/pet-owner'
  );
}

/** Role-aware dashboard URL for nav links and redirects (avoids legacy /dashboard flash). */
export function resolveUserDashboardPath(
  user?: { role?: string; dashboardPath?: string } | null
): string {
  if (!user) return '/login';
  if (user.dashboardPath) return user.dashboardPath;
  return getDashboardPath([], user.role);
}

export function getRoleLabel(roles: PublicRole[], roleId?: string | null): string {
  return getRoleFromList(roles, roleId)?.label || roleId || 'User';
}

export async function fetchPublicRoles(): Promise<PublicRole[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/roles`, { cache: 'no-store' });
    if (!res.ok) {
      console.warn(
        `[roles] GET /auth/roles returned ${res.status}. Is the backend running? (cd backend && npm start)`
      );
      return FALLBACK_ROLES;
    }
    const text = await res.text();
    const data = JSON.parse(text) as { roles?: PublicRole[] };
    return Array.isArray(data.roles) ? data.roles : FALLBACK_ROLES;
  } catch (err) {
    console.warn('[roles] Failed to load roles from API, using fallback.', err);
    return FALLBACK_ROLES;
  }
}

export function userHasRole(userRole: string | undefined, allowed: string[]): boolean {
  const normalized = normalizeRoleId(userRole);
  if (!normalized) return false;
  return allowed.map((r) => normalizeRoleId(r)).filter(Boolean).includes(normalized);
}
