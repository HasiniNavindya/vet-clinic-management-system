const pool = require('../db');
const { NOTIFICATION_TYPES } = require('../config/notifications');
const { sendEmail } = require('./emailService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

function formatMoney(cents, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function mapNotificationRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    linkPath: row.link_path,
    referenceType: row.reference_type,
    referenceId: row.reference_id,
    isRead: row.is_read,
    emailSent: row.email_sent,
    createdAt: row.created_at,
  };
}

async function getUserPrefs(userId) {
  const result = await pool.query(
    `SELECT vaccination_reminders, appointment_updates, email_notifications
     FROM user_preferences WHERE user_id = $1`,
    [userId]
  );
  const row = result.rows[0] || {};
  return {
    vaccinationReminders: row.vaccination_reminders !== false,
    appointmentUpdates: row.appointment_updates !== false,
    emailNotifications: row.email_notifications !== false,
  };
}

async function getUserEmail(userId) {
  const result = await pool.query(
    'SELECT email, full_name FROM auth_users WHERE id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

async function createNotification({
  userId,
  type,
  title,
  message,
  linkPath = null,
  referenceType = null,
  referenceId = null,
  sendEmail: shouldSendEmail = true,
  emailSubject = null,
  emailBody = null,
}) {
  const prefs = await getUserPrefs(userId);

  const insert = await pool.query(
    `INSERT INTO notifications (
       user_id, type, title, message, link_path, reference_type, reference_id
     ) VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, type, title, message, linkPath, referenceType, referenceId]
  );

  let emailSent = false;
  if (shouldSendEmail && prefs.emailNotifications) {
    const user = await getUserEmail(userId);
    if (user?.email) {
      const subject = emailSubject || title;
      const body =
        emailBody ||
        `${message}\n\nView details: ${FRONTEND_URL}${linkPath || '/dashboard/pet-owner/notifications'}`;
      const result = await sendEmail({
        to: user.email,
        subject: `[Carlisle Pet Care] ${subject}`,
        text: `Hello ${user.full_name || 'Pet Owner'},\n\n${body}\n\n— Carlisle Pet Care`,
      });
      emailSent = result.ok;
    }
  }

  if (emailSent) {
    await pool.query('UPDATE notifications SET email_sent = true WHERE id = $1', [
      insert.rows[0].id,
    ]);
  }

  return mapNotificationRow({ ...insert.rows[0], email_sent: emailSent });
}

async function listNotifications(userId, { limit = 50, unreadOnly = false } = {}) {
  const params = [userId];
  let sql = `SELECT * FROM notifications WHERE user_id = $1`;
  if (unreadOnly) {
    sql += ' AND is_read = false';
  }
  sql += ` ORDER BY created_at DESC LIMIT ${Number(limit)}`;
  const result = await pool.query(sql, params);
  return result.rows.map(mapNotificationRow);
}

async function getUnreadCount(userId) {
  const result = await pool.query(
    'SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = false',
    [userId]
  );
  return result.rows[0]?.count || 0;
}

async function markAsRead(notificationId, userId) {
  const result = await pool.query(
    `UPDATE notifications SET is_read = true
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [notificationId, userId]
  );
  return mapNotificationRow(result.rows[0]);
}

async function markAllRead(userId) {
  await pool.query(
    'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
    [userId]
  );
  return { ok: true };
}

async function notifyPaymentConfirmation(userId, transaction) {
  const amount = formatMoney(transaction.amountCents, transaction.currency || 'usd');
  const title = 'Payment confirmed';
  const message = `Your payment of ${amount} for ${transaction.description || 'your order'} was successful.`;
  let linkPath = '/dashboard/pet-owner/payments';
  if (transaction.referenceType === 'appointment' && transaction.referenceId) {
    linkPath = `/dashboard/pet-owner/appointments/${transaction.referenceId}`;
  }

  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.PAYMENT_CONFIRMATION,
    title,
    message,
    linkPath,
    referenceType: transaction.referenceType || 'payment',
    referenceId: transaction.referenceId || transaction.id,
    emailSubject: title,
    emailBody: message,
  });
}

async function notifyAppointmentBooked(userId, appointment) {
  const date = appointment.appointmentDate;
  const time = appointment.appointmentTime;
  const doctor = appointment.doctorName || 'your veterinarian';
  const title = 'Appointment booked';
  const message = `Your appointment with Dr. ${doctor} on ${date} at ${time} is confirmed. Payment received.`;

  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.APPOINTMENT_CONFIRMED,
    title,
    message,
    linkPath: `/dashboard/pet-owner/appointments/${appointment.id}`,
    referenceType: 'appointment',
    referenceId: appointment.id,
    emailSubject: title,
    emailBody: message,
  });
}

async function notifyAppointmentStatusChange(userId, appointment, status) {
  const prefs = await getUserPrefs(userId);
  if (!prefs.appointmentUpdates) return null;

  const labels = {
    pending: 'Appointment request received',
    awaiting_payment: 'Appointment approved — payment required',
    approved: 'Appointment confirmed',
    rejected: 'Appointment declined',
    reschedule_offered: 'New time proposed',
    cancelled: 'Appointment cancelled',
    completed: 'Visit completed',
  };
  const title = labels[status] || 'Appointment update';
  const message =
    appointment.confirmationMessage ||
    (status === 'reschedule_offered' && appointment.proposedAppointmentDate
      ? `The clinic proposed ${appointment.proposedAppointmentDate} at ${appointment.proposedAppointmentTime || appointment.appointmentTime}. Open your appointment to accept or contact the clinic.`
      : `Your appointment on ${appointment.appointmentDate} at ${appointment.appointmentTime} was updated.`);

  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.APPOINTMENT_STATUS,
    title,
    message,
    linkPath: `/dashboard/pet-owner/appointments/${appointment.id}`,
    referenceType: 'appointment',
    referenceId: appointment.id,
    emailSubject: title,
    emailBody: message,
  });
}

async function notifyVaccinationAlert(userId, { petName, vaccineName, dueDate, status, message }) {
  const prefs = await getUserPrefs(userId);
  if (!prefs.vaccinationReminders) return null;

  const title =
    status === 'overdue'
      ? `Vaccination overdue — ${petName}`
      : `Vaccination due — ${petName}`;

  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.VACCINATION_ALERT,
    title,
    message,
    linkPath: '/dashboard/pet-owner/health?tab=vaccinations',
    referenceType: 'vaccination',
    emailSubject: title,
    emailBody: `${message}\n\nDue date: ${dueDate}`,
  });
}

async function notifyAppointmentReminder(userId, appointment) {
  const prefs = await getUserPrefs(userId);
  if (!prefs.appointmentUpdates) return null;

  const existing = await pool.query(
    `SELECT id FROM notifications
     WHERE user_id = $1 AND type = $2 AND reference_id = $3
       AND created_at > NOW() - INTERVAL '2 days'`,
    [userId, NOTIFICATION_TYPES.APPOINTMENT_REMINDER, appointment.id]
  );
  if (existing.rows.length > 0) return null;

  const title = 'Appointment reminder';
  const message = `Reminder: You have an appointment with Dr. ${appointment.doctorName || 'your vet'} on ${appointment.appointmentDate} at ${appointment.appointmentTime}. Please arrive 10 minutes early.`;

  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.APPOINTMENT_REMINDER,
    title,
    message,
    linkPath: `/dashboard/pet-owner/appointments/${appointment.id}`,
    referenceType: 'appointment',
    referenceId: appointment.id,
    emailSubject: title,
    emailBody: message,
  });
}

async function processAppointmentReminders() {
  const result = await pool.query(
    `SELECT a.id, a.user_id, a.appointment_date, a.appointment_time, a.status,
            d.name AS doctor_name
     FROM appointments a
     LEFT JOIN doctors d ON a.doctor_id = d.id
     WHERE a.status = 'approved'
       AND a.appointment_date = CURRENT_DATE + INTERVAL '1 day'`
  );

  let sent = 0;
  for (const row of result.rows) {
    const appointment = {
      id: row.id,
      appointmentDate: row.appointment_date,
      appointmentTime:
        typeof row.appointment_time === 'string'
          ? row.appointment_time.slice(0, 5)
          : row.appointment_time,
      doctorName: row.doctor_name,
    };
    const n = await notifyAppointmentReminder(row.user_id, appointment);
    if (n) sent += 1;
  }
  return { sent, checked: result.rows.length };
}

async function listNotificationsAdmin({ limit = 80, type } = {}) {
  const params = [];
  let sql = `
    SELECT n.*, u.email AS user_email, u.full_name AS user_full_name
    FROM notifications n
    LEFT JOIN auth_users u ON u.id = n.user_id
    WHERE 1=1
  `;
  if (type) {
    params.push(type);
    sql += ` AND n.type = $${params.length}`;
  }
  sql += ` ORDER BY n.created_at DESC LIMIT ${Number(limit)}`;
  const result = await pool.query(sql, params);
  return result.rows.map((row) => ({
    ...mapNotificationRow(row),
    userEmail: row.user_email,
    userFullName: row.user_full_name,
  }));
}

async function broadcastAnnouncement({
  title,
  message,
  roleFilter = null,
  sendEmail = true,
  linkPath = '/dashboard/pet-owner/notifications',
}) {
  if (!title || !message) {
    return { ok: false, error: 'title and message are required' };
  }

  let usersSql = `SELECT id FROM auth_users WHERE COALESCE(account_status, 'active') = 'active'`;
  const params = [];
  if (roleFilter && roleFilter !== 'all') {
    params.push(roleFilter);
    usersSql += ` AND LOWER(TRIM(role)) = $${params.length}`;
  }

  const users = await pool.query(usersSql, params);
  let sent = 0;
  for (const row of users.rows) {
    await createNotification({
      userId: row.id,
      type: NOTIFICATION_TYPES.ANNOUNCEMENT,
      title,
      message,
      linkPath,
      referenceType: 'announcement',
      sendEmail,
      emailSubject: title,
      emailBody: message,
    });
    sent += 1;
  }
  return { ok: true, sent, audience: roleFilter || 'all_active' };
}

async function processAllVaccinationReminders() {
  const owners = await pool.query(
    `SELECT DISTINCT p.user_id FROM pets_owned p
     INNER JOIN vaccinations v ON v.pet_id = p.id
     WHERE v.administered_date IS NULL`
  );
  let sent = 0;
  let usersProcessed = 0;
  const { processAndGetReminders } = require('./vaccinationService');
  for (const row of owners.rows) {
    usersProcessed += 1;
    const result = await processAndGetReminders(row.user_id);
    if (result?.active?.length) sent += result.active.length;
  }
  return { sent, usersProcessed };
}

async function runAllReminderJobs() {
  const appointment = await processAppointmentReminders();
  const vaccination = await processAllVaccinationReminders();
  return { appointment, vaccination };
}

module.exports = {
  mapNotificationRow,
  createNotification,
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  notifyPaymentConfirmation,
  notifyAppointmentBooked,
  notifyAppointmentStatusChange,
  notifyVaccinationAlert,
  notifyAppointmentReminder,
  processAppointmentReminders,
  listNotificationsAdmin,
  broadcastAnnouncement,
  processAllVaccinationReminders,
  runAllReminderJobs,
  NOTIFICATION_TYPES,
};
