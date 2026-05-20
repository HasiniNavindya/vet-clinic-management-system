const pool = require('../db');

const PRESCRIPTION_SELECT = `
  SELECT pr.*,
         p.pet_name,
         p.species AS pet_species,
         p.user_id AS owner_id,
         d.name AS doctor_name,
         d.specialization
  FROM prescriptions pr
  JOIN pets_owned p ON pr.pet_id = p.id
  LEFT JOIN doctors d ON pr.doctor_id = d.id
`;

function mapPrescriptionItem(row) {
  return {
    id: row.id,
    prescriptionId: row.prescription_id,
    medicineName: row.medicine_name,
    dosage: row.dosage,
    frequency: row.frequency,
    duration: row.duration,
    instructions: row.instructions,
    sortOrder: row.sort_order,
  };
}

function mapPrescription(row, items = []) {
  if (!row) return null;
  return {
    id: row.id,
    petId: row.pet_id,
    doctorId: row.doctor_id,
    appointmentId: row.appointment_id,
    prescriptionNumber: row.prescription_number,
    issuedDate: row.issued_date,
    diagnosisSummary: row.diagnosis_summary,
    generalInstructions: row.general_instructions,
    documentUrl: row.document_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    petName: row.pet_name,
    petSpecies: row.pet_species,
    ownerId: row.owner_id,
    doctorName: row.doctor_name,
    specialization: row.specialization,
    medicines: items,
  };
}

async function generatePrescriptionNumber() {
  const year = new Date().getFullYear();
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM prescriptions WHERE EXTRACT(YEAR FROM issued_date) = $1`,
    [year]
  );
  const seq = (result.rows[0].count || 0) + 1;
  return `RX-${year}-${String(seq).padStart(5, '0')}`;
}

async function fetchPrescriptionById(id, includeItems = true) {
  const result = await pool.query(`${PRESCRIPTION_SELECT} WHERE pr.id = $1`, [id]);
  if (result.rows.length === 0) return null;

  let items = [];
  if (includeItems) {
    const itemsRes = await pool.query(
      'SELECT * FROM prescription_items WHERE prescription_id = $1 ORDER BY sort_order, id',
      [id]
    );
    items = itemsRes.rows.map(mapPrescriptionItem);
  }

  return mapPrescription(result.rows[0], items);
}

async function listPrescriptions({ petId, userId, role }) {
  const params = [];
  let sql = `${PRESCRIPTION_SELECT} WHERE 1=1`;

  if (petId) {
    params.push(petId);
    sql += ` AND pr.pet_id = $${params.length}`;
  }

  if (role === 'user') {
    params.push(userId);
    sql += ` AND p.user_id = $${params.length}`;
  }

  sql += ' ORDER BY pr.issued_date DESC, pr.id DESC';

  const result = await pool.query(sql, params);
  return result.rows.map((r) => mapPrescription(r, []));
}

module.exports = {
  mapPrescription,
  mapPrescriptionItem,
  fetchPrescriptionById,
  listPrescriptions,
  generatePrescriptionNumber,
};
