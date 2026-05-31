/**
 * Single source of truth for application roles.
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
  receptionist: {
    id: 'receptionist',
    label: 'Receptionist',
    aliases: ['receptionist', 'staff', 'reception'],
    selfRegisterable: true,
    requiresPetInfo: false,
    requiresReceptionistApplication: true,
    dashboardPath: '/dashboard/receptionist',
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
    requiresReceptionistApplication: Boolean(role.requiresReceptionistApplication),
    dashboardPath: role.dashboardPath,
  }));
}

function requiresDoctorApplication(roleId) {
  const config = getRoleConfig(roleId);
  return Boolean(config?.requiresDoctorApplication);
}

function requiresReceptionistApplication(roleId) {
  const config = getRoleConfig(roleId);
  return Boolean(config?.requiresReceptionistApplication);
}

function getDashboardPath(roleId) {
  const config = getRoleConfig(roleId);
  return config?.dashboardPath || '/dashboard';
}

function canSelfRegister(roleId) {
  const config = getRoleConfig(roleId);
  return Boolean(config?.selfRegisterable);
}

/** Roles that can manage front-desk operations (appointments, payments, records entry). */
const CLINIC_OPERATIONS_ROLES = ['admin', 'doctor', 'receptionist'];

module.exports = {
  ROLES,
  ALL_ROLE_IDS,
  CLINIC_OPERATIONS_ROLES,
  normalizeRole,
  getRoleConfig,
  getPublicRoles,
  getDashboardPath,
  canSelfRegister,
  requiresDoctorApplication,
  requiresReceptionistApplication,
};
