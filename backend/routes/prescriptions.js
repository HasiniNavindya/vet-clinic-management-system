const express = require('express');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getPetForUser } = require('../services/petAccess');
const {
  fetchPrescriptionById,
  listPrescriptions,
  generatePrescriptionNumber,
} = require('../services/prescriptionService');

const router = express.Router();

const prescriptionsUploadDir = path.join(__dirname, '..', 'uploads', 'prescriptions');
if (!fs.existsSync(prescriptionsUploadDir)) {
  fs.mkdirSync(prescriptionsUploadDir, { recursive: true });
}

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { pet_id } = req.query;
    if (pet_id) {
      const access = await getPetForUser(Number(pet_id), req.user.id, req.user.role);
      if (!access.ok) return res.status(access.error === 'Pet not found' ? 404 : 403).json({ error: access.error });
    }

    const rows = await listPrescriptions({
      petId: pet_id ? Number(pet_id) : null,
      userId: req.user.id,
      role: req.user.role,
    });
    res.json(rows);
  } catch (err) {
    console.error('List prescriptions error:', err);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const rx = await fetchPrescriptionById(req.params.id, true);
    if (!rx) return res.status(404).json({ error: 'Prescription not found' });

    const access = await getPetForUser(rx.petId, req.user.id, req.user.role);
    if (!access.ok) return res.status(403).json({ error: 'Not authorized' });

    res.json(rx);
  } catch (err) {
    console.error('Get prescription error:', err);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

router.post('/', authenticateToken, requireRole('admin', 'doctor', 'staff'), async (req, res) => {
  const {
    pet_id,
    doctor_id,
    appointment_id,
    issued_date,
    diagnosis_summary,
    general_instructions,
    medicines,
    document_base64,
    document_filename,
  } = req.body;

  try {
    if (!pet_id) {
      return res.status(400).json({ error: 'Pet is required' });
    }

    const access = await getPetForUser(Number(pet_id), req.user.id, req.user.role);
    if (!access.ok) return res.status(404).json({ error: access.error });

    const prescriptionNumber = await generatePrescriptionNumber();
    let documentUrl = null;

    if (document_base64) {
      const ext = document_filename && path.extname(document_filename)
        ? path.extname(document_filename)
        : '.pdf';
      const fileName = `rx_${Date.now()}${ext}`;
      const filePath = path.join(prescriptionsUploadDir, fileName);
      fs.writeFileSync(filePath, Buffer.from(document_base64, 'base64'));
      documentUrl = `/uploads/prescriptions/${fileName}`;
    }

    const insert = await pool.query(
      `INSERT INTO prescriptions (
         pet_id, doctor_id, appointment_id, prescription_number,
         issued_date, diagnosis_summary, general_instructions, document_url, created_by
       ) VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE), $6, $7, $8, $9)
       RETURNING id`,
      [
        pet_id,
        doctor_id || null,
        appointment_id || null,
        prescriptionNumber,
        issued_date || null,
        diagnosis_summary || null,
        general_instructions || null,
        documentUrl,
        req.user.id,
      ]
    );

    const prescriptionId = insert.rows[0].id;

    if (Array.isArray(medicines)) {
      for (let i = 0; i < medicines.length; i++) {
        const m = medicines[i];
        if (!m.medicine_name) continue;
        await pool.query(
          `INSERT INTO prescription_items (
             prescription_id, medicine_name, dosage, frequency, duration, instructions, sort_order
           ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            prescriptionId,
            m.medicine_name,
            m.dosage || null,
            m.frequency || null,
            m.duration || null,
            m.instructions || null,
            i,
          ]
        );
      }
    }

    const created = await fetchPrescriptionById(prescriptionId, true);
    res.status(201).json(created);
  } catch (err) {
    console.error('Create prescription error:', err);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

router.patch('/:id', authenticateToken, requireRole('admin', 'doctor', 'staff'), async (req, res) => {
  const { status, diagnosis_summary, general_instructions } = req.body;

  try {
    const existing = await fetchPrescriptionById(req.params.id, false);
    if (!existing) return res.status(404).json({ error: 'Prescription not found' });

    await pool.query(
      `UPDATE prescriptions
       SET status = COALESCE($1, status),
           diagnosis_summary = COALESCE($2, diagnosis_summary),
           general_instructions = COALESCE($3, general_instructions),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [status, diagnosis_summary, general_instructions, req.params.id]
    );

    const updated = await fetchPrescriptionById(req.params.id, true);
    res.json(updated);
  } catch (err) {
    console.error('Update prescription error:', err);
    res.status(500).json({ error: 'Failed to update prescription' });
  }
});

module.exports = router;
