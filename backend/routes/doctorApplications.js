const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ACCOUNT_STATUS } = require('../config/accountStatus');
const {
  listApplications,
  fetchApplicationById,
  fetchApplicationByUserId,
  approveApplication,
  rejectApplication,
  getDoctorProfileByUserId,
} = require('../services/doctorApplicationService');

const router = express.Router();

const SPECIALIZATIONS = [
  'General Practice',
  'Surgeon',
  'Cardiologist',
  'Dermatologist',
  'Nutritionist',
  'Allergist',
  'Therapist',
  'Emergency Care',
];

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ALLOWED_LICENSE_EXT = new Set(['.pdf', '.jpg', '.jpeg', '.png']);

function getDoctorApplicationMetaData() {
  return { specializations: SPECIALIZATIONS, weekDays: WEEKDAYS };
}

/**
 * Save base64 license/proof file. Returns public URL path like /uploads/doctor-licenses/...
 */
function saveLicenseDocument(base64, originalFilename, userIdForName) {
  if (!base64 || typeof base64 !== 'string') return null;
  const trimmed = base64.includes(',') ? base64.split(',').pop() : base64;
  const extFromName = originalFilename ? path.extname(originalFilename).toLowerCase() : '';
  const ext = ALLOWED_LICENSE_EXT.has(extFromName) ? extFromName : '.pdf';
  const uploadsRoot = path.join(__dirname, '..', 'uploads');
  const dir = path.join(uploadsRoot, 'doctor-licenses');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const safeName = `doc_${userIdForName}_${Date.now()}${ext}`;
  const filePath = path.join(dir, safeName);
  const buffer = Buffer.from(trimmed, 'base64');
  if (buffer.length > 8 * 1024 * 1024) {
    throw new Error('License document must be 8MB or smaller');
  }
  if (buffer.length < 32) {
    throw new Error('Invalid license document file');
  }
  fs.writeFileSync(filePath, buffer);
  return `/uploads/doctor-licenses/${safeName}`;
}

async function handleDoctorRegister(req, res) {
  const {
    email,
    password,
    fullName,
    mobileNumber,
    address,
    emergencyContact,
    specialization,
    licenseNumber,
    qualifications,
    education,
    yearsOfExperience,
    bio,
    availableDays,
    licenseDocumentBase64,
    licenseDocumentFilename,
  } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }
    if (!specialization || !licenseNumber || !qualifications) {
      return res.status(400).json({
        error: 'Specialization, veterinary license number, and qualifications are required',
      });
    }
    if (!licenseDocumentBase64 || !String(licenseDocumentBase64).trim()) {
      return res.status(400).json({
        error: 'A license or professional credential document upload is required (PDF or image)',
      });
    }
    if (!Array.isArray(availableDays) || availableDays.length === 0) {
      return res.status(400).json({ error: 'Select at least one available day' });
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
           email, password_hash, full_name, mobile_number, address,
           emergency_contact, role, account_status
         ) VALUES ($1, $2, $3, $4, $5, $6, 'doctor', $7)
         RETURNING id, email, full_name`,
        [
          email,
          passwordHash,
          fullName,
          mobileNumber || null,
          address || null,
          emergencyContact || null,
          ACCOUNT_STATUS.PENDING,
        ]
      );
      const user = userRes.rows[0];

      let licenseDocumentUrl;
      try {
        licenseDocumentUrl = saveLicenseDocument(
          licenseDocumentBase64,
          licenseDocumentFilename,
          user.id
        );
      } catch (fileErr) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: fileErr.message || 'Invalid license document' });
      }

      await client.query(
        `INSERT INTO user_preferences (user_id, vaccination_reminders, appointment_updates)
         VALUES ($1, false, true)`,
        [user.id]
      );

      const appRes = await client.query(
        `INSERT INTO doctor_applications (
           user_id, specialization, license_number, qualifications, education,
           years_of_experience, bio, available_days, license_document_url, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
         RETURNING id`,
        [
          user.id,
          specialization,
          licenseNumber,
          qualifications,
          education || null,
          yearsOfExperience ? Number(yearsOfExperience) : null,
          bio || null,
          availableDays,
          licenseDocumentUrl,
        ]
      );

      await client.query('COMMIT');
      res.status(201).json({
        pendingApproval: true,
        message:
          'Your application was submitted successfully. An administrator will verify your credentials before you can log in.',
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
    console.error('Doctor register error:', err.message);
    res.status(500).json({ error: 'Failed to submit application' });
  }
}

router.get('/meta', (_req, res) => {
  res.json(getDoctorApplicationMetaData());
});

router.post('/register', handleDoctorRegister);

router.get('/my-application', authenticateToken, requireRole('doctor'), async (req, res) => {
  try {
    const application = await fetchApplicationByUserId(req.user.id);
    if (!application) {
      return res.status(404).json({ error: 'No application found' });
    }
    res.json(application);
  } catch (err) {
    console.error('My application error:', err.message);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

router.get('/admin/list', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const status = req.query.status || null;
    const applications = await listApplications(status);
    res.json(applications);
  } catch (err) {
    console.error('List applications error:', err.message);
    res.status(500).json({ error: 'Failed to list applications' });
  }
});

router.get('/admin/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const application = await fetchApplicationById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json(application);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

router.patch('/admin/:id/approve', authenticateToken, requireRole('admin'), async (req, res) => {
  const { adminNotes } = req.body;
  try {
    const result = await approveApplication(Number(req.params.id), req.user.id, adminNotes);
    const application = await fetchApplicationById(req.params.id);
    res.json({ message: 'Doctor approved and clinic profile created', ...result, application });
  } catch (err) {
    const msg = err.message || 'Approval failed';
    const code = msg.includes('not found') || msg.includes('pending') ? 400 : 500;
    res.status(code).json({ error: msg });
  }
});

router.patch('/admin/:id/reject', authenticateToken, requireRole('admin'), async (req, res) => {
  const { rejectionReason, adminNotes } = req.body;
  if (!rejectionReason || !String(rejectionReason).trim()) {
    return res.status(400).json({ error: 'A rejection reason is required' });
  }
  try {
    await rejectApplication(
      Number(req.params.id),
      req.user.id,
      String(rejectionReason).trim(),
      adminNotes
    );
    const application = await fetchApplicationById(req.params.id);
    res.json({ message: 'Application rejected', application });
  } catch (err) {
    const msg = err.message || 'Rejection failed';
    const code = msg.includes('not found') || msg.includes('pending') ? 400 : 500;
    res.status(code).json({ error: msg });
  }
});

router.put('/doctor/profile', authenticateToken, requireRole('doctor'), async (req, res) => {
  const { bio, availableDays, mobileNumber } = req.body;
  try {
    const statusRes = await pool.query(
      'SELECT account_status FROM auth_users WHERE id = $1',
      [req.user.id]
    );
    if (statusRes.rows[0]?.account_status !== ACCOUNT_STATUS.ACTIVE) {
      return res.status(403).json({ error: 'Account not active' });
    }

    if (mobileNumber !== undefined) {
      await pool.query(
        'UPDATE auth_users SET mobile_number = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [mobileNumber || null, req.user.id]
      );
    }

    const profile = await getDoctorProfileByUserId(req.user.id);
    if (!profile) return res.status(404).json({ error: 'Doctor profile not found' });

    const updates = [];
    const values = [];
    let i = 1;
    if (bio !== undefined) {
      updates.push(`bio = $${i++}`);
      values.push(bio || null);
    }
    if (availableDays !== undefined) {
      updates.push(`available_days = $${i++}`);
      values.push(Array.isArray(availableDays) ? availableDays : []);
    }
    if (mobileNumber !== undefined) {
      updates.push(`phone = $${i++}`);
      values.push(mobileNumber || null);
    }
    if (updates.length > 0) {
      values.push(profile.id);
      await pool.query(`UPDATE doctors SET ${updates.join(', ')} WHERE id = $${i}`, values);
    }

    const updated = await getDoctorProfileByUserId(req.user.id);
    res.json({ message: 'Profile updated', profile: updated });
  } catch (err) {
    console.error('Doctor profile update error:', err.message);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/doctor/dashboard', authenticateToken, requireRole('doctor'), async (req, res) => {
  try {
    const userRes = await pool.query(
      `SELECT id, email, full_name, mobile_number, address, role, account_status
       FROM auth_users WHERE id = $1`,
      [req.user.id]
    );
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = userRes.rows[0];
    if (user.account_status !== ACCOUNT_STATUS.ACTIVE) {
      return res.status(403).json({
        error: 'Account pending approval',
        accountStatus: user.account_status,
      });
    }

    const profile = await getDoctorProfileByUserId(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Doctor profile not linked' });
    }

    const apptRes = await pool.query(
      `SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.notes,
              p.pet_name, u.full_name AS owner_name
       FROM appointments a
       LEFT JOIN pets_owned p ON a.pet_id = p.id
       LEFT JOIN auth_users u ON a.user_id = u.id
       WHERE a.doctor_id = $1
         AND a.appointment_date >= CURRENT_DATE
         AND a.status NOT IN ('cancelled', 'rejected')
       ORDER BY a.appointment_date ASC, a.appointment_time ASC
       LIMIT 20`,
      [profile.id]
    );

    const pendingRes = await pool.query(
      `SELECT COUNT(*)::int AS count FROM appointments
       WHERE doctor_id = $1 AND status = 'pending'`,
      [profile.id]
    );

    res.json({
      profile,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        mobileNumber: user.mobile_number,
        address: user.address,
        accountStatus: user.account_status,
      },
      upcomingAppointments: apptRes.rows.map((r) => ({
        id: r.id,
        appointmentDate: r.appointment_date,
        appointmentTime: r.appointment_time,
        status: r.status,
        notes: r.notes,
        petName: r.pet_name,
        ownerName: r.owner_name,
      })),
      stats: {
        pendingRequests: pendingRes.rows[0]?.count || 0,
        upcomingCount: apptRes.rows.length,
      },
    });
  } catch (err) {
    console.error('Doctor dashboard error:', err.message);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

module.exports = router;
module.exports.getDoctorApplicationMetaData = getDoctorApplicationMetaData;
module.exports.handleDoctorRegister = handleDoctorRegister;
