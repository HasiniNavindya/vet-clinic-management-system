const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { PAYMENT_STATUSES, ORDER_STATUSES } = require('../config/payments');

const router = express.Router();
router.use(authenticateToken, requireRole('admin'));

const PAID = [PAYMENT_STATUSES.SUCCEEDED];

function monthRange(year, month) {
  const pad = (n) => String(n).padStart(2, '0');
  const monthStart = `${year}-${pad(month)}-01`;
  const nextM = month === 12 ? 1 : month + 1;
  const nextY = month === 12 ? year + 1 : year;
  const monthEndExclusive = `${nextY}-${pad(nextM)}-01`;
  return { monthStart, monthEndExclusive, year, month };
}

function escapeCsv(val) {
  const s = val == null ? '' : String(val);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows, headers) {
  const lines = [headers.map(escapeCsv).join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsv(row[h])).join(','));
  }
  return lines.join('\r\n');
}

router.get('/reports/dashboard', async (req, res) => {
  const now = new Date();
  const y = parseInt(String(req.query.year || now.getFullYear()), 10);
  const m = parseInt(String(req.query.month || now.getMonth() + 1), 10);
  const { monthStart, monthEndExclusive } = monthRange(y, m);

  try {
    const bookings = await pool.query(
      `SELECT COUNT(*)::int AS c FROM appointments
       WHERE created_at >= $1::date AND created_at < $2::date`,
      [monthStart, monthEndExclusive]
    );
    const visits = await pool.query(
      `SELECT COUNT(*)::int AS c FROM appointments
       WHERE status = 'completed' AND appointment_date >= $1::date AND appointment_date < $2::date`,
      [monthStart, monthEndExclusive]
    );
    const treatments = await pool.query(
      `SELECT COUNT(*)::int AS c FROM pet_medical_records
       WHERE visit_date >= $1::date AND visit_date < $2::date`,
      [monthStart, monthEndExclusive]
    );
    const payments = await pool.query(
      `SELECT COUNT(*)::int AS c, COALESCE(SUM(amount_cents), 0)::bigint AS revenue
       FROM payment_transactions
       WHERE status = ANY($3::text[])
         AND COALESCE(paid_at, created_at) >= $1::timestamp
         AND COALESCE(paid_at, created_at) < $2::timestamp`,
      [monthStart, monthEndExclusive, PAID]
    );
    const shop = await pool.query(
      `SELECT COUNT(*)::int AS c, COALESCE(SUM(total_cents), 0)::bigint AS revenue
       FROM shop_orders
       WHERE status = $4 AND created_at >= $1::timestamp AND created_at < $2::timestamp`,
      [monthStart, monthEndExclusive, ORDER_STATUSES.PAID]
    );
    const apptByStatus = await pool.query(
      `SELECT status, COUNT(*)::int AS c FROM appointments
       WHERE created_at >= $1::date AND created_at < $2::date
       GROUP BY status`,
      [monthStart, monthEndExclusive]
    );

    res.json({
      year: y,
      month: m,
      bookingsCreated: bookings.rows[0]?.c ?? 0,
      visitsCompleted: visits.rows[0]?.c ?? 0,
      treatmentsRecorded: treatments.rows[0]?.c ?? 0,
      paymentCount: payments.rows[0]?.c ?? 0,
      paymentRevenueCents: Number(payments.rows[0]?.revenue ?? 0),
      shopOrdersPaid: shop.rows[0]?.c ?? 0,
      shopRevenueCents: Number(shop.rows[0]?.revenue ?? 0),
      appointmentsByStatus: apptByStatus.rows,
    });
  } catch (err) {
    console.error('reports dashboard:', err.message);
    res.status(500).json({ error: 'Failed to build report dashboard' });
  }
});

router.get('/reports/export.csv', async (req, res) => {
  const report = String(req.query.report || 'payments').toLowerCase();
  const now = new Date();
  const y = parseInt(String(req.query.year || now.getFullYear()), 10);
  const m = parseInt(String(req.query.month || now.getMonth() + 1), 10);
  const { monthStart, monthEndExclusive } = monthRange(y, m);

  try {
    let csv = '';
    let filename = `report-${report}-${y}-${m}.csv`;

    if (report === 'payments' || report === 'revenue') {
      const r = await pool.query(
        `SELECT pt.id, pt.type, pt.status, pt.amount_cents, pt.currency, pt.payment_method,
                pt.description, pt.paid_at, pt.created_at, u.email, u.full_name
         FROM payment_transactions pt
         LEFT JOIN auth_users u ON u.id = pt.user_id
         WHERE COALESCE(pt.paid_at, pt.created_at) >= $1::timestamp
           AND COALESCE(pt.paid_at, pt.created_at) < $2::timestamp
         ORDER BY pt.created_at DESC`,
        [monthStart, monthEndExclusive]
      );
      csv = toCsv(
        r.rows.map((row) => ({
          id: row.id,
          type: row.type,
          status: row.status,
          amount_usd: (row.amount_cents / 100).toFixed(2),
          currency: row.currency,
          method: row.payment_method,
          description: row.description,
          customer: row.full_name,
          email: row.email,
          paid_at: row.paid_at,
          created_at: row.created_at,
        })),
        [
          'id',
          'type',
          'status',
          'amount_usd',
          'currency',
          'method',
          'description',
          'customer',
          'email',
          'paid_at',
          'created_at',
        ]
      );
      filename = `revenue-payments-${y}-${m}.csv`;
    } else if (report === 'appointments') {
      const r = await pool.query(
        `SELECT a.id, a.status, a.appointment_date, a.appointment_time, a.payment_status,
                u.full_name AS owner, d.name AS doctor, p.pet_name, a.created_at
         FROM appointments a
         LEFT JOIN auth_users u ON u.id = a.user_id
         LEFT JOIN doctors d ON d.id = a.doctor_id
         LEFT JOIN pets_owned p ON p.id = a.pet_id
         WHERE a.created_at >= $1::timestamp AND a.created_at < $2::timestamp
         ORDER BY a.created_at DESC`,
        [monthStart, monthEndExclusive]
      );
      csv = toCsv(
        r.rows.map((row) => ({
          id: row.id,
          status: row.status,
          date: row.appointment_date,
          time: row.appointment_time,
          payment_status: row.payment_status,
          owner: row.owner,
          doctor: row.doctor,
          pet: row.pet_name,
          created_at: row.created_at,
        })),
        ['id', 'status', 'date', 'time', 'payment_status', 'owner', 'doctor', 'pet', 'created_at']
      );
      filename = `appointments-${y}-${m}.csv`;
    } else if (report === 'treatments') {
      const r = await pool.query(
        `SELECT r.id, r.visit_date, r.diagnosis, r.treatment, p.pet_name, d.name AS doctor, r.created_at
         FROM pet_medical_records r
         JOIN pets_owned p ON p.id = r.pet_id
         LEFT JOIN doctors d ON d.id = r.doctor_id
         WHERE r.visit_date >= $1::date AND r.visit_date < $2::date
         ORDER BY r.visit_date DESC`,
        [monthStart, monthEndExclusive]
      );
      csv = toCsv(
        r.rows.map((row) => ({
          id: row.id,
          visit_date: row.visit_date,
          pet: row.pet_name,
          doctor: row.doctor,
          diagnosis: row.diagnosis,
          treatment: row.treatment,
          created_at: row.created_at,
        })),
        ['id', 'visit_date', 'pet', 'doctor', 'diagnosis', 'treatment', 'created_at']
      );
      filename = `treatments-${y}-${m}.csv`;
    } else if (report === 'vaccinations') {
      const r = await pool.query(
        `SELECT v.id, v.vaccine_name, v.due_date, v.administered_date, v.status,
                p.pet_name, u.full_name AS owner_name, u.email AS owner_email, d.name AS doctor
         FROM vaccinations v
         JOIN pets_owned p ON p.id = v.pet_id
         JOIN auth_users u ON u.id = p.user_id
         LEFT JOIN doctors d ON d.id = v.doctor_id
         WHERE v.due_date >= $1::date AND v.due_date < $2::date
         ORDER BY v.due_date ASC`,
        [monthStart, monthEndExclusive]
      );
      csv = toCsv(
        r.rows.map((row) => ({
          id: row.id,
          vaccine: row.vaccine_name,
          due_date: row.due_date,
          administered: row.administered_date,
          status: row.status,
          pet: row.pet_name,
          owner: row.owner_name,
          email: row.owner_email,
          doctor: row.doctor,
        })),
        [
          'id',
          'vaccine',
          'due_date',
          'administered',
          'status',
          'pet',
          'owner',
          'email',
          'doctor',
        ]
      );
      filename = `vaccinations-${y}-${m}.csv`;
    } else if (report === 'shop') {
      const r = await pool.query(
        `SELECT o.id, o.status, o.total_cents, o.fulfillment_status, u.full_name, u.email, o.created_at
         FROM shop_orders o
         JOIN auth_users u ON u.id = o.user_id
         WHERE o.created_at >= $1::timestamp AND o.created_at < $2::timestamp
         ORDER BY o.created_at DESC`,
        [monthStart, monthEndExclusive]
      );
      csv = toCsv(
        r.rows.map((row) => ({
          id: row.id,
          status: row.status,
          total_usd: (row.total_cents / 100).toFixed(2),
          fulfillment: row.fulfillment_status,
          customer: row.full_name,
          email: row.email,
          created_at: row.created_at,
        })),
        ['id', 'status', 'total_usd', 'fulfillment', 'customer', 'email', 'created_at']
      );
      filename = `shop-sales-${y}-${m}.csv`;
    } else {
      return res.status(400).json({
        error: 'Invalid report type',
        allowed: ['payments', 'revenue', 'appointments', 'treatments', 'vaccinations', 'shop'],
      });
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv);
  } catch (err) {
    console.error('export csv:', err.message);
    res.status(500).json({ error: 'Export failed' });
  }
});

/** Printable HTML report (open in browser → Save as PDF). */
router.get('/reports/export.pdf', async (req, res) => {
  const report = String(req.query.report || 'summary').toLowerCase();
  const now = new Date();
  const y = parseInt(String(req.query.year || now.getFullYear()), 10);
  const m = parseInt(String(req.query.month || now.getMonth() + 1), 10);
  const label = new Date(y, m - 1, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });

  try {
    const dashRes = await pool.query(
      `SELECT COUNT(*)::int AS bookings FROM appointments
       WHERE created_at >= $1::date AND created_at < $2::date`,
      [monthRange(y, m).monthStart, monthRange(y, m).monthEndExclusive]
    );
    const revRes = await pool.query(
      `SELECT COALESCE(SUM(amount_cents), 0)::bigint AS s FROM payment_transactions
       WHERE status = ANY($3::text[]) AND COALESCE(paid_at, created_at) >= $1::timestamp
         AND COALESCE(paid_at, created_at) < $2::timestamp`,
      [monthRange(y, m).monthStart, monthRange(y, m).monthEndExclusive, PAID]
    );
    const revenue = Number(revRes.rows[0]?.s ?? 0) / 100;
    const bookings = dashRes.rows[0]?.bookings ?? 0;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Report ${label}</title>
<style>body{font-family:system-ui,sans-serif;padding:2rem;color:#111}h1{color:#ec6d13}
table{border-collapse:collapse;width:100%;margin-top:1rem}th,td{border:1px solid #ddd;padding:8px;text-align:left}
th{background:#f9fafb}</style></head><body>
<h1>Carlisle Pet Care — ${report} report</h1>
<p><strong>Period:</strong> ${label}</p>
<ul>
<li>Bookings created: ${bookings}</li>
<li>Payment revenue (recorded): $${revenue.toFixed(2)}</li>
</ul>
<p><em>Generated ${new Date().toLocaleString()}. Use your browser Print → Save as PDF for a PDF file.</em></p>
</body></html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="report-${report}-${y}-${m}.html"`
    );
    res.send(html);
  } catch (err) {
    console.error('export pdf/html:', err.message);
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;
