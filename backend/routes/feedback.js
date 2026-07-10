const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { fetchAppointmentById } = require('../services/appointmentService');

const router = express.Router();

router.get('/appointment/:appointmentId', authenticateToken, requireRole('user'), async (req, res) => {
  try {
    const appointmentId = Number(req.params.appointmentId);
    const result = await pool.query(
      `SELECT id, rating, comment, status, created_at AS "createdAt"
       FROM client_feedback
       WHERE appointment_id = $1 AND user_id = $2`,
      [appointmentId, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.json({ feedback: null });
    }
    res.json({ feedback: result.rows[0] });
  } catch (err) {
    console.error('Get feedback error:', err);
    res.status(500).json({ error: 'Failed to load feedback' });
  }
});

router.post('/', authenticateToken, requireRole('user'), async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body || {};
    const appointment_id = Number(appointmentId);
    const stars = Number(rating);

    if (!appointment_id || !Number.isInteger(stars) || stars < 1 || stars > 5) {
      return res.status(400).json({ error: 'Valid appointment and rating (1–5) are required' });
    }

    const appointment = await fetchAppointmentById(appointment_id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (Number(appointment.userId) !== Number(req.user.id)) {
      return res.status(403).json({ error: 'Not allowed' });
    }
    if (appointment.status !== 'completed') {
      return res.status(400).json({ error: 'Feedback is only available after a completed visit' });
    }

    const existing = await pool.query(
      'SELECT id FROM client_feedback WHERE appointment_id = $1',
      [appointment_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You already submitted feedback for this appointment' });
    }

    const inserted = await pool.query(
      `INSERT INTO client_feedback (user_id, appointment_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING id, rating, comment, status, created_at AS "createdAt"`,
      [req.user.id, appointment_id, stars, comment?.trim() || null]
    );

    res.status(201).json({
      message: 'Thank you for your feedback',
      feedback: inserted.rows[0],
    });
  } catch (err) {
    console.error('Submit feedback error:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

router.get('/approved', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT cf.id,
              cf.rating,
              cf.comment,
              cf.created_at AS "createdAt",
              u.full_name AS "userName",
              d.full_name AS "doctorName",
              p.name AS "petName"
       FROM client_feedback cf
       JOIN auth_users u ON cf.user_id = u.id
       JOIN appointments a ON cf.appointment_id = a.id
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN pets p ON a.pet_id = p.id
       WHERE cf.status = 'approved'
       ORDER BY cf.created_at DESC
       LIMIT 6`
    );
    res.json({ feedback: result.rows });
  } catch (err) {
    console.error('Approved feedback error:', err);
    res.status(500).json({ error: 'Failed to load public reviews' });
  }
});

router.get('/pending', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cf.id,
              cf.rating,
              cf.comment,
              cf.status,
              cf.created_at AS "createdAt",
              u.id AS "userId",
              u.full_name AS "userName",
              a.id AS "appointmentId",
              d.full_name AS "doctorName"
       FROM client_feedback cf
       JOIN auth_users u ON cf.user_id = u.id
       JOIN appointments a ON cf.appointment_id = a.id
       LEFT JOIN doctors d ON a.doctor_id = d.id
       WHERE cf.status = 'pending'
       ORDER BY cf.created_at ASC`
    );
    res.json({ feedback: result.rows });
  } catch (err) {
    console.error('Pending feedback error:', err);
    res.status(500).json({ error: 'Failed to load pending reviews' });
  }
});

router.post('/:feedbackId/approve', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const feedbackId = Number(req.params.feedbackId);
    if (!feedbackId) {
      return res.status(400).json({ error: 'Invalid feedback id' });
    }

    const updated = await pool.query(
      `UPDATE client_feedback
       SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND status = 'pending'
       RETURNING id, status`,
      [req.user.id, feedbackId]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Pending feedback not found' });
    }

    res.json({ message: 'Feedback approved', feedback: updated.rows[0] });
  } catch (err) {
    console.error('Approve feedback error:', err);
    res.status(500).json({ error: 'Failed to approve feedback' });
  }
});

router.post('/:feedbackId/reject', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const feedbackId = Number(req.params.feedbackId);
    if (!feedbackId) {
      return res.status(400).json({ error: 'Invalid feedback id' });
    }

    const updated = await pool.query(
      `UPDATE client_feedback
       SET status = 'rejected', approved_by = $1, approved_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND status = 'pending'
       RETURNING id, status`,
      [req.user.id, feedbackId]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Pending feedback not found' });
    }

    res.json({ message: 'Feedback rejected', feedback: updated.rows[0] });
  } catch (err) {
    console.error('Reject feedback error:', err);
    res.status(500).json({ error: 'Failed to reject feedback' });
  }
});

module.exports = router;
