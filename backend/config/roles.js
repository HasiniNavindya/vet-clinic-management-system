/**
 * Single source of truth for application roles.
 * Add or change roles here — auth routes and the public /auth/roles API read from this file.
 */
const ROLES = {
  user: {
    id: 'user',
    label: 'Pet Owner',
    aliases: ['pet owner', 'petowner', 'owner', 'user'],
    selfRegisterable: true,
    requiresPetInfo: true,
    dashboardPath: '/dashboard/pet-owner',
  },
  admin: {
    id: 'admin',
    label: 'Admin',
    aliases: ['admin', 'administrator'],
    selfRegisterable: true,
    requiresPetInfo: false,
    dashboardPath: '/dashboard/admin',
  },
  doctor: {
    id: 'doctor',
    label: 'Doctor',
    aliases: ['doctor', 'vet', 'veterinarian'],
    selfRegisterable: true,
    requiresPetInfo: false,
    requiresDoctorApplication: true,
    dashboardPath: '/dashboard/doctor',
  },
  staff: {
    id: 'staff',
    label: 'Staff',
    aliases: ['staff', 'receptionist'],
    selfRegisterable: true,
    requiresPetInfo: false,
    dashboardPath: '/dashboard/calendar',
  },
};

const ALL_ROLE_IDS = Object.keys(ROLES);

function normalizeRole(input) {
  if (input === undefined || input === null || input === '') return null;
  const value = String(input).toLowerCase().trim();
  for (const role of Object.values(ROLES)) {
    if (role.id === value || role.aliases.includes(value)) {
      return role.id;
    }
  }
  return null;
}

function getRoleConfig(roleId) {
  const normalized = normalizeRole(roleId);
  return normalized ? ROLES[normalized] : null;
}

function getPublicRoles() {
  return Object.values(ROLES).map((role) => ({
    id: role.id,
    label: role.label,
    selfRegisterable: role.selfRegisterable,
    requiresPetInfo: role.requiresPetInfo,
    requiresDoctorApplication: Boolean(role.requiresDoctorApplication),
    dashboardPath: role.dashboardPath,
  }));
}

function requiresDoctorApplication(roleId) {
  const config = getRoleConfig(roleId);
  return Boolean(config?.requiresDoctorApplication);
}

function getDashboardPath(roleId) {
  const config = getRoleConfig(roleId);
  return config?.dashboardPath || '/dashboard';
}

function canSelfRegister(roleId) {
  const config = getRoleConfig(roleId);
  return Boolean(config?.selfRegisterable);
}

module.exports = {
  ROLES,
  ALL_ROLE_IDS,
  normalizeRole,
  getRoleConfig,
  getPublicRoles,
  getDashboardPath,
  canSelfRegister,
  requiresDoctorApplication,
};
