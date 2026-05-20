const pool = require('../db');
const {
  DEFAULT_STATUS,
  CLINIC_HOURS,
  normalizeStatus,
  isActiveForScheduling,
} = require('../config/appointments');

const APPOINTMENT_SELECT = `
  SELECT a.*,
         d.name AS doctor_name,
         d.specialization,
         d.image_url AS doctor_image,
         d.email AS doctor_email,
         d.phone AS doctor_phone,
         p.pet_name,
         p.species AS pet_species,
         u.full_name AS owner_name,
         u.email AS owner_email,
         u.mobile_number AS owner_phone
  FROM appointments a
  LEFT JOIN doctors d ON a.doctor_id = d.id
  LEFT JOIN pets_owned p ON a.pet_id = p.id
  LEFT JOIN auth_users u ON a.user_id = u.id
`;

function mapAppointmentRow(row) {
  if (!row) return null;
  const status = normalizeStatus(row.status);
  return {
    id: row.id,
    userId: row.user_id,
    petId: row.pet_id,
    doctorId: row.doctor_id,
    appointmentDate: row.appointment_date,
    appointmentTime: typeof row.appointment_time === 'string'
      ? row.appointment_time.slice(0, 5)
      : row.appointment_time,
    status,
    notes: row.notes,
    doctorNotes: row.doctor_notes,
    confirmationMessage: row.confirmation_message,
    confirmedAt: row.confirmed_at,
    cancelledAt: row.cancelled_at,
    cancellationReason: row.cancellation_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    doctorName: row.doctor_name,
    specialization: row.specialization,
    doctorImage: row.doctor_image,
    doctorEmail: row.doctor_email,
    doctorPhone: row.doctor_phone,
    petName: row.pet_name,
    petSpecies: row.pet_species,
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    ownerPhone: row.owner_phone,
    paymentStatus: row.payment_status || 'unpaid',
    bookingFeeCents: row.booking_fee_cents,
  };
}

async function fetchAppointmentById(id) {
  const result = await pool.query(`${APPOINTMENT_SELECT} WHERE a.id = $1`, [id]);
  return result.rows[0] ? mapAppointmentRow(result.rows[0]) : null;
}

function dayNameFromDate(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

async function isDoctorAvailableOnDate(doctorId, dateStr) {
  const result = await pool.query('SELECT available_days FROM doctors WHERE id = $1', [doctorId]);
  if (result.rows.length === 0) return { ok: false, error: 'Doctor not found' };
  const days = result.rows[0].available_days;
  if (!days || days.length === 0) return { ok: true };
  const dayName = dayNameFromDate(dateStr);
  if (!days.includes(dayName)) {
    return { ok: false, error: `Doctor is not available on ${dayName}` };
  }
  return { ok: true };
}

async function isSlotTaken(doctorId, dateStr, timeStr, excludeAppointmentId = null) {
  const params = [doctorId, dateStr, timeStr];
  let sql = `
    SELECT id FROM appointments
    WHERE doctor_id = $1
      AND appointment_date = $2
      AND appointment_time = $3
      AND status IN ('pending', 'approved', 'completed')
  `;
  if (excludeAppointmentId) {
    sql += ' AND id <> $4';
    params.push(excludeAppointmentId);
  }
  const result = await pool.query(sql, params);
  return result.rows.length > 0;
}

function buildTimeSlots() {
  const slots = [];
  const { start, end, stepMinutes } = CLINIC_HOURS;
  for (let hour = start; hour < end; hour++) {
    for (let min = 0; min < 60; min += stepMinutes) {
      const h = String(hour).padStart(2, '0');
      const m = String(min).padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
}

async function getAvailableSlots(doctorId, dateStr) {
  const dayCheck = await isDoctorAvailableOnDate(doctorId, dateStr);
  if (!dayCheck.ok) {
    return { available: [], error: dayCheck.error };
  }

  const booked = await pool.query(
    `SELECT appointment_time FROM appointments
     WHERE doctor_id = $1 AND appointment_date = $2
       AND status IN ('pending', 'approved', 'completed')`,
    [doctorId, dateStr]
  );
  const taken = new Set(
    booked.rows.map((r) =>
      typeof r.appointment_time === 'string'
        ? r.appointment_time.slice(0, 5)
        : String(r.appointment_time)
    )
  );

  const available = buildTimeSlots().filter((slot) => !taken.has(slot));
  return { available, error: null };
}

async function validateBookingInput({
  doctorId,
  petId,
  userId,
  appointmentDate,
  appointmentTime,
  excludeAppointmentId = null,
}) {
  if (!doctorId || !appointmentDate || !appointmentTime) {
    return { ok: false, error: 'Doctor, date, and time are required' };
  }

  const doctorRes = await pool.query('SELECT id FROM doctors WHERE id = $1', [doctorId]);
  if (doctorRes.rows.length === 0) {
    return { ok: false, error: 'Doctor not found' };
  }

  if (petId) {
    const petRes = await pool.query(
      'SELECT id FROM pets_owned WHERE id = $1 AND user_id = $2',
      [petId, userId]
    );
    if (petRes.rows.length === 0) {
      return { ok: false, error: 'Pet not found on your account' };
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  if (appointmentDate < today) {
    return { ok: false, error: 'Cannot book appointments in the past' };
  }

  const dayCheck = await isDoctorAvailableOnDate(doctorId, appointmentDate);
  if (!dayCheck.ok) return dayCheck;

  const slots = buildTimeSlots();
  const timeNorm = appointmentTime.length === 5 ? appointmentTime : appointmentTime.slice(0, 5);
  if (!slots.includes(timeNorm)) {
    return { ok: false, error: 'Selected time is outside clinic hours' };
  }

  if (await isSlotTaken(doctorId, appointmentDate, timeNorm, excludeAppointmentId)) {
    return { ok: false, error: 'This time slot is already booked' };
  }

  return { ok: true, timeNorm };
}

module.exports = {
  mapAppointmentRow,
  fetchAppointmentById,
  getAvailableSlots,
  validateBookingInput,
  isSlotTaken,
  isDoctorAvailableOnDate,
  normalizeStatus,
  DEFAULT_STATUS,
  isActiveForScheduling,
  APPOINTMENT_SELECT,
};
