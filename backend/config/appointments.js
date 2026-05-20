/**
 * Appointment statuses and rules — single source of truth for API + UI.
 */
const APPOINTMENT_STATUSES = {
  pending: {
    id: 'pending',
    label: 'Pending review',
    description: 'Request submitted — waiting for clinic approval',
  },
  awaiting_payment: {
    id: 'awaiting_payment',
    label: 'Awaiting payment',
    description: 'Approved by clinic — complete online payment to confirm',
  },
  approved: {
    id: 'approved',
    label: 'Confirmed',
    description: 'Booking confirmed and payment received',
  },
  rejected: {
    id: 'rejected',
    label: 'Declined',
    description: 'Request was not accepted by the clinic',
  },
  reschedule_offered: {
    id: 'reschedule_offered',
    label: 'Reschedule offered',
    description: 'Clinic proposed a new date and time',
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

const LEGACY_STATUS_MAP = {
  scheduled: 'pending',
  confirmed: 'approved',
  rescheduled: 'pending',
};

const OWNER_CANCELLABLE = new Set(['pending', 'awaiting_payment', 'approved', 'reschedule_offered']);
const OWNER_RESCHEDULABLE = new Set(['pending', 'approved']);
const STAFF_CAN_SET = new Set([
  'pending',
  'awaiting_payment',
  'approved',
  'rejected',
  'reschedule_offered',
  'completed',
  'cancelled',
]);
const ACTIVE_SLOT_STATUSES = new Set([
  'pending',
  'awaiting_payment',
  'approved',
  'completed',
  'reschedule_offered',
]);

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

function canOwnerPay(status) {
  return normalizeStatus(status) === 'awaiting_payment';
}

function canStaffReview(status) {
  return normalizeStatus(status) === 'pending';
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
  canOwnerPay,
  canStaffReview,
};
