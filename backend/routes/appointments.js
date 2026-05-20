const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getPublicStatuses,
  normalizeStatus,
  canOwnerCancel,
  canOwnerReschedule,
  canStaffSetStatus,
  DEFAULT_STATUS,
} = require('../config/appointments');
const {
  mapAppointmentRow,
  fetchAppointmentById,
  validateBookingInput,
  isSlotTaken,
  APPOINTMENT_SELECT,
} = require('../services/appointmentService');

const router = express.Router();

router.get('/meta', authenticateToken, (req, res) => {
  res.json({ statuses: getPublicStatuses() });
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const role = req.user.role;
    const statusFilter = req.query.status ? normalizeStatus(req.query.status) : null;
    const params = [];
    let sql = `${APPOINTMENT_SELECT} WHERE 1=1`;

    if (role === 'user') {
      params.push(req.user.id);
      sql += ` AND a.user_id = $${params.length}`;
    }

    if (statusFilter) {
      params.push(statusFilter);
      sql += ` AND a.status = $${params.length}`;
    }

    sql += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const result = await pool.query(sql, params);
    res.json(result.rows.map(mapAppointmentRow));
  } catch (err) {
    console.error('List appointments error:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await fetchAppointmentById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const role = req.user.role;
    if (role === 'user' && appointment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this appointment' });
    }

    res.json(appointment);
  } catch (err) {
    console.error('Get appointment error:', err);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

router.post('/', authenticateToken, requireRole('user'), async (req, res) => {
  const { payment_transaction_id: paymentTransactionId } = req.body;
  const userId = req.user.id;

  try {
    if (!paymentTransactionId) {
      return res.status(402).json({
        error: 'Online payment is required to book an appointment. Complete checkout first.',
        code: 'PAYMENT_REQUIRED',
      });
    }

    const txnRes = await pool.query(
      `SELECT * FROM payment_transactions
       WHERE id = $1 AND user_id = $2 AND type = 'appointment_booking' AND status = 'succeeded'`,
      [paymentTransactionId, userId]
    );
    if (txnRes.rows.length === 0) {
      return res.status(402).json({
        error: 'Valid paid transaction required before booking.',
        code: 'PAYMENT_REQUIRED',
      });
    }

    if (txnRes.rows[0].reference_id) {
      const existing = await fetchAppointmentById(txnRes.rows[0].reference_id);
      if (existing) return res.status(201).json(existing);
    }

    return res.status(400).json({
      error: 'Payment received but appointment not created yet. Contact support or retry checkout.',
    });
  } catch (err) {
    console.error('Book appointment error:', err);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

router.patch('/:id/reschedule', authenticateToken, requireRole('user'), async (req, res) => {
  const { appointment_date, appointment_time, notes } = req.body;

  try {
    const existing = await fetchAppointmentById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (!canOwnerReschedule(existing.status)) {
      return res.status(400).json({ error: 'This appointment cannot be rescheduled' });
    }

    const validation = await validateBookingInput({
      doctorId: existing.doctorId,
      petId: existing.petId,
      userId: req.user.id,
      appointmentDate: appointment_date,
      appointmentTime: appointment_time,
      excludeAppointmentId: existing.id,
    });
    if (!validation.ok) {
      return res.status(400).json({ error: validation.error });
    }

    await pool.query(
      `UPDATE appointments
       SET appointment_date = $1,
           appointment_time = $2,
           notes = COALESCE($3, notes),
           status = 'pending',
           confirmation_message = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [
        appointment_date,
        validation.timeNorm,
        notes,
        'Appointment rescheduled. Awaiting clinic approval for the new date and time.',
        req.params.id,
      ]
    );

    const updated = await fetchAppointmentById(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('Reschedule error:', err);
    res.status(500).json({ error: 'Failed to reschedule appointment' });
  }
});

router.post('/:id/cancel', authenticateToken, requireRole('user'), async (req, res) => {
  const { reason } = req.body || {};

  try {
    const existing = await fetchAppointmentById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (!canOwnerCancel(existing.status)) {
      return res.status(400).json({ error: 'This appointment cannot be cancelled' });
    }

    await pool.query(
      `UPDATE appointments
       SET status = 'cancelled',
           cancellation_reason = $1,
           cancelled_at = CURRENT_TIMESTAMP,
           confirmation_message = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [
        reason || null,
        'Your appointment has been cancelled.',
        req.params.id,
      ]
    );

    const updated = await fetchAppointmentById(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

router.patch('/:id/status', authenticateToken, requireRole('admin', 'doctor', 'staff'), async (req, res) => {
  const { status, doctor_notes, confirmation_message } = req.body;

  try {
    const nextStatus = normalizeStatus(status);
    if (!canStaffSetStatus(nextStatus)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const existing = await fetchAppointmentById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    let message = confirmation_message;
    if (!message) {
      if (nextStatus === 'approved') {
        message = 'Your appointment has been approved. Please arrive 10 minutes early.';
      } else if (nextStatus === 'rejected') {
        message = 'Your appointment request was not accepted. Please book another slot or contact the clinic.';
      } else if (nextStatus === 'completed') {
        message = 'Thank you for visiting Carlisle Pet Care.';
      } else if (nextStatus === 'cancelled') {
        message = 'This appointment was cancelled by the clinic.';
      }
    }

    await pool.query(
      `UPDATE appointments
       SET status = $1,
           doctor_notes = COALESCE($2, doctor_notes),
           confirmation_message = $3,
           confirmed_at = CASE WHEN $1 = 'approved' THEN CURRENT_TIMESTAMP ELSE confirmed_at END,
           cancelled_at = CASE WHEN $1 IN ('cancelled', 'rejected') THEN CURRENT_TIMESTAMP ELSE cancelled_at END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [nextStatus, doctor_notes || null, message, req.params.id]
    );

    const updated = await fetchAppointmentById(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
});

module.exports = router;
