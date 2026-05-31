const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getPublicVaccinationStatuses } = require('../config/vaccinations');
const { getPetForUser } = require('../services/petAccess');
const {
  fetchVaccinationById,
  listVaccinations,
  getVaccinationDashboard,
  processAndGetReminders,
} = require('../services/vaccinationService');

const router = express.Router();

router.get('/meta', authenticateToken, (req, res) => {
  res.json({ statuses: getPublicVaccinationStatuses() });
});

router.get('/dashboard', authenticateToken, requireRole('user'), async (req, res) => {
  try {
    const dashboard = await getVaccinationDashboard(req.user.id, req.user.role);
    res.json(dashboard);
  } catch (err) {
    console.error('Vaccination dashboard error:', err);
    res.status(500).json({ error: 'Failed to load vaccination dashboard' });
  }
});

router.get('/reminders', authenticateToken, requireRole('user'), async (req, res) => {
  try {
    const data = await processAndGetReminders(req.user.id);
    res.json(data);
  } catch (err) {
    console.error('Vaccination reminders error:', err);
    res.status(500).json({ error: 'Failed to load vaccination reminders' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { pet_id, filter } = req.query;
    if (pet_id) {
      const access = await getPetForUser(Number(pet_id), req.user.id, req.user.role);
      if (!access.ok) return res.status(access.error === 'Pet not found' ? 404 : 403).json({ error: access.error });
    }

    const rows = await listVaccinations({
      petId: pet_id ? Number(pet_id) : null,
      userId: req.user.id,
      role: req.user.role,
      filter: filter || 'all',
    });
    res.json(rows);
  } catch (err) {
    console.error('List vaccinations error:', err);
    res.status(500).json({ error: 'Failed to fetch vaccinations' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const row = await fetchVaccinationById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Vaccination not found' });

    const access = await getPetForUser(row.petId, req.user.id, req.user.role);
    if (!access.ok) return res.status(403).json({ error: 'Not authorized' });

    res.json(row);
  } catch (err) {
    console.error('Get vaccination error:', err);
    res.status(500).json({ error: 'Failed to fetch vaccination' });
  }
});

router.post('/', authenticateToken, requireRole('admin', 'doctor', 'receptionist'), async (req, res) => {
  const {
    pet_id,
    vaccine_name,
    due_date,
    administered_date,
    interval_days,
    notes,
    doctor_id,
  } = req.body;

  try {
    if (!pet_id || !vaccine_name || !due_date) {
      return res.status(400).json({ error: 'Pet, vaccine name, and due date are required' });
    }

    const access = await getPetForUser(Number(pet_id), req.user.id, req.user.role);
    if (!access.ok) return res.status(404).json({ error: access.error });

    const insert = await pool.query(
      `INSERT INTO vaccinations (
         pet_id, vaccine_name, due_date, administered_date,
         interval_days, notes, doctor_id, created_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        pet_id,
        vaccine_name,
        due_date,
        administered_date || null,
        interval_days || null,
        notes || null,
        doctor_id || null,
        req.user.id,
      ]
    );

    const created = await fetchVaccinationById(insert.rows[0].id);

    if (administered_date && interval_days) {
      const nextDue = new Date(administered_date);
      nextDue.setDate(nextDue.getDate() + Number(interval_days));
      await pool.query(
        `INSERT INTO vaccinations (pet_id, vaccine_name, due_date, notes, doctor_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          pet_id,
          vaccine_name,
          nextDue.toISOString().slice(0, 10),
          `Next dose scheduled automatically`,
          doctor_id || null,
          req.user.id,
        ]
      );
    }

    res.status(201).json(created);
  } catch (err) {
    console.error('Create vaccination error:', err);
    res.status(500).json({ error: 'Failed to create vaccination record' });
  }
});

router.patch('/:id/record-dose', authenticateToken, requireRole('admin', 'doctor', 'receptionist'), async (req, res) => {
  const { administered_date, interval_days, notes } = req.body;

  try {
    const existing = await fetchVaccinationById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Vaccination not found' });

    const adminDate = administered_date || new Date().toISOString().slice(0, 10);

    await pool.query(
      `UPDATE vaccinations
       SET administered_date = $1,
           notes = COALESCE($2, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [adminDate, notes, req.params.id]
    );

    if (interval_days) {
      const nextDue = new Date(adminDate);
      nextDue.setDate(nextDue.getDate() + Number(interval_days));
      await pool.query(
        `INSERT INTO vaccinations (pet_id, vaccine_name, due_date, notes, doctor_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          existing.petId,
          existing.vaccineName,
          nextDue.toISOString().slice(0, 10),
          'Next dose scheduled after administration',
          existing.doctorId,
          req.user.id,
        ]
      );
    }

    const updated = await fetchVaccinationById(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('Record dose error:', err);
    res.status(500).json({ error: 'Failed to record vaccination dose' });
  }
});

router.patch('/:id', authenticateToken, requireRole('admin', 'doctor', 'receptionist'), async (req, res) => {
  const { vaccine_name, due_date, notes, doctor_id } = req.body;

  try {
    const existing = await fetchVaccinationById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Vaccination not found' });

    await pool.query(
      `UPDATE vaccinations
       SET vaccine_name = COALESCE($1, vaccine_name),
           due_date = COALESCE($2, due_date),
           notes = COALESCE($3, notes),
           doctor_id = COALESCE($4, doctor_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [vaccine_name, due_date, notes, doctor_id, req.params.id]
    );

    const updated = await fetchVaccinationById(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('Update vaccination error:', err);
    res.status(500).json({ error: 'Failed to update vaccination' });
  }
});

module.exports = router;
