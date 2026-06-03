const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getPetForUser } = require('../services/petAccess');
const {
  fetchMedicalRecordById,
  fetchMedicalRecordByAppointmentId,
  listMedicalRecords,
} = require('../services/medicalRecordService');
const { fetchAppointmentById } = require('../services/appointmentService');
const { getDoctorProfileByUserId } = require('../services/doctorApplicationService');

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

router.get('/by-appointment/:appointmentId', authenticateToken, async (req, res) => {
  try {
    const appointmentId = Number(req.params.appointmentId);
    if (!appointmentId) {
      return res.status(400).json({ error: 'Invalid appointment id' });
    }

    const appointment = await fetchAppointmentById(appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    if (req.user.role === 'user') {
      if (appointment.userId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }
    } else if (appointment.petId) {
      const access = await getPetForUser(appointment.petId, req.user.id, req.user.role);
      if (!access.ok) return res.status(403).json({ error: 'Not authorized' });
    }

    if (req.user.role === 'doctor') {
      const profile = await getDoctorProfileByUserId(req.user.id);
      if (!profile || appointment.doctorId !== profile.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }
    }

    const record = await fetchMedicalRecordByAppointmentId(appointmentId);
    res.json({
      appointmentId,
      appointmentStatus: appointment.status,
      hasRecord: Boolean(record),
      record,
    });
  } catch (err) {
    console.error('Consultation by appointment error:', err);
    res.status(500).json({ error: 'Failed to fetch consultation status' });
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
    symptoms,
    treatment,
    consultation_notes,
  } = req.body;

  try {
    if (!pet_id || !visit_date) {
      return res.status(400).json({ error: 'Pet and visit date are required' });
    }

    const access = await getPetForUser(Number(pet_id), req.user.id, req.user.role);
    if (!access.ok) return res.status(404).json({ error: access.error });

    if (appointment_id) {
      const appointment = await fetchAppointmentById(Number(appointment_id));
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      if (appointment.petId !== Number(pet_id)) {
        return res.status(400).json({ error: 'Appointment does not match this pet' });
      }
      if (appointment.status === 'completed') {
        return res.status(400).json({
          error: 'This visit is already completed. Consultation records cannot be added again.',
        });
      }
      if (appointment.status !== 'approved') {
        return res.status(400).json({
          error: 'Consultation records can only be added for confirmed appointments',
        });
      }
      if (req.user.role === 'doctor') {
        const profile = await getDoctorProfileByUserId(req.user.id);
        if (!profile || appointment.doctorId !== profile.id) {
          return res.status(403).json({ error: 'Not authorized for this appointment' });
        }
      }
      const existing = await fetchMedicalRecordByAppointmentId(Number(appointment_id));
      if (existing) {
        return res.status(400).json({
          error: 'Consultation records already exist for this appointment',
        });
      }
    }

    const insert = await pool.query(
      `INSERT INTO pet_medical_records (
         pet_id, doctor_id, appointment_id, visit_date,
         diagnosis, symptoms, treatment, consultation_notes, created_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        pet_id,
        doctor_id || null,
        appointment_id || null,
        visit_date,
        diagnosis || null,
        symptoms || null,
        treatment || null,
        consultation_notes || null,
        req.user.id,
      ]
    );

    const recordId = insert.rows[0].id;

    let updatedAppointment = null;
    if (appointment_id) {
      await pool.query(
        `UPDATE appointments
         SET status = 'completed',
             billing_status = 'pending',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND status = 'approved'`,
        [Number(appointment_id)]
      );
      try {
        updatedAppointment = await fetchAppointmentById(Number(appointment_id));
        const {
          notifyReceptionConsultationReady,
          notifyPetOwnerConsultationRecord,
        } = require('../services/notificationService');
        await notifyReceptionConsultationReady(updatedAppointment);
        if (updatedAppointment.userId) {
          const recordDraft = await fetchMedicalRecordById(recordId);
          await notifyPetOwnerConsultationRecord(updatedAppointment.userId, {
            appointment: updatedAppointment,
            record: recordDraft,
            petName: access.pet?.pet_name,
          });
        }
      } catch (notifyErr) {
        console.error('Consultation notification error:', notifyErr.message);
      }
    }

    const record = await fetchMedicalRecordById(recordId);

    if (!appointment_id && access.pet?.user_id) {
      try {
        const { notifyPetOwnerConsultationRecord } = require('../services/notificationService');
        await notifyPetOwnerConsultationRecord(access.pet.user_id, {
          appointment: null,
          record,
          petName: access.pet.pet_name,
        });
      } catch (notifyErr) {
        console.error('Pet owner record notification error:', notifyErr.message);
      }
    }
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
    symptoms,
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
           symptoms = COALESCE($3, symptoms),
           treatment = COALESCE($4, treatment),
           consultation_notes = COALESCE($5, consultation_notes),
           doctor_id = COALESCE($6, doctor_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [visit_date, diagnosis, symptoms, treatment, consultation_notes, doctor_id, req.params.id]
    );

    const updated = await fetchMedicalRecordById(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('Update medical record error:', err);
    res.status(500).json({ error: 'Failed to update medical record' });
  }
});

module.exports = router;
