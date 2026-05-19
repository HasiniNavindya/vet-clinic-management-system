import { API_BASE_URL } from './api';

export interface PublicRole {
  id: string;
  label: string;
  selfRegisterable: boolean;
  requiresPetInfo: boolean;
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
    dashboardPath: '/dashboard',
  },
  {
    id: 'doctor',
    label: 'Doctor',
    selfRegisterable: true,
    requiresPetInfo: false,
    dashboardPath: '/dashboard/doctors',
  },
  {
    id: 'staff',
    label: 'Staff',
    selfRegisterable: true,
    requiresPetInfo: false,
    dashboardPath: '/dashboard/calendar',
  },
];

export function normalizeRoleId(input?: string | null): string | null {
  if (!input) return null;
  const value = input.toLowerCase().trim();
  for (const role of FALLBACK_ROLES) {
    if (role.id === value) return role.id;
    if (value === 'pet owner' || value === 'petowner' || value === 'owner') {
      return 'user';
    }
    if (value === role.label.toLowerCase()) return role.id;
  }
  if (['admin', 'doctor', 'staff'].includes(value)) return value;
  return null;
}

export function getRoleFromList(roles: PublicRole[], roleId?: string | null): PublicRole | undefined {
  const normalized = normalizeRoleId(roleId);
  if (!normalized) return undefined;
  return roles.find((r) => r.id === normalized);
}

export function getDashboardPath(roles: PublicRole[], roleId?: string | null): string {
  return getRoleFromList(roles, roleId)?.dashboardPath || '/dashboard';
}

export function getRoleLabel(roles: PublicRole[], roleId?: string | null): string {
  return getRoleFromList(roles, roleId)?.label || roleId || 'User';
}

export async function fetchPublicRoles(): Promise<PublicRole[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/roles`, { cache: 'no-store' });
    if (!res.ok) return FALLBACK_ROLES;
    const data = await res.json();
    return Array.isArray(data.roles) ? data.roles : FALLBACK_ROLES;
  } catch {
    return FALLBACK_ROLES;
  }
}

export function userHasRole(userRole: string | undefined, allowed: string[]): boolean {
  const normalized = normalizeRoleId(userRole);
  if (!normalized) return false;
  return allowed.map((r) => normalizeRoleId(r)).filter(Boolean).includes(normalized);
}
