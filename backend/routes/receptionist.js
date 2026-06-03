const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ALL_FULFILLMENT } = require('../config/shop');
const {
  loadInventoryWithAlerts,
  receptionNotifyRestock,
} = require('../services/receptionistShopService');
const {
  getOverview,
  getDashboardFeed,
  listPetsWithOwners,
  listPetOwners,
  getEodSummary,
  buildEodReportHtml,
} = require('../services/receptionistDashboardService');
const {
  APPOINTMENT_SELECT,
  mapAppointmentRow,
  fetchAppointmentById,
} = require('../services/appointmentService');
const { recordOfflinePayment } = require('../services/paymentService');
const {
  listNotifications,
  listNotificationsAdmin,
  deleteNotificationForUser,
  broadcastAnnouncement,
  runAllReminderJobs,
  notifyPetOwnerVisitChargesReady,
  notifyPetOwnerShopOrderUpdate,
  notifyPaymentConfirmation,
} = require('../services/notificationService');
const { fetchMedicalRecordByAppointmentId } = require('../services/medicalRecordService');
const { isEmailConfigured } = require('../config/notifications');

const router = express.Router();
const STAFF = ['receptionist', 'admin', 'doctor'];

router.use(authenticateToken, requireRole('receptionist', 'admin'));

async function sendEodReportHtml(req, res) {
  const summary = await getEodSummary();
  const autoPrint = req.query.print === '1';
  const html = buildEodReportHtml(summary, { autoPrint });
  const filename = `eod-summary-${summary.date || 'today'}.html`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.send(html);
}

/** Printable end-of-day report (open in browser → Print → Save as PDF). */
router.get('/eod-summary/report', async (req, res) => {
  try {
    await sendEodReportHtml(req, res);
  } catch (err) {
    console.error('Receptionist EOD report:', err.message);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

router.get('/eod-report', async (req, res) => {
  try {
    await sendEodReportHtml(req, res);
  } catch (err) {
    console.error('Receptionist EOD report (alias):', err.message);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

router.get('/report', async (req, res) => {
  if (req.query.print !== '1') {
    return res.status(400).json({ error: 'Use ?print=1 for end-of-day report' });
  }
  try {
    await sendEodReportHtml(req, res);
  } catch (err) {
    console.error('Receptionist report alias:', err.message);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

router.get('/eod-summary', async (_req, res) => {
  try {
    res.json({ summary: await getEodSummary() });
  } catch (err) {
    console.error('Receptionist EOD:', err.message);
    res.status(500).json({ error: 'Failed to load end-of-day summary' });
  }
});

router.get('/overview', async (_req, res) => {
  try {
    const overview = await getOverview();
    res.json({ overview });
  } catch (err) {
    console.error('Receptionist overview:', err.message);
    res.status(500).json({ error: 'Failed to load overview' });
  }
});

router.get('/dashboard-feed', async (_req, res) => {
  try {
    const feed = await getDashboardFeed();
    const overview = await getOverview();
    res.json({ overview, feed });
  } catch (err) {
    console.error('Receptionist dashboard feed:', err.message);
    res.status(500).json({ error: 'Failed to load dashboard feed' });
  }
});

router.get('/pets', async (req, res) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : '';
    const pets = await listPetsWithOwners(search);
    res.json({ pets });
  } catch (err) {
    console.error('Receptionist pets:', err.message);
    res.status(500).json({ error: 'Failed to load pets' });
  }
});

router.get('/owners', async (req, res) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : '';
    const owners = await listPetOwners(search);
    res.json({ owners });
  } catch (err) {
    console.error('Receptionist owners:', err.message);
    res.status(500).json({ error: 'Failed to load owners' });
  }
});

router.get('/vaccinations-due', async (req, res) => {
  const withinDays = Math.min(90, Math.max(1, parseInt(String(req.query.withinDays), 10) || 30));
  try {
    const r = await pool.query(
      `SELECT v.id, v.pet_id, v.vaccine_name, v.due_date, v.status,
              p.pet_name, u.full_name AS owner_name, u.email AS owner_email
       FROM vaccinations v
       JOIN pets_owned p ON p.id = v.pet_id
       JOIN auth_users u ON u.id = p.user_id
       WHERE v.due_date IS NOT NULL
         AND v.due_date <= CURRENT_DATE + ($1::int * INTERVAL '1 day')
         AND COALESCE(v.status, 'scheduled') IN ('scheduled', 'overdue', 'due_today', 'upcoming')
       ORDER BY v.due_date ASC
       LIMIT 50`,
      [withinDays]
    );
    res.json({ items: r.rows, withinDays });
  } catch (err) {
    console.error('Receptionist vaccinations-due:', err.message);
    res.json({ items: [], withinDays, warning: 'Vaccination list unavailable' });
  }
});

router.get('/inventory', async (_req, res) => {
  try {
    res.json(await loadInventoryWithAlerts());
  } catch (err) {
    console.error('Receptionist inventory:', err.message);
    res.status(500).json({ error: 'Failed to load inventory' });
  }
});

router.post('/inventory/:productId/notify-restock', async (req, res) => {
  const productId = Number(req.params.productId);
  if (!Number.isFinite(productId)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }
  try {
    const staff = await pool.query(
      'SELECT full_name FROM auth_users WHERE id = $1',
      [req.user.id]
    );
    const result = await receptionNotifyRestock(
      productId,
      req.user.id,
      staff.rows[0]?.full_name || 'Reception'
    );
    if (!result.ok) {
      return res.status(400).json({ error: result.error || 'Failed', ...result });
    }
    res.json(result);
  } catch (err) {
    console.error('Receptionist notify restock:', err.message);
    res.status(500).json({ error: 'Failed to notify admin' });
  }
});

router.get('/orders', async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(50, Math.max(5, parseInt(String(req.query.limit), 10) || 15));
  const offset = (page - 1) * limit;
  const payStatus =
    typeof req.query.paymentStatus === 'string' ? req.query.paymentStatus.trim() : '';

  try {
    const conditions = ['1=1'];
    const params = [];
    let pi = 1;
    if (payStatus === 'paid' || payStatus === 'pending_payment' || payStatus === 'cancelled') {
      conditions.push(`o.status = $${pi++}`);
      params.push(payStatus);
    }
    const where = conditions.join(' AND ');
    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM shop_orders o WHERE ${where}`,
      params
    );
    const total = countRes.rows[0]?.total || 0;
    const listParams = [...params, limit, offset];
    const r = await pool.query(
      `SELECT o.*, u.email AS user_email, u.full_name AS user_full_name
       FROM shop_orders o
       JOIN auth_users u ON u.id = o.user_id
       WHERE ${where}
       ORDER BY o.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      listParams
    );
    const orderIds = r.rows.map((row) => row.id);
    let itemsByOrder = {};
    if (orderIds.length > 0) {
      const itemsRes = await pool.query(
        `SELECT order_id, item_name, quantity, unit_price_cents
         FROM shop_order_items WHERE order_id = ANY($1::int[])`,
        [orderIds]
      );
      itemsByOrder = itemsRes.rows.reduce((acc, item) => {
        const oid = item.order_id;
        if (!acc[oid]) acc[oid] = [];
        acc[oid].push({
          name: item.item_name,
          quantity: item.quantity,
          unitPriceCents: item.unit_price_cents,
        });
        return acc;
      }, {});
    }

    const orders = r.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      userFullName: row.user_full_name,
      paymentStatus: row.status,
      totalCents: row.total_cents,
      fulfillmentStatus: row.fulfillment_status || 'unfulfilled',
      trackingNote: row.tracking_note,
      createdAt: row.created_at,
      items: itemsByOrder[row.id] || [],
    }));
    res.json({
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error('Receptionist orders:', err.message);
    res.status(500).json({ error: 'Failed to list orders' });
  }
});

router.patch('/orders/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const { fulfillmentStatus, trackingNote } = req.body || {};
  if (fulfillmentStatus === undefined && trackingNote === undefined) {
    return res.status(400).json({ error: 'Provide fulfillmentStatus and/or trackingNote' });
  }
  if (
    fulfillmentStatus !== undefined &&
    !ALL_FULFILLMENT.includes(String(fulfillmentStatus).trim().toLowerCase())
  ) {
    return res.status(400).json({ error: 'Invalid fulfillmentStatus', allowed: ALL_FULFILLMENT });
  }
  try {
    const existing = await pool.query(
      `SELECT id, user_id, fulfillment_status, tracking_note
       FROM shop_orders WHERE id = $1`,
      [id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const before = existing.rows[0];
    const nextStatus =
      fulfillmentStatus !== undefined
        ? String(fulfillmentStatus).trim().toLowerCase()
        : before.fulfillment_status;
    const nextTracking =
      trackingNote !== undefined ? trackingNote : before.tracking_note;

    const updates = [];
    const values = [];
    let pi = 1;
    if (fulfillmentStatus !== undefined) {
      updates.push(`fulfillment_status = $${pi++}`);
      values.push(nextStatus);
    }
    if (trackingNote !== undefined) {
      updates.push(`tracking_note = $${pi++}`);
      values.push(trackingNote);
    }
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    await pool.query(
      `UPDATE shop_orders SET ${updates.join(', ')} WHERE id = $${pi}`,
      values
    );

    const statusChanged =
      fulfillmentStatus !== undefined && nextStatus !== before.fulfillment_status;
    const trackingUpdated =
      trackingNote !== undefined &&
      String(trackingNote || '').trim() !== String(before.tracking_note || '').trim() &&
      String(trackingNote || '').trim().length > 0;

    if (before.user_id && (statusChanged || trackingUpdated)) {
      try {
        await notifyPetOwnerShopOrderUpdate(before.user_id, {
          id: before.id,
          fulfillment_status: nextStatus,
          tracking_note: nextTracking,
        }, { statusChanged, trackingUpdated });
      } catch (notifyErr) {
        console.warn('Shop order owner notification:', notifyErr.message);
      }
    }

    res.json({ message: 'Order updated' });
  } catch (err) {
    console.error('Receptionist patch order:', err.message);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

/** Inbox: notifications received by the logged-in receptionist (or admin on this desk). */
router.get('/notifications', async (req, res) => {
  try {
    const unreadOnly = req.query.unread === 'true';
    const limit = Math.min(200, parseInt(String(req.query.limit), 10) || 100);
    const notifications = await listNotifications(req.user.id, { limit, unreadOnly });
    res.json({ notifications, emailConfigured: isEmailConfigured() });
  } catch (err) {
    console.error('Receptionist notifications:', err.message);
    res.status(500).json({ error: 'Failed to load notifications' });
  }
});

/** Optional: admin-only audit of all system notifications (not used by reception inbox). */
router.get('/notifications/all', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  try {
    const type = typeof req.query.type === 'string' ? req.query.type : undefined;
    const limit = Math.min(200, parseInt(String(req.query.limit), 10) || 80);
    const notifications = await listNotificationsAdmin({ limit, type });
    res.json({ notifications });
  } catch (err) {
    console.error('Receptionist notifications all:', err.message);
    res.status(500).json({ error: 'Failed to load notifications' });
  }
});

router.delete('/notifications/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const deleted = await deleteNotificationForUser(id, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('Receptionist delete notification:', err.message);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

router.post('/notifications/broadcast', async (req, res) => {
  const { title, message, role, sendEmail } = req.body || {};
  try {
    const result = await broadcastAnnouncement({
      title,
      message,
      roleFilter: role || 'all',
      sendEmail: sendEmail !== false,
    });
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (err) {
    console.error('Receptionist broadcast:', err.message);
    res.status(500).json({ error: 'Broadcast failed' });
  }
});

router.post('/notifications/run-reminders', async (_req, res) => {
  try {
    const result = await runAllReminderJobs();
    res.json({ message: 'Reminder jobs completed', ...result });
  } catch (err) {
    console.error('Receptionist reminders:', err.message);
    res.status(500).json({ error: 'Failed to run reminders' });
  }
});

/** Visits with doctor consultation records — waiting for reception billing. */
router.get('/billing-queue', async (_req, res) => {
  try {
    const result = await pool.query(
      `${APPOINTMENT_SELECT}
       WHERE EXISTS (
         SELECT 1 FROM pet_medical_records r WHERE r.appointment_id = a.id
       )
       AND COALESCE(a.billing_status, 'none') IN ('pending', 'ready')
       ORDER BY a.updated_at DESC NULLS LAST
       LIMIT 50`
    );
    const appointments = result.rows.map(mapAppointmentRow).filter(Boolean);
    const items = await Promise.all(
      appointments.map(async (apt) => ({
        ...apt,
        medicalRecord: await fetchMedicalRecordByAppointmentId(apt.id),
      }))
    );
    res.json(items);
  } catch (err) {
    console.error('Billing queue error:', err.message);
    res.status(500).json({ error: 'Failed to load billing queue' });
  }
});

router.patch('/appointments/:id/billing', async (req, res) => {
  const appointmentId = Number(req.params.id);
  const {
    consultation_fee_cents,
    vaccination_fee_cents,
    medicine_fee_cents,
    record_payment,
    payment_method,
    payment_notes,
  } = req.body;

  try {
    const existing = await fetchAppointmentById(appointmentId);
    if (!existing) return res.status(404).json({ error: 'Appointment not found' });
    const consultationRecord = await fetchMedicalRecordByAppointmentId(appointmentId);
    if (!consultationRecord) {
      return res.status(400).json({
        error: 'No consultation record found. The doctor must save medical records before billing.',
      });
    }

    const consultCents = Math.max(0, Math.round(Number(consultation_fee_cents) || 0));
    const vaccCents = Math.max(0, Math.round(Number(vaccination_fee_cents) || 0));
    const medCents = Math.max(0, Math.round(Number(medicine_fee_cents) || 0));
    const totalCents = consultCents + vaccCents + medCents;

    if (totalCents <= 0) {
      return res.status(400).json({ error: 'Enter at least one charge amount' });
    }

    const nextBillingStatus = record_payment ? 'paid' : 'ready';

    await pool.query(
      `UPDATE appointments
       SET status = 'completed',
           consultation_fee_cents = $1,
           vaccination_fee_cents = $2,
           medicine_fee_cents = $3,
           service_fee_cents = $4,
           billing_status = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [
        consultCents,
        vaccCents,
        medCents,
        totalCents,
        nextBillingStatus,
        appointmentId,
      ]
    );

    const updated = await fetchAppointmentById(appointmentId);

    if (!record_payment && existing.userId) {
      try {
        await notifyPetOwnerVisitChargesReady(existing.userId, updated, totalCents);
      } catch (notifyErr) {
        console.error('Visit charges notification:', notifyErr.message);
      }
    }

    if (record_payment && existing.userId) {
      const parts = [];
      if (consultCents) parts.push(`Consultation $${(consultCents / 100).toFixed(2)}`);
      if (vaccCents) parts.push(`Vaccination $${(vaccCents / 100).toFixed(2)}`);
      if (medCents) parts.push(`Medicine $${(medCents / 100).toFixed(2)}`);
      const payResult = await recordOfflinePayment(req.user.id, {
        user_id: existing.userId,
        amount_cents: totalCents,
        type: 'consultation',
        description: `Visit charges — ${existing.petName || 'Pet'} (${parts.join(', ')})`,
        reference_type: 'appointment',
        reference_id: appointmentId,
        payment_method: payment_method || 'cash',
        notes: payment_notes || null,
      });
      if (!payResult.ok) {
        return res.status(400).json({ error: payResult.error || 'Payment recording failed' });
      }
      try {
        const txn = payResult.transaction;
        if (txn) {
          await notifyPaymentConfirmation(existing.userId, {
            ...txn,
            referenceType: 'appointment',
            referenceId: appointmentId,
            description: `Visit charges — ${existing.petName || 'Pet'}`,
          });
        }
      } catch (notifyErr) {
        console.error('Payment notification:', notifyErr.message);
      }
    }

    const record = await fetchMedicalRecordByAppointmentId(appointmentId);
    res.json({ ...updated, medicalRecord: record });
  } catch (err) {
    console.error('Billing update error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to save billing' });
  }
});

module.exports = router;
