/** Vaccination reminder and status rules — single source of truth. */
const REMINDER_DAYS_BEFORE = 7;
const REMINDER_RESEND_COOLDOWN_DAYS = 1;

const VACCINATION_STATUS = {
  completed: { id: 'completed', label: 'Completed', description: 'Vaccine administered' },
  overdue: { id: 'overdue', label: 'Overdue', description: 'Past due date' },
  due_today: { id: 'due_today', label: 'Due today', description: 'Due today' },
  upcoming: { id: 'upcoming', label: 'Upcoming', description: 'Due within reminder window' },
  scheduled: { id: 'scheduled', label: 'Scheduled', description: 'Future due date' },
};

const REMINDER_TYPES = {
  overdue: { id: 'overdue', label: 'Overdue vaccination' },
  due_today: { id: 'due_today', label: 'Due today' },
  upcoming: { id: 'upcoming', label: 'Upcoming vaccination' },
};

function getPublicVaccinationStatuses() {
  return Object.values(VACCINATION_STATUS);
}

function computeVaccinationStatus(row, today = new Date()) {
  const todayStr = today.toISOString().slice(0, 10);
  if (row.administered_date) return 'completed';

  const due = typeof row.due_date === 'string'
    ? row.due_date.slice(0, 10)
    : row.due_date;

  if (due < todayStr) return 'overdue';
  if (due === todayStr) return 'due_today';

  const upcomingLimit = new Date(today);
  upcomingLimit.setDate(upcomingLimit.getDate() + REMINDER_DAYS_BEFORE);
  if (due <= upcomingLimit.toISOString().slice(0, 10)) return 'upcoming';

  return 'scheduled';
}

function getReminderTypeForStatus(status) {
  if (status === 'overdue') return 'overdue';
  if (status === 'due_today') return 'due_today';
  if (status === 'upcoming') return 'upcoming';
  return null;
}

module.exports = {
  REMINDER_DAYS_BEFORE,
  REMINDER_RESEND_COOLDOWN_DAYS,
  VACCINATION_STATUS,
  REMINDER_TYPES,
  getPublicVaccinationStatuses,
  computeVaccinationStatus,
  getReminderTypeForStatus,
};
