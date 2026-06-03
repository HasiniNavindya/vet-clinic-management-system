const pool = require('../db');
const {
  APPOINTMENT_SELECT,
  mapAppointmentRow,
} = require('./appointmentService');

async function getOverview() {
  const today = new Date().toISOString().slice(0, 10);

  const [
    todayAppts,
    pendingAppts,
    pendingOrders,
    vaccinationsDue,
    unreadNotifs,
    pendingBilling,
  ] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS c FROM appointments
       WHERE appointment_date = $1
         AND status IN ('approved', 'awaiting_payment')`,
      [today]
    ),
    pool.query(
      `SELECT COUNT(*)::int AS c FROM appointments
       WHERE status IN ('pending', 'awaiting_payment', 'reschedule_offered')`
    ),
    pool.query(
      `SELECT COUNT(*)::int AS c FROM shop_orders
       WHERE status = 'pending_payment'
          OR (status = 'paid' AND COALESCE(fulfillment_status, 'unfulfilled') NOT IN ('delivered', 'cancelled'))`
    ),
    pool.query(
      `SELECT COUNT(*)::int AS c FROM vaccinations
       WHERE due_date IS NOT NULL
         AND due_date <= CURRENT_DATE + INTERVAL '30 days'
         AND status IN ('scheduled', 'overdue')`
    ).catch(() => ({ rows: [{ c: 0 }] })),
    pool.query(
      `SELECT COUNT(*)::int AS c FROM notifications WHERE is_read = false`
    ).catch(() => ({ rows: [{ c: 0 }] })),
    pool.query(
      `SELECT COUNT(*)::int AS c FROM appointments a
       WHERE EXISTS (
         SELECT 1 FROM pet_medical_records r WHERE r.appointment_id = a.id
       )
       AND COALESCE(a.billing_status, 'none') IN ('pending', 'ready')`
    ).catch(() => ({ rows: [{ c: 0 }] })),
  ]);

  return {
    todayAppointments: todayAppts.rows[0]?.c ?? 0,
    pendingAppointments: pendingAppts.rows[0]?.c ?? 0,
    pendingOrders: pendingOrders.rows[0]?.c ?? 0,
    vaccinationsDueSoon: vaccinationsDue.rows[0]?.c ?? 0,
    unreadNotifications: unreadNotifs.rows[0]?.c ?? 0,
    pendingBilling: pendingBilling.rows[0]?.c ?? 0,
  };
}

async function listPetsWithOwners(search) {
  const params = [];
  let sql = `
    SELECT p.id, p.pet_name, p.species, p.breed, p.gender, p.vaccination_status,
           u.id AS owner_id, u.full_name AS owner_name, u.email AS owner_email,
           u.mobile_number AS owner_phone
    FROM pets_owned p
    JOIN auth_users u ON u.id = p.user_id
    WHERE 1=1
  `;
  if (search && String(search).trim()) {
    params.push(`%${String(search).trim()}%`);
    sql += ` AND (p.pet_name ILIKE $1 OR p.species ILIKE $1 OR u.full_name ILIKE $1 OR u.email ILIKE $1)`;
  }
  sql += ' ORDER BY p.pet_name LIMIT 200';
  const r = await pool.query(sql, params);
  return r.rows.map((row) => ({
    id: row.id,
    petName: row.pet_name,
    species: row.species,
    breed: row.breed,
    gender: row.gender,
    vaccinationStatus: row.vaccination_status,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    ownerPhone: row.owner_phone,
  }));
}

async function listPetOwners(search) {
  const params = ['user'];
  let sql = `
    SELECT u.id, u.email, u.full_name, u.mobile_number, u.address, u.created_at,
           (SELECT COUNT(*)::int FROM pets_owned p WHERE p.user_id = u.id) AS pet_count
    FROM auth_users u
    WHERE LOWER(TRIM(u.role)) = $1
  `;
  if (search && String(search).trim()) {
    params.push(`%${String(search).trim()}%`);
    sql += ` AND (u.full_name ILIKE $2 OR u.email ILIKE $2)`;
  }
  sql += ' ORDER BY u.full_name LIMIT 200';
  const r = await pool.query(sql, params);
  return r.rows.map((row) => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    mobileNumber: row.mobile_number,
    address: row.address,
    petCount: row.pet_count,
    createdAt: row.created_at,
  }));
}

async function getEodSummary() {
  const today = new Date().toISOString().slice(0, 10);
  const [appts, checkedIn, completed, pending, orders, payments] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS c FROM appointments WHERE appointment_date = $1`,
      [today]
    ),
    pool.query(
      `SELECT COUNT(*)::int AS c FROM appointments
       WHERE appointment_date = $1 AND checked_in_at IS NOT NULL`,
      [today]
    ),
    pool.query(
      `SELECT COUNT(*)::int AS c FROM appointments
       WHERE appointment_date = $1 AND status = 'completed'`,
      [today]
    ),
    pool.query(
      `SELECT COUNT(*)::int AS c FROM appointments
       WHERE status IN ('pending', 'awaiting_payment', 'reschedule_offered')`
    ),
    pool.query(
      `SELECT COUNT(*)::int AS c FROM shop_orders
       WHERE created_at::date = $1::date`,
      [today]
    ),
    pool.query(
      `SELECT COUNT(*)::int AS c, COALESCE(SUM(amount_cents), 0)::bigint AS total
       FROM payment_transactions
       WHERE status = 'succeeded' AND paid_at::date = $1::date`,
      [today]
    ),
  ]);
  return {
    date: today,
    appointmentsToday: appts.rows[0]?.c ?? 0,
    checkedInToday: checkedIn.rows[0]?.c ?? 0,
    completedToday: completed.rows[0]?.c ?? 0,
    pendingRequests: pending.rows[0]?.c ?? 0,
    ordersPlacedToday: orders.rows[0]?.c ?? 0,
    paymentsRecordedToday: payments.rows[0]?.c ?? 0,
    paymentsTotalCents: Number(payments.rows[0]?.total ?? 0),
  };
}

async function listVaccinationsDue(limit = 6) {
  try {
    const r = await pool.query(
      `SELECT v.id, v.pet_id, v.vaccine_name, v.due_date, v.status,
              p.pet_name, u.id AS owner_id, u.full_name AS owner_name, u.email AS owner_email
       FROM vaccinations v
       JOIN pets_owned p ON p.id = v.pet_id
       JOIN auth_users u ON u.id = p.user_id
       WHERE v.due_date IS NOT NULL
         AND v.due_date <= CURRENT_DATE + INTERVAL '30 days'
         AND COALESCE(v.status, 'scheduled') IN ('scheduled', 'overdue', 'due_today', 'upcoming')
       ORDER BY v.due_date ASC
       LIMIT $1`,
      [limit]
    );
    return r.rows;
  } catch (err) {
    console.error('listVaccinationsDue:', err.message);
    return [];
  }
}

async function queryAppointments(sql, params = []) {
  try {
    const r = await pool.query(`${APPOINTMENT_SELECT} ${sql}`, params);
    return r.rows.map(mapAppointmentRow).filter(Boolean);
  } catch (err) {
    console.error('getDashboardFeed query:', err.message);
    return [];
  }
}

/** Single payload for reception home dashboard panels. */
async function getDashboardFeed() {
  const today = new Date().toISOString().slice(0, 10);

  const [
    recentRequests,
    todayConfirmed,
    upcomingConsultations,
    billingQueue,
    vaccinationsDue,
  ] = await Promise.all([
    queryAppointments(
      `WHERE a.status IN ('pending', 'reschedule_offered')
       ORDER BY a.created_at DESC NULLS LAST
       LIMIT 6`
    ),
    queryAppointments(
      `WHERE a.appointment_date = $1
         AND a.status IN ('approved', 'awaiting_payment')
       ORDER BY a.appointment_time ASC
       LIMIT 8`,
      [today]
    ),
    queryAppointments(
      `WHERE a.appointment_date > $1::date
         AND a.appointment_date <= CURRENT_DATE + INTERVAL '14 days'
         AND a.status IN ('approved', 'awaiting_payment')
       ORDER BY a.appointment_date ASC, a.appointment_time ASC
       LIMIT 8`,
      [today]
    ),
    queryAppointments(
      `WHERE EXISTS (
         SELECT 1 FROM pet_medical_records r WHERE r.appointment_id = a.id
       )
       AND COALESCE(a.billing_status, 'none') IN ('pending', 'ready')
       ORDER BY a.updated_at DESC NULLS LAST
       LIMIT 6`
    ),
    listVaccinationsDue(6),
  ]);

  return {
    recentRequests,
    todayConfirmed,
    upcomingConsultations,
    billingQueue,
    vaccinationsDue,
  };
}

module.exports = {
  getOverview,
  getDashboardFeed,
  listPetsWithOwners,
  listPetOwners,
  getEodSummary,
};
