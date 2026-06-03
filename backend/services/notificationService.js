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
  if (result.rows.length === 0) {
    await pool.query(
      `INSERT INTO user_preferences (user_id, vaccination_reminders, appointment_updates)
       VALUES ($1, true, true)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );
    return {
      vaccinationReminders: true,
      appointmentUpdates: true,
      emailNotifications: true,
    };
  }
  const row = result.rows[0];
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
  const isVisitPayment =
    transaction.referenceType === 'appointment' &&
    (transaction.type === 'consultation' ||
      String(transaction.description || '').toLowerCase().includes('visit charges'));

  let title = 'Payment confirmed';
  let message = `Your payment of ${amount} for ${transaction.description || 'your order'} was successful.`;
  let type = NOTIFICATION_TYPES.PAYMENT_CONFIRMATION;
  let linkPath = '/dashboard/pet-owner/payments';

  if (isVisitPayment && transaction.referenceId) {
    title = 'Visit payment received';
    message = `Thank you! Your consultation visit payment of ${amount} has been recorded. Your appointment and health records are updated.`;
    type = NOTIFICATION_TYPES.VISIT_PAYMENT_RECORDED;
    linkPath = `/dashboard/pet-owner/appointments/${transaction.referenceId}`;
  } else if (transaction.referenceType === 'appointment' && transaction.referenceId) {
    linkPath = `/dashboard/pet-owner/appointments/${transaction.referenceId}`;
  }

  return createNotification({
    userId,
    type,
    title,
    message,
    linkPath,
    referenceType: transaction.referenceType || 'payment',
    referenceId: transaction.referenceId || transaction.id,
    sendEmail: true,
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
    sendEmail: prefs.appointmentUpdates && prefs.emailNotifications,
    emailSubject: title,
    emailBody: message,
  });
}

async function notifyVaccinationAlert(userId, { petName, vaccineName, dueDate, status, message }) {
  const prefs = await getUserPrefs(userId);

  const title =
    status === 'overdue'
      ? `Vaccination overdue — ${petName}`
      : `Vaccination due — ${petName}`;

  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.VACCINATION_ALERT,
    title,
    message,
    linkPath: '/dashboard/pet-owner/vaccinations',
    referenceType: 'vaccination',
    sendEmail: prefs.vaccinationReminders && prefs.emailNotifications,
    emailSubject: title,
    emailBody: `${message}\n\nDue date: ${dueDate}`,
  });
}

async function getAuthUserIdForDoctor(doctorId) {
  if (!doctorId) return null;
  const result = await pool.query(
    `SELECT user_id FROM doctors WHERE id = $1 AND user_id IS NOT NULL`,
    [doctorId]
  );
  return result.rows[0]?.user_id || null;
}

function formatAppointmentTimeForMessage(time) {
  if (!time) return '';
  const raw = String(time).trim().slice(0, 8);
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return raw;
  const h = Number(match[1]);
  const m = Number(match[2]);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

/** Notify veterinarian when reception assigns or reassigns them to an appointment. */
async function notifyDoctorAppointmentAssigned(doctorId, appointment, { reassigned = false } = {}) {
  const userId = await getAuthUserIdForDoctor(doctorId);
  if (!userId) return null;

  const prefs = await getUserPrefs(userId);
  if (!prefs.appointmentUpdates) return null;

  const pet = appointment.petName || 'a patient';
  const owner = appointment.ownerName || 'pet owner';
  const date = appointment.appointmentDate || 'scheduled date';
  const time = formatAppointmentTimeForMessage(appointment.appointmentTime);
  const when = time ? `${date} at ${time}` : String(date);

  const title = reassigned ? 'Appointment reassigned to you' : 'New appointment assigned';
  const message = `Reception assigned ${pet} (${owner}) for ${when}. View it under My appointments on your dashboard.`;

  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.DOCTOR_APPOINTMENT_ASSIGNED,
    title,
    message,
    linkPath: '/dashboard/doctor/appointments',
    referenceType: 'appointment',
    referenceId: appointment.id,
    emailSubject: title,
    emailBody: message,
  });
}

async function notifyAppointmentReminder(userId, appointment, { reminderKind = 'day_before' } = {}) {
  const prefs = await getUserPrefs(userId);

  const existing = await pool.query(
    `SELECT id FROM notifications
     WHERE user_id = $1 AND type = $2 AND reference_id = $3
       AND created_at > NOW() - INTERVAL '2 days'`,
    [userId, NOTIFICATION_TYPES.APPOINTMENT_REMINDER, appointment.id]
  );
  if (existing.rows.length > 0) return null;

  const title =
    reminderKind === 'same_day' ? 'Appointment today' : 'Appointment reminder';
  const when =
    reminderKind === 'same_day'
      ? `today at ${appointment.appointmentTime}`
      : `${appointment.appointmentDate} at ${appointment.appointmentTime}`;
  const message = `Reminder: You have an appointment with Dr. ${appointment.doctorName || 'your vet'} ${when}. Please arrive 10 minutes early.`;

  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.APPOINTMENT_REMINDER,
    title,
    message,
    linkPath: `/dashboard/pet-owner/appointments/${appointment.id}`,
    referenceType: 'appointment',
    referenceId: appointment.id,
    sendEmail: prefs.appointmentUpdates && prefs.emailNotifications,
    emailSubject: title,
    emailBody: message,
  });
}

async function processAppointmentReminders() {
  const [tomorrowRows, todayRows] = await Promise.all([
    pool.query(
      `SELECT a.id, a.user_id, a.appointment_date, a.appointment_time, a.status,
              d.name AS doctor_name
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       WHERE a.status IN ('approved', 'awaiting_payment')
         AND a.appointment_date = CURRENT_DATE + INTERVAL '1 day'`
    ),
    pool.query(
      `SELECT a.id, a.user_id, a.appointment_date, a.appointment_time, a.status,
              d.name AS doctor_name
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       WHERE a.status IN ('approved', 'awaiting_payment')
         AND a.appointment_date = CURRENT_DATE
         AND a.appointment_time::time > CURRENT_TIME`
    ),
  ]);

  let sent = 0;
  const mapRow = (row) => ({
    id: row.id,
    appointmentDate: row.appointment_date,
    appointmentTime:
      typeof row.appointment_time === 'string'
        ? row.appointment_time.slice(0, 5)
        : row.appointment_time,
    doctorName: row.doctor_name,
  });

  for (const row of tomorrowRows.rows) {
    const n = await notifyAppointmentReminder(row.user_id, mapRow(row), {
      reminderKind: 'day_before',
    });
    if (n) sent += 1;
  }
  for (const row of todayRows.rows) {
    const n = await notifyAppointmentReminder(row.user_id, mapRow(row), {
      reminderKind: 'same_day',
    });
    if (n) sent += 1;
  }

  return {
    sent,
    checked: tomorrowRows.rows.length + todayRows.rows.length,
    tomorrow: tomorrowRows.rows.length,
    today: todayRows.rows.length,
  };
}

async function deleteNotificationById(id) {
  const result = await pool.query(
    'DELETE FROM notifications WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows.length > 0;
}

/** Delete only if the notification belongs to this user (pet owner, doctor, receptionist inbox). */
async function deleteNotificationForUser(id, userId) {
  const result = await pool.query(
    'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  return result.rows.length > 0;
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

async function listReceptionistUserIds() {
  const result = await pool.query(
    `SELECT id FROM auth_users WHERE LOWER(TRIM(role)) = 'receptionist' AND account_status = 'active'`
  );
  return result.rows.map((r) => r.id);
}

/** Alert reception when a doctor finishes consultation — ready for billing. */
async function notifyReceptionConsultationReady(appointment) {
  const receptionistIds = await listReceptionistUserIds();
  if (receptionistIds.length === 0) return [];

  const pet = appointment.petName || 'Patient';
  const owner = appointment.ownerName || 'pet owner';
  const doctor = appointment.doctorName || 'Veterinarian';
  const title = 'Consultation finished — billing needed';
  const message = `Dr. ${doctor} completed consultation for ${pet} (${owner}). Add consultation, vaccination, and medicine charges at reception.`;

  const results = [];
  for (const userId of receptionistIds) {
    const n = await createNotification({
      userId,
      type: NOTIFICATION_TYPES.CONSULTATION_BILLING_READY,
      title,
      message,
      linkPath: '/dashboard/receptionist/billing',
      referenceType: 'appointment',
      referenceId: appointment.id,
      sendEmail: false,
    });
    if (n) results.push(n);
  }
  return results;
}

/** Pet owner: reception saved visit charges — payment due at desk. */
async function notifyPetOwnerVisitChargesReady(ownerUserId, appointment, totalCents) {
  if (!ownerUserId || !appointment) return null;

  const prefs = await getUserPrefs(ownerUserId);
  const amount = formatMoney(totalCents, 'usd');
  const pet = appointment.petName || 'your pet';
  const title = `Visit charges ready — ${pet}`;
  const message = `Your visit balance is ${amount} (consultation, vaccination, and/or medicine). Please pay at reception when you are ready. You can view the breakdown on your appointment page.`;

  return createNotification({
    userId: ownerUserId,
    type: NOTIFICATION_TYPES.VISIT_CHARGES_READY,
    title,
    message,
    linkPath: `/dashboard/pet-owner/appointments/${appointment.id}`,
    referenceType: 'appointment',
    referenceId: appointment.id,
    sendEmail: prefs.appointmentUpdates && prefs.emailNotifications,
    emailSubject: title,
    emailBody: message,
  });
}

/** Notify pet owner when consultation / medical records are added after a visit. */
const FULFILLMENT_LABELS = {
  unfulfilled: 'Received',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function fulfillmentLabel(status) {
  return FULFILLMENT_LABELS[status] || String(status || 'unfulfilled').replace(/_/g, ' ');
}

/** Pet owner: reception updated shop order fulfillment or tracking. */
async function notifyPetOwnerShopOrderUpdate(
  ownerUserId,
  order,
  { statusChanged = false, trackingUpdated = false } = {}
) {
  if (!ownerUserId || !order?.id) return null;

  const prefs = await getUserPrefs(ownerUserId);
  const status = order.fulfillment_status || order.fulfillmentStatus || 'unfulfilled';
  const label = fulfillmentLabel(status);
  const orderId = order.id;
  const linkPath = '/dashboard/pet-owner/marketplace?tab=orders';
  const tracking = order.tracking_note || order.trackingNote;

  let title;
  let message;
  if (trackingUpdated && tracking) {
    title = `Order #${orderId} — tracking update`;
    message = `Your shop order has a new tracking note: ${tracking}. Current stage: ${label}.`;
  } else if (statusChanged) {
    title = `Order #${orderId} — ${label}`;
    message = `Your marketplace order is now at the "${label}" stage. Open View order progress in Marketplace to see the full tracker.`;
  } else {
    return null;
  }

  return createNotification({
    userId: ownerUserId,
    type: NOTIFICATION_TYPES.SHOP_ORDER_UPDATE,
    title,
    message,
    linkPath,
    referenceType: 'shop_order',
    referenceId: orderId,
    sendEmail: prefs.appointmentUpdates && prefs.emailNotifications,
    emailSubject: title,
    emailBody: message,
  });
}

async function notifyPetOwnerConsultationRecord(ownerUserId, { appointment, record, petName }) {
  if (!ownerUserId) return null;

  const prefs = await getUserPrefs(ownerUserId);
  const pet = petName || appointment?.petName || 'your pet';
  const doctor = appointment?.doctorName || record?.doctorName || 'your veterinarian';
  const rawDate = record?.visitDate || appointment?.appointmentDate;
  const visitDate = rawDate
    ? String(rawDate).slice(0, 10)
    : 'your recent visit';

  const title = `Consultation complete — ${pet}`;
  const message = `Dr. ${doctor} finished your consultation for ${pet} on ${visitDate}. Medical notes are available in your pet health records. Reception will notify you when visit charges are ready for payment.`;

  const petId = appointment?.petId || record?.petId;
  const linkPath = appointment?.id
    ? `/dashboard/pet-owner/appointments/${appointment.id}`
    : petId
      ? `/dashboard/pet-owner/medical-records/${petId}`
      : '/dashboard/pet-owner/health?tab=medical';

  return createNotification({
    userId: ownerUserId,
    type: NOTIFICATION_TYPES.CONSULTATION_RECORD_ADDED,
    title,
    message,
    linkPath,
    referenceType: appointment?.id ? 'appointment' : 'medical_record',
    referenceId: appointment?.id || record?.id || null,
    sendEmail: prefs.appointmentUpdates && prefs.emailNotifications,
    emailSubject: title,
    emailBody: message,
  });
}

async function listAdminUserIds() {
  const result = await pool.query(
    `SELECT id FROM auth_users
     WHERE LOWER(TRIM(role)) = 'admin'
       AND COALESCE(account_status, 'active') = 'active'`
  );
  return result.rows.map((r) => r.id);
}

async function wasRestockAlertSentRecently(productId, withinHours = 48) {
  const existing = await pool.query(
    `SELECT id FROM notifications
     WHERE type = $1
       AND reference_type = 'product'
       AND reference_id = $2
       AND created_at > NOW() - ($3::int * INTERVAL '1 hour')`,
    [NOTIFICATION_TYPES.INVENTORY_RESTOCK, productId, withinHours]
  );
  return existing.rows.length > 0;
}

/**
 * Alert admins to restock a marketplace product (reception-triggered or automatic).
 */
async function notifyAdminsInventoryRestock(
  product,
  { triggeredByUserId = null, receptionistName = null } = {}
) {
  if (!product?.id) return { sent: 0, skipped: true };

  const stock = Number(product.stockQuantity ?? product.stock_quantity ?? 0);
  const { LOW_STOCK_THRESHOLD } = require('../config/shop');
  if (stock > LOW_STOCK_THRESHOLD) {
    return { sent: 0, skipped: true, reason: 'above_threshold' };
  }

  if (await wasRestockAlertSentRecently(product.id)) {
    return { sent: 0, skipped: true, reason: 'recent_alert' };
  }

  const adminIds = await listAdminUserIds();
  if (adminIds.length === 0) return { sent: 0, skipped: true, reason: 'no_admins' };

  const name = product.name || 'Product';
  const title =
    stock === 0 ? `Out of stock — ${name}` : `Low stock — ${name}`;
  const byReception = receptionistName
    ? ` Reception (${receptionistName}) flagged this for restock.`
    : triggeredByUserId
      ? ' Reception flagged this for restock.'
      : '';
  const message = `Marketplace product "${name}" has ${stock} unit(s) left (restock at ${LOW_STOCK_THRESHOLD} or below). Please update inventory in the shop admin.${byReception}`;

  const results = [];
  for (const adminId of adminIds) {
    const n = await createNotification({
      userId: adminId,
      type: NOTIFICATION_TYPES.INVENTORY_RESTOCK,
      title,
      message,
      linkPath: '/dashboard/admin/shop/inventory',
      referenceType: 'product',
      referenceId: product.id,
      sendEmail: true,
      emailSubject: title,
      emailBody: message,
    });
    if (n) results.push(n);
  }
  return { sent: results.length, productId: product.id };
}

/** Scan active products and notify admins for any at/below low-stock threshold. */
async function processLowStockInventoryAlerts() {
  const { LOW_STOCK_THRESHOLD } = require('../config/shop');
  const result = await pool.query(
    `SELECT id, name, category, COALESCE(stock_quantity, 0)::int AS stock_quantity
     FROM products
     WHERE COALESCE(is_active, true) = true
       AND COALESCE(stock_quantity, 0) <= $1
     ORDER BY stock_quantity ASC, id ASC`,
    [LOW_STOCK_THRESHOLD]
  );

  let sent = 0;
  for (const row of result.rows) {
    const r = await notifyAdminsInventoryRestock(
      {
        id: row.id,
        name: row.name,
        stockQuantity: row.stock_quantity,
      },
      {}
    );
    if (r.sent > 0) sent += r.sent;
  }
  return { checked: result.rows.length, alertsSent: sent };
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
  notifyDoctorAppointmentAssigned,
  notifyReceptionConsultationReady,
  notifyPetOwnerVisitChargesReady,
  notifyPetOwnerConsultationRecord,
  notifyPetOwnerShopOrderUpdate,
  notifyVaccinationAlert,
  notifyAppointmentReminder,
  notifyAdminsInventoryRestock,
  processLowStockInventoryAlerts,
  processAppointmentReminders,
  listNotificationsAdmin,
  deleteNotificationById,
  deleteNotificationForUser,
  broadcastAnnouncement,
  processAllVaccinationReminders,
  runAllReminderJobs,
  NOTIFICATION_TYPES,
};
