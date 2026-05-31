const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ACCOUNT_STATUS } = require('../config/accountStatus');
const {
  listApplications,
  fetchApplicationById,
  approveApplication,
  rejectApplication,
} = require('../services/receptionistApplicationService');

const router = express.Router();

async function handleReceptionistRegister(req, res) {
  const { email, password, fullName, mobileNumber, address } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    const existing = await pool.query('SELECT id FROM auth_users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const userRes = await client.query(
        `INSERT INTO auth_users (
           email, password_hash, full_name, mobile_number, address, role, account_status
         ) VALUES ($1, $2, $3, $4, $5, 'receptionist', $6)
         RETURNING id, email, full_name`,
        [email, passwordHash, fullName, mobileNumber || null, address || null, ACCOUNT_STATUS.PENDING]
      );
      const user = userRes.rows[0];

      await client.query(
        `INSERT INTO user_preferences (user_id, vaccination_reminders, appointment_updates)
         VALUES ($1, false, true)`,
        [user.id]
      );

      const appRes = await client.query(
        `INSERT INTO receptionist_applications (user_id, status)
         VALUES ($1, 'pending')
         RETURNING id`,
        [user.id]
      );

      await client.query('COMMIT');
      res.status(201).json({
        pendingApproval: true,
        message:
          'Your receptionist application was submitted. An administrator will review it before you can log in.',
        applicationId: appRes.rows[0].id,
        email: user.email,
        fullName: user.full_name,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Receptionist register error:', err.message);
    res.status(500).json({ error: 'Failed to submit application' });
  }
}

router.post('/register', handleReceptionistRegister);

router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : 'pending';
    const list = await listApplications(status);
    res.json({ applications: list });
  } catch (err) {
    console.error('List receptionist applications error:', err.message);
    res.status(500).json({ error: 'Failed to list applications' });
  }
});

router.get('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const app = await fetchApplicationById(Number(req.params.id));
    if (!app) return res.status(404).json({ error: 'Application not found' });
    res.json(app);
  } catch (err) {
    console.error('Get receptionist application error:', err.message);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

router.post('/:id/approve', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const app = await approveApplication(
      Number(req.params.id),
      req.user.id,
      req.body?.adminNotes
    );
    res.json({ message: 'Receptionist approved', application: app });
  } catch (err) {
    const code = err.message.includes('not found') || err.message.includes('pending') ? 400 : 500;
    res.status(code).json({ error: err.message || 'Approval failed' });
  }
});

router.post('/:id/reject', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const reason = req.body?.rejectionReason;
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    const app = await rejectApplication(
      Number(req.params.id),
      req.user.id,
      String(reason).trim(),
      req.body?.adminNotes
    );
    res.json({ message: 'Application rejected', application: app });
  } catch (err) {
    const code = err.message.includes('not found') || err.message.includes('pending') ? 400 : 500;
    res.status(code).json({ error: err.message || 'Rejection failed' });
  }
});

module.exports = {
  router,
  handleReceptionistRegister,
};
