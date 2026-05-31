const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getPetForUser } = require('../services/petAccess');
const {
  fetchMedicalRecordById,
  listMedicalRecords,
} = require('../services/medicalRecordService');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { pet_id } = req.query;
    if (pet_id) {
      const access = await getPetForUser(Number(pet_id), req.user.id, req.user.role);
      if (!access.ok) return res.status(access.error === 'Pet not found' ? 404 : 403).json({ error: access.error });
    }

    const records = await listMedicalRecords({
      petId: pet_id ? Number(pet_id) : null,
      userId: req.user.id,
      role: req.user.role,
    });
    res.json(records);
  } catch (err) {
    console.error('List medical records error:', err);
    res.status(500).json({ error: 'Failed to fetch medical records' });
  }
});

router.get('/pet/:petId/timeline', authenticateToken, async (req, res) => {
  try {
    const petId = Number(req.params.petId);
    const access = await getPetForUser(petId, req.user.id, req.user.role);
    if (!access.ok) return res.status(access.error === 'Pet not found' ? 404 : 403).json({ error: access.error });

    const records = await listMedicalRecords({
      petId,
      userId: req.user.id,
      role: req.user.role,
    });

    res.json({
      petId,
      petName: access.pet.pet_name,
      timeline: records,
    });
  } catch (err) {
    console.error('Timeline error:', err);
    res.status(500).json({ error: 'Failed to fetch pet history timeline' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const record = await fetchMedicalRecordById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Medical record not found' });

    const access = await getPetForUser(record.petId, req.user.id, req.user.role);
    if (!access.ok) return res.status(403).json({ error: 'Not authorized' });

    res.json(record);
  } catch (err) {
    console.error('Get medical record error:', err);
    res.status(500).json({ error: 'Failed to fetch medical record' });
  }
});

router.post('/', authenticateToken, requireRole('admin', 'doctor', 'receptionist'), async (req, res) => {
  const {
    pet_id,
    doctor_id,
    appointment_id,
    visit_date,
    diagnosis,
    treatment,
    consultation_notes,
  } = req.body;

  try {
    if (!pet_id || !visit_date) {
      return res.status(400).json({ error: 'Pet and visit date are required' });
    }

    const access = await getPetForUser(Number(pet_id), req.user.id, req.user.role);
    if (!access.ok) return res.status(404).json({ error: access.error });

    const insert = await pool.query(
      `INSERT INTO pet_medical_records (
         pet_id, doctor_id, appointment_id, visit_date,
         diagnosis, treatment, consultation_notes, created_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        pet_id,
        doctor_id || null,
        appointment_id || null,
        visit_date,
        diagnosis || null,
        treatment || null,
        consultation_notes || null,
        req.user.id,
      ]
    );

    const record = await fetchMedicalRecordById(insert.rows[0].id);
    res.status(201).json(record);
  } catch (err) {
    console.error('Create medical record error:', err);
    res.status(500).json({ error: 'Failed to create medical record' });
  }
});

router.patch('/:id', authenticateToken, requireRole('admin', 'doctor', 'receptionist'), async (req, res) => {
  const {
    visit_date,
    diagnosis,
    treatment,
    consultation_notes,
    doctor_id,
  } = req.body;

  try {
    const existing = await fetchMedicalRecordById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Medical record not found' });

    await pool.query(
      `UPDATE pet_medical_records
       SET visit_date = COALESCE($1, visit_date),
           diagnosis = COALESCE($2, diagnosis),
           treatment = COALESCE($3, treatment),
           consultation_notes = COALESCE($4, consultation_notes),
           doctor_id = COALESCE($5, doctor_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [visit_date, diagnosis, treatment, consultation_notes, doctor_id, req.params.id]
    );

    const updated = await fetchMedicalRecordById(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('Update medical record error:', err);
    res.status(500).json({ error: 'Failed to update medical record' });
  }
});

module.exports = router;
