const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  normalizeRole,
  getRoleConfig,
  ALL_ROLE_IDS,
} = require('../config/roles');
const { ACCOUNT_STATUS } = require('../config/accountStatus');

const router = express.Router();

router.use(authenticateToken, requireRole('admin'));

/**
 * List users with search, role filter, status filter, pagination.
 */
router.get('/users', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
    const offset = (page - 1) * limit;

    const searchRaw = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const roleFilter = normalizeRole(req.query.role);
    const statusFilter =
      typeof req.query.status === 'string' ? req.query.status.trim().toLowerCase() : 'all';

    const conditions = ['1 = 1'];
    const params = [];
    let p = 1;

    if (searchRaw) {
      const isNumericId = /^\d+$/.test(searchRaw);
      if (isNumericId) {
        conditions.push(`(u.email ILIKE $${p} OR u.full_name ILIKE $${p} OR u.id = $${p + 1})`);
        params.push(`%${searchRaw}%`, Number(searchRaw));
        p += 2;
      } else {
        conditions.push(`(u.email ILIKE $${p} OR u.full_name ILIKE $${p})`);
        params.push(`%${searchRaw}%`);
        p += 1;
      }
    }

    if (roleFilter && ALL_ROLE_IDS.includes(roleFilter)) {
      conditions.push(`LOWER(TRIM(u.role)) = $${p}`);
      params.push(roleFilter);
      p += 1;
    }

    if (statusFilter && statusFilter !== 'all') {
      conditions.push(`COALESCE(u.account_status, 'active') = $${p}`);
      params.push(statusFilter);
      p += 1;
    }

    const whereClause = conditions.join(' AND ');

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM auth_users u WHERE ${whereClause}`,
      params
    );
    const total = countRes.rows[0]?.total || 0;

    const listParams = [...params, limit, offset];
    const limIdx = params.length + 1;
    const offIdx = params.length + 2;

    const listRes = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.mobile_number, u.role, u.account_status, u.created_at
       FROM auth_users u
       WHERE ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${limIdx} OFFSET $${offIdx}`,
      listParams
    );

    const users = listRes.rows.map((row) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      mobileNumber: row.mobile_number,
      role: normalizeRole(row.role) || row.role,
      roleLabel: getRoleConfig(row.role)?.label || row.role,
      accountStatus: row.account_status || ACCOUNT_STATUS.ACTIVE,
      createdAt: row.created_at,
    }));

    res.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error('Admin list users error:', err.message);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

/**
 * User detail + summary counts for pet owners / doctors.
 */
router.get('/users/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid user id' });

    const userRes = await pool.query(
      `SELECT id, email, full_name, mobile_number, address, emergency_contact,
              role, account_status, created_at, updated_at
       FROM auth_users WHERE id = $1`,
      [id]
    );
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const row = userRes.rows[0];
    const role = normalizeRole(row.role) || row.role;

    const summary = { petCount: 0, appointmentCountAsOwner: 0, doctorProfile: null };

    if (role === 'user') {
      const pc = await pool.query(
        'SELECT COUNT(*)::int AS c FROM pets_owned WHERE user_id = $1',
        [id]
      );
      summary.petCount = pc.rows[0]?.c || 0;
      const ac = await pool.query(
        'SELECT COUNT(*)::int AS c FROM appointments WHERE user_id = $1',
        [id]
      );
      summary.appointmentCountAsOwner = ac.rows[0]?.c || 0;
    }

    if (role === 'doctor') {
      const dr = await pool.query(
        `SELECT id, name, specialization, email, phone FROM doctors WHERE user_id = $1`,
        [id]
      );
      if (dr.rows.length > 0) {
        summary.doctorProfile = {
          id: dr.rows[0].id,
          name: dr.rows[0].name,
          specialization: dr.rows[0].specialization,
          email: dr.rows[0].email,
          phone: dr.rows[0].phone,
        };
      }
      const ac = await pool.query(
        `SELECT COUNT(*)::int AS c FROM appointments a
         JOIN doctors d ON a.doctor_id = d.id WHERE d.user_id = $1`,
        [id]
      );
      summary.appointmentCountAsDoctor = ac.rows[0]?.c || 0;
    }

    const appRow = await pool.query(
      `SELECT id, status, specialization FROM doctor_applications WHERE user_id = $1`,
      [id]
    );
    const doctorApplication =
      appRow.rows.length > 0
        ? {
            id: appRow.rows[0].id,
            status: appRow.rows[0].status,
            specialization: appRow.rows[0].specialization,
          }
        : null;

    res.json({
      user: {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        mobileNumber: row.mobile_number,
        address: row.address,
        emergencyContact: row.emergency_contact,
        role,
        roleLabel: getRoleConfig(role)?.label || role,
        accountStatus: row.account_status || ACCOUNT_STATUS.ACTIVE,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      summary,
      doctorApplication,
    });
  } catch (err) {
    console.error('Admin get user error:', err.message);
    res.status(500).json({ error: 'Failed to load user' });
  }
});

/**
 * Recent cross-table activity for the user (appointments, payments, notifications).
 */
router.get('/users/:id/activity', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid user id' });

    const exists = await pool.query('SELECT id, role FROM auth_users WHERE id = $1', [id]);
    if (exists.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const role = normalizeRole(exists.rows[0].role);

    const events = [];

    const apOwner = await pool.query(
      `SELECT id, status, appointment_date, appointment_time, created_at,
              'appointment_as_owner'::text AS source
       FROM appointments WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 25`,
      [id]
    );
    apOwner.rows.forEach((r) => {
      events.push({
        kind: 'appointment',
        summary: `Appointment ${r.status} — ${r.appointment_date}`,
        meta: String(r.appointment_time || '').slice(0, 5),
        occurredAt: r.created_at,
      });
    });

    if (role === 'doctor') {
      const apDoc = await pool.query(
        `SELECT a.id, a.status, a.appointment_date, a.appointment_time, a.created_at
         FROM appointments a
         JOIN doctors d ON a.doctor_id = d.id
         WHERE d.user_id = $1
         ORDER BY a.created_at DESC LIMIT 25`,
        [id]
      );
      apDoc.rows.forEach((r) => {
        events.push({
          kind: 'appointment_doctor',
          summary: `Clinic appointment ${r.status} — ${r.appointment_date}`,
          meta: String(r.appointment_time || '').slice(0, 5),
          occurredAt: r.created_at,
        });
      });
    }

    try {
      const pay = await pool.query(
        `SELECT id, status, description, amount_cents, currency, created_at
         FROM payment_transactions WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 25`,
        [id]
      );
      pay.rows.forEach((r) => {
        events.push({
          kind: 'payment',
          summary: `Payment ${r.status}${r.description ? `: ${r.description}` : ''}`,
          meta: `${(r.amount_cents || 0) / 100} ${r.currency || 'usd'}`,
          occurredAt: r.created_at,
        });
      });
    } catch (_e) {
      /* payment tables optional in some environments */
    }

    let notif = { rows: [] };
    try {
      notif = await pool.query(
        `SELECT id, type, title, message, created_at FROM notifications WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 25`,
        [id]
      );
    } catch (_e) {
      /* notifications optional */
    }
    notif.rows.forEach((r) => {
      events.push({
        kind: 'notification',
        summary: r.title,
        meta: r.type,
        occurredAt: r.created_at,
      });
    });

    events.sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
    res.json({ activity: events.slice(0, 50) });
  } catch (err) {
    console.error('Admin user activity error:', err.message);
    res.status(500).json({ error: 'Failed to load activity' });
  }
});

/**
 * Update role and/or account status (suspend / reactivate).
 */
router.patch('/users/:id', async (req, res) => {
  const targetId = Number(req.params.id);
  const adminId = req.user.id;
  if (!Number.isFinite(targetId)) return res.status(400).json({ error: 'Invalid user id' });

  const { role: newRoleRaw, accountStatus: newStatusRaw } = req.body;

  try {
    const existing = await pool.query(
      'SELECT id, role, account_status FROM auth_users WHERE id = $1',
      [targetId]
    );
    if (existing.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    let newRole =
      newRoleRaw !== undefined && newRoleRaw !== null
        ? normalizeRole(newRoleRaw)
        : null;
    let newStatus =
      newStatusRaw !== undefined && newStatusRaw !== null
        ? String(newStatusRaw).trim().toLowerCase()
        : null;

    if (newRole && !ALL_ROLE_IDS.includes(newRole)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const allowedStatusValues = ['active', 'suspended', 'pending', 'rejected'];
    if (newStatus && !allowedStatusValues.includes(newStatus)) {
      return res.status(400).json({
        error: 'Invalid account status',
        hint: `Use one of: ${allowedStatusValues.join(', ')}`,
      });
    }

    if (targetId === adminId) {
      if (newStatus === ACCOUNT_STATUS.SUSPENDED) {
        return res.status(400).json({ error: 'You cannot suspend your own admin account' });
      }
      if (newRole && newRole !== 'admin') {
        const ac = await pool.query(
          "SELECT COUNT(*)::int AS c FROM auth_users WHERE LOWER(TRIM(role)) = 'admin'"
        );
        if ((ac.rows[0]?.c || 0) <= 1) {
          return res.status(400).json({
            error: 'You cannot change your role: this is the only administrator account',
          });
        }
      }
    }

    if (newRole && newRole !== 'admin' && targetId !== adminId) {
      const targetWasAdmin = normalizeRole(existing.rows[0].role) === 'admin';
      if (targetWasAdmin) {
        const ac = await pool.query(
          "SELECT COUNT(*)::int AS c FROM auth_users WHERE LOWER(TRIM(role)) = 'admin'"
        );
        if ((ac.rows[0]?.c || 0) <= 1) {
          return res.status(400).json({ error: 'Cannot demote the only administrator' });
        }
      }
    }

    const prevRole = normalizeRole(existing.rows[0].role) || existing.rows[0].role;

    const updates = [];
    const values = [];
    let pi = 1;

    if (newRole) {
      updates.push(`role = $${pi++}`);
      values.push(newRole);
    }

    if (newStatus) {
      updates.push(`account_status = $${pi++}`);
      values.push(newStatus);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided (role or accountStatus)' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    values.push(targetId);
    await pool.query(
      `UPDATE auth_users SET ${updates.join(', ')} WHERE id = $${pi}`,
      values
    );

    if (newRole && prevRole === 'doctor' && newRole !== 'doctor') {
      await pool.query('UPDATE doctors SET user_id = NULL WHERE user_id = $1', [targetId]);
    }

    const fresh = await pool.query(
      `SELECT id, email, full_name, mobile_number, address, emergency_contact,
              role, account_status, created_at, updated_at
       FROM auth_users WHERE id = $1`,
      [targetId]
    );
    const u = fresh.rows[0];
    const r = normalizeRole(u.role) || u.role;

    res.json({
      message: 'User updated',
      user: {
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        mobileNumber: u.mobile_number,
        address: u.address,
        emergencyContact: u.emergency_contact,
        role: r,
        roleLabel: getRoleConfig(r)?.label || r,
        accountStatus: u.account_status || ACCOUNT_STATUS.ACTIVE,
        createdAt: u.created_at,
        updatedAt: u.updated_at,
      },
    });
  } catch (err) {
    console.error('Admin patch user error:', err.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;
