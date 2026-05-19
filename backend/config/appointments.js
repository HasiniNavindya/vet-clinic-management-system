/**
 * Appointment statuses and rules — single source of truth for API + UI.
 */
const APPOINTMENT_STATUSES = {
  pending: {
    id: 'pending',
    label: 'Pending',
    description: 'Waiting for clinic approval',
  },
  approved: {
    id: 'approved',
    label: 'Approved',
    description: 'Confirmed by the clinic',
  },
  rejected: {
    id: 'rejected',
    label: 'Rejected',
    description: 'Not accepted by the clinic',
  },
  completed: {
    id: 'completed',
    label: 'Completed',
    description: 'Visit finished',
  },
  cancelled: {
    id: 'cancelled',
    label: 'Cancelled',
    description: 'Cancelled by pet owner or clinic',
  },
};

const DEFAULT_STATUS = 'pending';

/** Map legacy DB values to canonical status */
const LEGACY_STATUS_MAP = {
  scheduled: 'pending',
  confirmed: 'approved',
  rescheduled: 'pending',
};

const OWNER_CANCELLABLE = new Set(['pending', 'approved']);
const OWNER_RESCHEDULABLE = new Set(['pending', 'approved']);
const STAFF_CAN_SET = new Set(['pending', 'approved', 'rejected', 'completed', 'cancelled']);
const ACTIVE_SLOT_STATUSES = new Set(['pending', 'approved', 'completed']);

const CLINIC_HOURS = { start: 8, end: 17, stepMinutes: 30 };

function normalizeStatus(value) {
  if (!value) return DEFAULT_STATUS;
  const key = String(value).toLowerCase().trim();
  if (APPOINTMENT_STATUSES[key]) return key;
  if (LEGACY_STATUS_MAP[key]) return LEGACY_STATUS_MAP[key];
  return DEFAULT_STATUS;
}

function getPublicStatuses() {
  return Object.values(APPOINTMENT_STATUSES);
}

function canOwnerCancel(status) {
  return OWNER_CANCELLABLE.has(normalizeStatus(status));
}

function canOwnerReschedule(status) {
  return OWNER_RESCHEDULABLE.has(normalizeStatus(status));
}

function canStaffSetStatus(status) {
  return STAFF_CAN_SET.has(normalizeStatus(status));
}

function isActiveForScheduling(status) {
  return ACTIVE_SLOT_STATUSES.has(normalizeStatus(status));
}

module.exports = {
  APPOINTMENT_STATUSES,
  DEFAULT_STATUS,
  CLINIC_HOURS,
  normalizeStatus,
  getPublicStatuses,
  canOwnerCancel,
  canOwnerReschedule,
  canStaffSetStatus,
  isActiveForScheduling,
};
