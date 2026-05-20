const pool = require('../db');
const {
  REMINDER_DAYS_BEFORE,
  REMINDER_RESEND_COOLDOWN_DAYS,
  computeVaccinationStatus,
  getReminderTypeForStatus,
} = require('../config/vaccinations');

const VACCINATION_SELECT = `
  SELECT v.*,
         p.pet_name,
         p.user_id,
         d.name AS doctor_name
  FROM vaccinations v
  JOIN pets_owned p ON v.pet_id = p.id
  LEFT JOIN doctors d ON v.doctor_id = d.id
`;

function mapVaccination(row) {
  if (!row) return null;
  const status = computeVaccinationStatus(row);
  return {
    id: row.id,
    petId: row.pet_id,
    petName: row.pet_name,
    userId: row.user_id,
    vaccineName: row.vaccine_name,
    dueDate: row.due_date,
    administeredDate: row.administered_date,
    intervalDays: row.interval_days,
    notes: row.notes,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchVaccinationById(id) {
  const result = await pool.query(`${VACCINATION_SELECT} WHERE v.id = $1`, [id]);
  return result.rows[0] ? mapVaccination(result.rows[0]) : null;
}

async function listVaccinations({ petId, userId, role, filter }) {
  const params = [];
  let sql = `${VACCINATION_SELECT} WHERE 1=1`;

  if (petId) {
    params.push(petId);
    sql += ` AND v.pet_id = $${params.length}`;
  }

  if (role === 'user') {
    params.push(userId);
    sql += ` AND p.user_id = $${params.length}`;
  }

  sql += ' ORDER BY v.due_date ASC, v.id ASC';

  const result = await pool.query(sql, params);
  let rows = result.rows.map(mapVaccination);

  if (filter && filter !== 'all') {
    rows = rows.filter((r) => {
      if (filter === 'history') return r.status === 'completed';
      if (filter === 'overdue') return r.status === 'overdue';
      if (filter === 'upcoming') {
        return ['upcoming', 'due_today'].includes(r.status);
      }
      return r.status === filter;
    });
  }

  return rows;
}

async function getVaccinationDashboard(userId, role) {
  const all = await listVaccinations({ userId, role, filter: 'all' });
  return {
    total: all.length,
    completed: all.filter((v) => v.status === 'completed').length,
    overdue: all.filter((v) => v.status === 'overdue'),
    dueToday: all.filter((v) => v.status === 'due_today'),
    upcoming: all.filter((v) => ['upcoming', 'scheduled'].includes(v.status) && !v.administeredDate),
    history: all.filter((v) => v.status === 'completed').slice(0, 10),
  };
}

async function processAndGetReminders(userId) {
  const pref = await pool.query(
    'SELECT vaccination_reminders FROM user_preferences WHERE user_id = $1',
    [userId]
  );
  if (pref.rows[0] && pref.rows[0].vaccination_reminders === false) {
    return [];
  }

  const pending = await pool.query(
    `SELECT v.*, p.pet_name, p.user_id
     FROM vaccinations v
     JOIN pets_owned p ON v.pet_id = p.id
     WHERE p.user_id = $1 AND v.administered_date IS NULL
     ORDER BY v.due_date ASC`,
    [userId]
  );

  const reminders = [];

  for (const row of pending.rows) {
    const status = computeVaccinationStatus(row);
    const reminderType = getReminderTypeForStatus(status);
    if (!reminderType) continue;

    const message = buildReminderMessage(row.pet_name, row.vaccine_name, row.due_date, status);

    const existing = await pool.query(
      `SELECT id FROM vaccination_reminder_log
       WHERE vaccination_id = $1 AND reminder_type = $2
         AND sent_at > NOW() - ($3 || ' days')::INTERVAL`,
      [row.id, reminderType, String(REMINDER_RESEND_COOLDOWN_DAYS)]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO vaccination_reminder_log (vaccination_id, user_id, reminder_type, channel, message)
         VALUES ($1, $2, $3, 'in_app', $4)`,
        [row.id, userId, reminderType, message]
      );
    }

    reminders.push({
      vaccinationId: row.id,
      petId: row.pet_id,
      petName: row.pet_name,
      vaccineName: row.vaccine_name,
      dueDate: row.due_date,
      status,
      reminderType,
      message,
    });
  }

  const log = await pool.query(
    `SELECT l.*, v.vaccine_name, v.due_date, p.pet_name
     FROM vaccination_reminder_log l
     JOIN vaccinations v ON l.vaccination_id = v.id
     JOIN pets_owned p ON v.pet_id = p.id
     WHERE l.user_id = $1
     ORDER BY l.sent_at DESC
     LIMIT 50`,
    [userId]
  );

  return {
    active: reminders,
    recent: log.rows.map((r) => ({
      id: r.id,
      vaccinationId: r.vaccination_id,
      petName: r.pet_name,
      vaccineName: r.vaccine_name,
      dueDate: r.due_date,
      reminderType: r.reminder_type,
      message: r.message,
      sentAt: r.sent_at,
    })),
    reminderDaysBefore: REMINDER_DAYS_BEFORE,
  };
}

function buildReminderMessage(petName, vaccineName, dueDate, status) {
  const due = typeof dueDate === 'string' ? dueDate.slice(0, 10) : dueDate;
  if (status === 'overdue') {
    return `${petName}'s ${vaccineName} vaccination was due on ${due}. Please schedule a visit.`;
  }
  if (status === 'due_today') {
    return `${petName}'s ${vaccineName} vaccination is due today.`;
  }
  return `${petName}'s ${vaccineName} vaccination is due on ${due}.`;
}

module.exports = {
  mapVaccination,
  fetchVaccinationById,
  listVaccinations,
  getVaccinationDashboard,
  processAndGetReminders,
};
