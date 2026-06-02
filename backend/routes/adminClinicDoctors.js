const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  normalizeRole,
} = require('../config/roles');

const router = express.Router();
router.use(authenticateToken, requireRole('admin'));

function mapDoctorRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    specialization: row.specialization,
    email: row.email,
    phone: row.phone,
    image_url: row.image_url,
    bio: row.bio,
    available_days: row.available_days || [],
    userId: row.user_id,
    linkedUser:
      row.user_id != null
        ? {
            id: row.user_id,
            email: row.linked_email,
            fullName: row.linked_full_name,
            accountStatus: row.linked_account_status,
            role: row.linked_role ? normalizeRole(row.linked_role) : null,
          }
        : null,
    appointmentsCount: Number(row.appointments_count ?? 0),
    created_at: row.created_at,
  };
}

router.get('/clinic-doctors', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT d.id, d.name, d.specialization, d.email, d.phone, d.image_url, d.bio, d.available_days,
              d.user_id, u.email AS linked_email, u.full_name AS linked_full_name,
              COALESCE(u.account_status, 'active') AS linked_account_status, u.role AS linked_role,
              d.created_at,
              COUNT(a.id)::int AS appointments_count
       FROM doctors d
       LEFT JOIN auth_users u ON u.id = d.user_id
       LEFT JOIN appointments a ON a.doctor_id = d.id
       GROUP BY d.id, u.id
       ORDER BY d.name ASC`
    );
    res.json({ doctors: r.rows.map(mapDoctorRow) });
  } catch (err) {
    console.error('Admin list clinic-doctors:', err.message);
    res.status(500).json({ error: 'Failed to list doctors' });
  }
});

router.get('/clinic-doctors/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const r = await pool.query(
      `SELECT d.*, u.email AS linked_email, u.full_name AS linked_full_name,
              COALESCE(u.account_status, 'active') AS linked_account_status, u.role AS linked_role,
              (SELECT COUNT(*)::int FROM appointments a WHERE a.doctor_id = d.id) AS appointments_count
       FROM doctors d
       LEFT JOIN auth_users u ON u.id = d.user_id
       WHERE d.id = $1`,
      [id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Doctor not found' });

    const row = mapDoctorRow(r.rows[0]);
    res.json({ doctor: row });
  } catch (err) {
    console.error('Admin get clinic-doctor:', err.message);
    res.status(500).json({ error: 'Failed to load doctor' });
  }
});

router.post('/clinic-doctors', async (req, res) => {
  const { name, specialization, email, phone, bio, available_days } = req.body || {};
  if (!name || !specialization) {
    return res.status(400).json({ error: 'name and specialization are required' });
  }

  const days =
    Array.isArray(available_days) && available_days.length > 0
      ? available_days.map(String)
      : [];

  try {
    const r = await pool.query(
      `INSERT INTO doctors (name, specialization, email, phone, bio, available_days)
       VALUES ($1, $2, $3, $4, $5, $6::text[])
       RETURNING *`,
      [name, specialization, email || null, phone || null, bio || null, days]
    );
    const inserted = mapDoctorRow({ ...r.rows[0], appointments_count: 0 });
    res.status(201).json({ doctor: inserted });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A doctor with this email already exists' });
    }
    console.error('Admin create clinic-doctor:', err.message);
    res.status(500).json({ error: 'Failed to create doctor profile' });
  }
});

router.patch('/clinic-doctors/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

  const { name, specialization, email, phone, bio, available_days } = req.body || {};
  try {
    const existing = await pool.query('SELECT id FROM doctors WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Doctor not found' });

    const sets = [];
    const vals = [];
    let pi = 1;

    if (name !== undefined) {
      sets.push(`name = $${pi++}`);
      vals.push(name);
    }
    if (specialization !== undefined) {
      sets.push(`specialization = $${pi++}`);
      vals.push(specialization);
    }
    if (email !== undefined) {
      sets.push(`email = $${pi++}`);
      vals.push(email || null);
    }
    if (phone !== undefined) {
      sets.push(`phone = $${pi++}`);
      vals.push(phone || null);
    }
    if (bio !== undefined) {
      sets.push(`bio = $${pi++}`);
      vals.push(bio || null);
    }
    if (available_days !== undefined) {
      const days = Array.isArray(available_days) ? available_days.map(String) : [];
      sets.push(`available_days = $${pi++}::text[]`);
      vals.push(days);
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    vals.push(id);
    await pool.query(`UPDATE doctors SET ${sets.join(', ')} WHERE id = $${pi}`, vals);

    const full = await pool.query(
      `SELECT d.*, u.email AS linked_email, u.full_name AS linked_full_name,
              COALESCE(u.account_status, 'active') AS linked_account_status, u.role AS linked_role,
              (SELECT COUNT(*)::int FROM appointments a WHERE a.doctor_id = d.id) AS appointments_count
       FROM doctors d
       LEFT JOIN auth_users u ON u.id = d.user_id
       WHERE d.id = $1`,
      [id]
    );

    const row = mapDoctorRow(full.rows[0]);
    res.json({
      doctor: row,
      message: linkedUserReminder(row),
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email conflict — another doctor uses this email' });
    }
    console.error('Admin patch clinic-doctor:', err.message);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

function linkedUserReminder(row) {
  if (!row.linkedUser || row.linkedUser.accountStatus !== 'active') return 'Doctor profile updated.';
  const label = row.linkedUser.email || `user ${row.linkedUser.id}`;
  return `Doctor profile updated. Login access for ${label} is controlled under User management.`;
}

router.delete('/clinic-doctors/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const existing = await pool.query(
      `SELECT d.id, d.name,
              (SELECT COUNT(*)::int FROM appointments a WHERE a.doctor_id = d.id) AS appointments_count
       FROM doctors d WHERE d.id = $1`,
      [id]
    );
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Doctor not found' });

    const row = existing.rows[0];
    if (Number(row.appointments_count) > 0) {
      return res.status(400).json({
        error: `Cannot delete — this profile has ${row.appointments_count} appointment(s). Reassign or cancel them first.`,
      });
    }

    await pool.query('DELETE FROM doctors WHERE id = $1', [id]);
    res.json({ message: `Doctor profile "${row.name}" removed.` });
  } catch (err) {
    console.error('Admin delete clinic-doctor:', err.message);
    res.status(500).json({ error: 'Failed to delete doctor profile' });
  }
});

/**
 * Appointment counts toward schedule visibility (doctor profile only).
 */
router.get('/clinic-doctors/:id/upcoming-schedule-sample', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const r = await pool.query(
      `SELECT a.id, a.appointment_date::text AS appointment_date,
              LEFT(a.appointment_time::text, 5) AS appointment_time,
              a.status
       FROM appointments a
       WHERE a.doctor_id = $1
         AND a.appointment_date >= CURRENT_DATE - 7
       ORDER BY a.appointment_date ASC, a.appointment_time ASC
       LIMIT 30`,
      [id]
    );
    res.json({ slots: r.rows });
  } catch (err) {
    console.error('Admin doctor schedule sample:', err.message);
    res.status(500).json({ error: 'Failed to load schedule sample' });
  }
});

module.exports = router;
