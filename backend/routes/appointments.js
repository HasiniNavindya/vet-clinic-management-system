const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getPublicStatuses,
  normalizeStatus,
  canOwnerCancel,
  canOwnerReschedule,
  canStaffSetStatus,
  canOwnerPay,
  canStaffReview,
} = require('../config/appointments');
const {
  mapAppointmentRow,
  fetchAppointmentById,
  validateBookingInput,
  createAppointmentRequest,
  APPOINTMENT_SELECT,
} = require('../services/appointmentService');
const { getDoctorProfileByUserId } = require('../services/doctorApplicationService');

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
    } else if (role === 'doctor') {
      const profile = await getDoctorProfileByUserId(req.user.id);
      if (!profile) return res.json([]);
      params.push(profile.id);
      sql += ` AND a.doctor_id = $${params.length}`;
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
    if (role === 'doctor') {
      const profile = await getDoctorProfileByUserId(req.user.id);
      if (!profile || appointment.doctorId !== profile.id) {
        return res.status(403).json({ error: 'Not authorized to view this appointment' });
      }
    }

    res.json(appointment);
  } catch (err) {
    console.error('Get appointment error:', err);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

/** Submit appointment request (no payment until staff approves) */
router.post('/request', authenticateToken, requireRole('user'), async (req, res) => {
  const { doctor_id, pet_id, appointment_date, appointment_time, notes } = req.body;

  try {
    const result = await createAppointmentRequest({
      userId: req.user.id,
      doctorId: Number(doctor_id),
      petId: pet_id ? Number(pet_id) : null,
      appointmentDate: appointment_date,
      appointmentTime: appointment_time,
      notes,
    });

    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }

    try {
      const { notifyAppointmentBooked } = require('../services/notificationService');
      await notifyAppointmentBooked(req.user.id, result.appointment);
    } catch (notifyErr) {
      console.error('Request notification error:', notifyErr.message);
    }

    res.status(201).json(result.appointment);
  } catch (err) {
    console.error('Appointment request error:', err);
    res.status(500).json({ error: 'Failed to submit appointment request' });
  }
});

router.post('/', authenticateToken, requireRole('user'), async (req, res) => {
  return res.status(400).json({
    error: 'Use POST /api/appointments/request to submit a booking request. Payment is required after clinic approval.',
    code: 'USE_REQUEST_ENDPOINT',
  });
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
           proposed_appointment_date = NULL,
           proposed_appointment_time = NULL,
           confirmation_message = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [
        appointment_date,
        validation.timeNorm,
        notes,
        'Your reschedule request was sent. The clinic will review the new date and time.',
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

router.post('/:id/accept-reschedule', authenticateToken, requireRole('user'), async (req, res) => {
  try {
    const existing = await fetchAppointmentById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Appointment not found' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (existing.status !== 'reschedule_offered') {
      return res.status(400).json({ error: 'No reschedule offer to accept' });
    }
    if (!existing.proposedAppointmentDate || !existing.proposedAppointmentTime) {
      return res.status(400).json({ error: 'Proposed date and time missing' });
    }

    const validation = await validateBookingInput({
      doctorId: existing.doctorId,
      petId: existing.petId,
      userId: req.user.id,
      appointmentDate: existing.proposedAppointmentDate,
      appointmentTime: existing.proposedAppointmentTime,
      excludeAppointmentId: existing.id,
    });
    if (!validation.ok) return res.status(400).json({ error: validation.error });

    await pool.query(
      `UPDATE appointments
       SET appointment_date = $1,
           appointment_time = $2,
           proposed_appointment_date = NULL,
           proposed_appointment_time = NULL,
           status = 'pending',
           confirmation_message = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [
        existing.proposedAppointmentDate,
        validation.timeNorm,
        'You accepted the new appointment time. The clinic will confirm your booking.',
        req.params.id,
      ]
    );

    const updated = await fetchAppointmentById(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('Accept reschedule error:', err);
    res.status(500).json({ error: 'Failed to accept reschedule' });
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
      [reason || null, 'Your appointment has been cancelled.', req.params.id]
    );

    const updated = await fetchAppointmentById(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

/** Reception/admin: approve (→ awaiting payment), reject, or reschedule with reason */
router.patch('/:id/respond', authenticateToken, requireRole('admin', 'receptionist'), async (req, res) => {
  const {
    action,
    reason,
    appointment_date,
    appointment_time,
    doctor_notes,
    confirmation_message,
    doctor_id,
  } = req.body;

  try {
    const existing = await fetchAppointmentById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Appointment not found' });

    const act = String(action || '').toLowerCase();

    if (act === 'approve') {
      if (!canStaffReview(existing.status)) {
        return res.status(400).json({ error: 'Only pending requests can be approved' });
      }

      const assignDoctorId =
        doctor_id != null && Number.isFinite(Number(doctor_id)) ? Number(doctor_id) : null;

      await pool.query(
        `UPDATE appointments
         SET status = 'awaiting_payment',
             doctor_id = COALESCE($5, doctor_id),
             staff_response_reason = $1,
             doctor_notes = COALESCE($2, doctor_notes),
             confirmation_message = $3,
             staff_responded_at = CURRENT_TIMESTAMP,
             proposed_appointment_date = NULL,
             proposed_appointment_time = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [
          reason || null,
          doctor_notes || null,
          confirmation_message ||
            'Your appointment was approved. Please complete online payment to confirm your booking.',
          req.params.id,
          assignDoctorId,
        ]
      );
    } else if (act === 'reject') {
      if (!reason || !String(reason).trim()) {
        return res.status(400).json({ error: 'A reason is required when declining a request' });
      }
      if (!canStaffReview(existing.status)) {
        return res.status(400).json({ error: 'Only pending requests can be declined' });
      }

      await pool.query(
        `UPDATE appointments
         SET status = 'rejected',
             staff_response_reason = $1,
             doctor_notes = COALESCE($2, doctor_notes),
             confirmation_message = $3,
             cancelled_at = CURRENT_TIMESTAMP,
             staff_responded_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [
          reason,
          doctor_notes || null,
          confirmation_message ||
            'Your appointment request was declined. Please choose another time or contact the clinic.',
          req.params.id,
        ]
      );
    } else if (act === 'reschedule') {
      if (!reason || !String(reason).trim()) {
        return res.status(400).json({ error: 'A reason is required when offering a reschedule' });
      }
      if (!appointment_date || !appointment_time) {
        return res.status(400).json({
          error: 'Proposed appointment_date and appointment_time are required',
        });
      }

      const validation = await validateBookingInput({
        doctorId: existing.doctorId,
        petId: existing.petId,
        userId: existing.userId,
        appointmentDate: appointment_date,
        appointmentTime: appointment_time,
        excludeAppointmentId: existing.id,
      });
      if (!validation.ok) return res.status(400).json({ error: validation.error });

      await pool.query(
        `UPDATE appointments
         SET status = 'reschedule_offered',
             proposed_appointment_date = $1,
             proposed_appointment_time = $2,
             staff_response_reason = $3,
             doctor_notes = COALESCE($4, doctor_notes),
             confirmation_message = $5,
             staff_responded_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6`,
        [
          appointment_date,
          validation.timeNorm,
          reason,
          doctor_notes || null,
          confirmation_message ||
            `The clinic proposed a new time: ${appointment_date} at ${validation.timeNorm}. Please review and accept the new slot.`,
          req.params.id,
        ]
      );
    } else {
      return res.status(400).json({ error: 'action must be approve, reject, or reschedule' });
    }

    const updated = await fetchAppointmentById(req.params.id);
    try {
      const { notifyAppointmentStatusChange } = require('../services/notificationService');
      const notifyStatus =
        act === 'approve'
          ? 'awaiting_payment'
          : act === 'reject'
            ? 'rejected'
            : 'reschedule_offered';
      await notifyAppointmentStatusChange(updated.userId, updated, notifyStatus);
    } catch (notifyErr) {
      console.error('Respond notification error:', notifyErr.message);
    }
    res.json(updated);
  } catch (err) {
    console.error('Staff respond error:', err);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

router.patch('/:id/check-in', authenticateToken, requireRole('admin', 'receptionist'), async (req, res) => {
  try {
    const existing = await fetchAppointmentById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Appointment not found' });
    if (existing.status !== 'approved') {
      return res.status(400).json({ error: 'Only confirmed (paid) appointments can be checked in' });
    }
    await pool.query(
      `UPDATE appointments SET checked_in_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [req.params.id]
    );
    res.json(await fetchAppointmentById(req.params.id));
  } catch (err) {
    console.error('Check-in error:', err);
    res.status(500).json({ error: 'Failed to check in patient' });
  }
});

router.patch('/:id/assign-doctor', authenticateToken, requireRole('admin', 'receptionist'), async (req, res) => {
  const doctorId = Number(req.body?.doctor_id);
  if (!Number.isFinite(doctorId)) {
    return res.status(400).json({ error: 'doctor_id is required' });
  }
  try {
    const doc = await pool.query('SELECT id FROM doctors WHERE id = $1', [doctorId]);
    if (!doc.rows.length) return res.status(400).json({ error: 'Doctor not found' });
    const existing = await fetchAppointmentById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Appointment not found' });
    await pool.query(
      `UPDATE appointments SET doctor_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [doctorId, req.params.id]
    );
    res.json(await fetchAppointmentById(req.params.id));
  } catch (err) {
    console.error('Assign doctor error:', err);
    res.status(500).json({ error: 'Failed to assign veterinarian' });
  }
});

router.patch('/:id/service-fee', authenticateToken, requireRole('admin', 'doctor'), async (req, res) => {
  const feeCents = Math.round(Number(req.body?.service_fee_cents));
  if (!Number.isFinite(feeCents) || feeCents < 0) {
    return res.status(400).json({ error: 'Valid service_fee_cents is required' });
  }
  try {
    const existing = await fetchAppointmentById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Appointment not found' });
    if (req.user.role === 'doctor') {
      const profile = await getDoctorProfileByUserId(req.user.id);
      if (!profile || existing.doctorId !== profile.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }
    }
    await pool.query(
      `UPDATE appointments SET service_fee_cents = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [feeCents, req.params.id]
    );
    res.json(await fetchAppointmentById(req.params.id));
  } catch (err) {
    console.error('Service fee error:', err);
    res.status(500).json({ error: 'Failed to set service fee' });
  }
});

router.patch('/:id/status', authenticateToken, requireRole('admin', 'doctor', 'receptionist'), async (req, res) => {
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

    if (req.user.role === 'doctor') {
      const profile = await getDoctorProfileByUserId(req.user.id);
      if (!profile || existing.doctorId !== profile.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      if (nextStatus !== 'completed') {
        return res.status(403).json({
          error: 'Doctors may only mark their assigned appointments as completed',
        });
      }
    }

    let message = confirmation_message;
    if (!message) {
      if (nextStatus === 'approved') {
        message = 'Your appointment is confirmed.';
      } else if (nextStatus === 'rejected') {
        message = 'Your appointment request was not accepted.';
      } else if (nextStatus === 'completed') {
        message = 'Thank you for visiting Carlisle Pet Care.';
      } else if (nextStatus === 'cancelled') {
        message = 'This appointment was cancelled by the clinic.';
      } else if (nextStatus === 'awaiting_payment') {
        message = 'Please complete online payment to confirm your booking.';
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
    try {
      const { notifyAppointmentStatusChange } = require('../services/notificationService');
      await notifyAppointmentStatusChange(updated.userId, updated, nextStatus);
    } catch (notifyErr) {
      console.error('Appointment status notification error:', notifyErr.message);
    }
    res.json(updated);
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
});

module.exports = router;
