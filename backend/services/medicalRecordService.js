const pool = require('../db');

const RECORD_SELECT = `
  SELECT r.*,
         p.pet_name,
         p.species AS pet_species,
         d.name AS doctor_name,
         d.specialization
  FROM pet_medical_records r
  JOIN pets_owned p ON r.pet_id = p.id
  LEFT JOIN doctors d ON r.doctor_id = d.id
`;

function mapMedicalRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    petId: row.pet_id,
    doctorId: row.doctor_id,
    appointmentId: row.appointment_id,
    visitDate: row.visit_date,
    diagnosis: row.diagnosis,
    symptoms: row.symptoms,
    treatment: row.treatment,
    consultationNotes: row.consultation_notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    petName: row.pet_name,
    petSpecies: row.pet_species,
    doctorName: row.doctor_name,
    specialization: row.specialization,
  };
}

async function fetchMedicalRecordById(id) {
  const result = await pool.query(`${RECORD_SELECT} WHERE r.id = $1`, [id]);
  return result.rows[0] ? mapMedicalRecord(result.rows[0]) : null;
}

async function fetchMedicalRecordByAppointmentId(appointmentId) {
  const result = await pool.query(
    `${RECORD_SELECT} WHERE r.appointment_id = $1 ORDER BY r.created_at DESC LIMIT 1`,
    [appointmentId]
  );
  return result.rows[0] ? mapMedicalRecord(result.rows[0]) : null;
}

async function listMedicalRecords({ petId, userId, role }) {
  const params = [];
  let sql = `${RECORD_SELECT} WHERE 1=1`;

  if (petId) {
    params.push(petId);
    sql += ` AND r.pet_id = $${params.length}`;
  }

  if (role === 'user') {
    params.push(userId);
    sql += ` AND p.user_id = $${params.length}`;
  }

  sql += ' ORDER BY r.visit_date DESC, r.created_at DESC';

  const result = await pool.query(sql, params);
  return result.rows.map(mapMedicalRecord);
}

module.exports = {
  mapMedicalRecord,
  fetchMedicalRecordById,
  fetchMedicalRecordByAppointmentId,
  listMedicalRecords,
};
