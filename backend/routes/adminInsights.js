const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { PAYMENT_STATUSES, ORDER_STATUSES } = require('../config/payments');

const router = express.Router();
router.use(authenticateToken, requireRole('admin'));

const PAID_TX_STATUSES = [PAYMENT_STATUSES.SUCCEEDED];

async function scalar(query, params = []) {
  const r = await pool.query(query, params);
  return r.rows[0];
}

/**
 * Dashboard widgets: counts and high-level KPIs.
 */
router.get('/stats/overview', async (_req, res) => {
  try {
    const overview = {
      totalAppointments: 0,
      pendingAppointments: 0,
      completedAppointments: 0,
      totalDoctors: 0,
      doctorsWithActiveLogin: 0,
      totalPetOwners: 0,
      totalStaff: 0,
      totalAdmins: 0,
      revenueCents: 0,
      shopOrdersPaid: 0,
      shopRevenueCents: 0,
      medicalRecordsCount: 0,
      vaccinationsDueSoon: 0,
      notificationsUnread: 0,
      doctorApplicationsPending: 0,
      marketplaceAdsPending: 0,
    };

    try {
      const a = await scalar(`SELECT COUNT(*)::int AS c FROM appointments`);
      overview.totalAppointments = a?.c ?? 0;
      const p = await scalar(
        `SELECT COUNT(*)::int AS c FROM appointments WHERE status IN ('pending', 'awaiting_payment')`
      );
      overview.pendingAppointments = p?.c ?? 0;
      const comp = await scalar(
        `SELECT COUNT(*)::int AS c FROM appointments WHERE status = 'completed'`
      );
      overview.completedAppointments = comp?.c ?? 0;
    } catch (e) {
      console.warn('admin stats overview appointments:', e.message);
    }

    try {
      const d = await scalar(`SELECT COUNT(*)::int AS c FROM doctors`);
      overview.totalDoctors = d?.c ?? 0;
      const da = await scalar(
        `SELECT COUNT(*)::int AS c
         FROM doctors d
         INNER JOIN auth_users u ON u.id = d.user_id
         WHERE COALESCE(u.account_status, 'active') = 'active'`
      );
      overview.doctorsWithActiveLogin = da?.c ?? 0;
    } catch (e) {
      console.warn('admin stats overview doctors:', e.message);
    }

    try {
      const po = await scalar(
        `SELECT COUNT(*)::int AS c FROM auth_users WHERE LOWER(TRIM(role)) = 'user'`
      );
      overview.totalPetOwners = po?.c ?? 0;
      const st = await scalar(
        `SELECT COUNT(*)::int AS c FROM auth_users WHERE LOWER(TRIM(role)) = 'staff'`
      );
      overview.totalStaff = st?.c ?? 0;
      const ad = await scalar(
        `SELECT COUNT(*)::int AS c FROM auth_users WHERE LOWER(TRIM(role)) = 'admin'`
      );
      overview.totalAdmins = ad?.c ?? 0;
    } catch (e) {
      console.warn('admin stats overview users:', e.message);
    }

    try {
      const rev = await scalar(
        `SELECT COALESCE(SUM(amount_cents), 0)::bigint AS s
         FROM payment_transactions
         WHERE status = ANY($1::text[])`,
        [PAID_TX_STATUSES]
      );
      overview.revenueCents = Number(rev?.s ?? 0);
    } catch (e) {
      console.warn('admin stats overview payments:', e.message);
    }

    try {
      const so = await scalar(
        `SELECT COUNT(*)::int AS c, COALESCE(SUM(total_cents), 0)::bigint AS revenue
         FROM shop_orders WHERE status = $1`,
        [ORDER_STATUSES.PAID]
      );
      overview.shopOrdersPaid = so?.c ?? 0;
      overview.shopRevenueCents = Number(so?.revenue ?? 0);
    } catch (e) {
      console.warn('admin stats overview shop_orders:', e.message);
    }

    try {
      const mr = await scalar(`SELECT COUNT(*)::int AS c FROM pet_medical_records`);
      overview.medicalRecordsCount = mr?.c ?? 0;
    } catch (e) {
      /* optional table */
    }

    try {
      const vac = await scalar(
        `SELECT COUNT(*)::int AS c FROM vaccinations
         WHERE administered_date IS NULL AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`
      );
      overview.vaccinationsDueSoon = vac?.c ?? 0;
    } catch (e) {
      /* optional */
    }

    try {
      const n = await scalar(
        `SELECT COUNT(*)::int AS c FROM notifications WHERE is_read = false`
      );
      overview.notificationsUnread = n?.c ?? 0;
    } catch (e) {
      /* optional */
    }

    try {
      const ap = await scalar(
        `SELECT COUNT(*)::int AS c FROM doctor_applications WHERE status = 'pending'`
      );
      overview.doctorApplicationsPending = ap?.c ?? 0;
    } catch (e) {
      /* optional */
    }

    try {
      const mp = await scalar(
        `SELECT COUNT(*)::int AS c FROM pets WHERE listing_status = 'pending_approval'`
      );
      overview.marketplaceAdsPending = mp?.c ?? 0;
    } catch (e) {
      /* optional */
    }

    res.json({ overview });
  } catch (err) {
    console.error('Admin overview error:', err.message);
    res.status(500).json({ error: 'Failed to load overview stats' });
  }
});

/**
 * Appointment counts grouped by status.
 */
router.get('/stats/appointments-by-status', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT status, COUNT(*)::int AS count
       FROM appointments
       GROUP BY status
       ORDER BY count DESC`
    );
    res.json({ breakdown: r.rows });
  } catch (err) {
    console.error('Admin appointments-by-status:', err.message);
    res.status(500).json({ error: 'Failed to load appointment breakdown' });
  }
});

/**
 * Daily appointment volume by created_at.
 */
router.get('/analytics/appointments-daily', async (req, res) => {
  const days = Math.min(90, Math.max(7, parseInt(String(req.query.days), 10) || 30));
  try {
    const r = await pool.query(
      `SELECT (created_at::date)::text AS day, COUNT(*)::int AS count
       FROM appointments
       WHERE created_at::date >= CURRENT_DATE - $1::integer
       GROUP BY created_at::date
       ORDER BY day ASC`,
      [days]
    );
    res.json({ days, series: r.rows });
  } catch (err) {
    console.error('Admin appointments-daily:', err.message);
    res.status(500).json({ error: 'Failed to load appointment analytics' });
  }
});

/**
 * Paid revenue per day from payment_transactions.
 */
router.get('/analytics/revenue-daily', async (req, res) => {
  const days = Math.min(90, Math.max(7, parseInt(String(req.query.days), 10) || 30));
  try {
    const r = await pool.query(
      `SELECT (COALESCE(paid_at, created_at)::date)::text AS day,
              COALESCE(SUM(amount_cents), 0)::bigint AS cents
       FROM payment_transactions
       WHERE status = ANY($2::text[])
         AND COALESCE(paid_at, created_at)::date >= CURRENT_DATE - $1::integer
       GROUP BY COALESCE(paid_at, created_at)::date
       ORDER BY day ASC`,
      [days, PAID_TX_STATUSES]
    );
    const series = r.rows.map((row) => ({ day: row.day, cents: Number(row.cents) }));
    res.json({ days, series });
  } catch (err) {
    console.error('Admin revenue-daily:', err.message);
    res.status(500).json({ error: 'Failed to load revenue analytics' });
  }
});

/**
 * Bookings vs revenue summary for one calendar month.
 */
router.get('/reports/monthly-summary', async (req, res) => {
  const now = new Date();
  const y = parseInt(String(req.query.year || now.getFullYear()), 10);
  const m = parseInt(String(req.query.month || now.getMonth() + 1), 10);
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
    return res.status(400).json({ error: 'Invalid year/month' });
  }

  const pad = (n) => String(n).padStart(2, '0');
  const monthStart = `${y}-${pad(m)}-01`;
  const nextM = m === 12 ? 1 : m + 1;
  const nextY = m === 12 ? y + 1 : y;
  const monthEndExclusive = `${nextY}-${pad(nextM)}-01`;

  try {
    const bookings = await pool.query(
      `SELECT COUNT(*)::int AS c
       FROM appointments
       WHERE created_at >= $1::date AND created_at < $2::date`,
      [monthStart, monthEndExclusive]
    );

    let revenueCents = 0;
    try {
      const rev = await pool.query(
        `SELECT COALESCE(SUM(amount_cents), 0)::bigint AS s
         FROM payment_transactions
         WHERE status = ANY($3::text[])
           AND COALESCE(paid_at, created_at) >= $1::timestamp
           AND COALESCE(paid_at, created_at) < $2::timestamp`,
        [monthStart, monthEndExclusive, PAID_TX_STATUSES]
      );
      revenueCents = Number(rev.rows[0]?.s ?? 0);
    } catch (_e) {
      /* payments optional */
    }

    let shopOrders = { count: 0, cents: 0 };
    try {
      const so = await pool.query(
        `SELECT COUNT(*)::int AS c, COALESCE(SUM(total_cents), 0)::bigint AS s
         FROM shop_orders
         WHERE status = $3
           AND created_at >= $1::timestamp
           AND created_at < $2::timestamp`,
        [monthStart, monthEndExclusive, ORDER_STATUSES.PAID]
      );
      shopOrders = { count: so.rows[0]?.c ?? 0, cents: Number(so.rows[0]?.s ?? 0) };
    } catch (_e) {
      /* shop optional */
    }

    let visitsCompleted = 0;
    try {
      const v = await pool.query(
        `SELECT COUNT(*)::int AS c
         FROM appointments
         WHERE status = 'completed'
           AND appointment_date >= $1::date
           AND appointment_date < $2::date`,
        [monthStart, monthEndExclusive]
      );
      visitsCompleted = v.rows[0]?.c ?? 0;
    } catch (_e) {
      /* */
    }

    let treatmentsRecorded = 0;
    try {
      const tr = await pool.query(
        `SELECT COUNT(*)::int AS c
         FROM pet_medical_records
         WHERE visit_date >= $1::date AND visit_date < $2::date`,
        [monthStart, monthEndExclusive]
      );
      treatmentsRecorded = tr.rows[0]?.c ?? 0;
    } catch (_e) {
      /* */
    }

    res.json({
      year: y,
      month: m,
      monthStart,
      monthEndExclusive,
      bookingsCreated: bookings.rows[0]?.c ?? 0,
      visitsCompleted,
      treatmentsRecorded,
      paymentRevenueCents: revenueCents,
      shopPaidOrders: shopOrders.count,
      shopRevenueCents: shopOrders.cents,
    });
  } catch (err) {
    console.error('Admin monthly-summary:', err.message);
    res.status(500).json({ error: 'Failed to build monthly report' });
  }
});

/**
 * Combined recent clinic-wide activity for admin dashboards.
 */
router.get('/activity/recent', async (req, res) => {
  const limit = Math.min(40, Math.max(5, parseInt(String(req.query.limit), 10) || 20));
  try {
    const events = [];

    const ap = await pool.query(
      `SELECT id, status, appointment_date::text AS d, created_at::text AS at
       FROM appointments ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    ap.rows.forEach((r) => {
      events.push({
        kind: 'appointment',
        summary: `Appointment #${r.id} — ${r.status}`,
        meta: r.d,
        occurredAt: r.at,
      });
    });

    try {
      const pay = await pool.query(
        `SELECT id, status, description, amount_cents, currency, created_at::text AS at
         FROM payment_transactions
         ORDER BY created_at DESC LIMIT $1`,
        [limit]
      );
      pay.rows.forEach((r) => {
        events.push({
          kind: 'payment',
          summary: `Payment ${r.status}${r.description ? `: ${r.description}` : ''}`,
          meta: `${(r.amount_cents || 0) / 100} ${r.currency || 'usd'}`,
          occurredAt: r.at,
        });
      });
    } catch (_e) {
      /* */
    }

    try {
      const nu = await pool.query(
        `SELECT id, email, role, created_at::text AS at FROM auth_users
         ORDER BY created_at DESC LIMIT $1`,
        [limit]
      );
      nu.rows.forEach((r) => {
        events.push({
          kind: 'registration',
          summary: `New account: ${r.email}`,
          meta: String(r.role),
          occurredAt: r.at,
        });
      });
    } catch (_e) {
      /* */
    }

    events.sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
    res.json({ activity: events.slice(0, limit) });
  } catch (err) {
    console.error('Admin recent activity:', err.message);
    res.status(500).json({ error: 'Failed to load recent activity' });
  }
});

/**
 * Vaccination reminders: due within N days (not yet administered).
 */
router.get('/insights/vaccinations-due', async (req, res) => {
  const within = Math.min(365, Math.max(1, parseInt(String(req.query.withinDays), 10) || 30));
  try {
    const r = await pool.query(
      `SELECT v.id, v.pet_id, v.vaccine_name, v.due_date::text AS due_date, p.pet_name
       FROM vaccinations v
       INNER JOIN pets_owned p ON p.id = v.pet_id
       WHERE v.administered_date IS NULL
         AND v.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $1::integer
       ORDER BY v.due_date ASC
       LIMIT 100`,
      [within]
    );
    res.json({ withinDays: within, items: r.rows });
  } catch (err) {
    console.error('Admin vaccinations-due:', err.message);
    res.status(500).json({ error: 'Failed to load vaccination reminders' });
  }
});

module.exports = router;
