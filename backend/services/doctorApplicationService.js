const pool = require('../db');
const { ACCOUNT_STATUS } = require('../config/accountStatus');

const APPLICATION_SELECT = `
  da.id, da.user_id, da.specialization, da.license_number, da.qualifications,
  da.education, da.years_of_experience, da.bio, da.available_days,
  da.license_document_url, da.profile_image_url,
  da.status, da.admin_notes, da.rejection_reason, da.reviewed_by, da.reviewed_at,
  da.created_at, da.updated_at,
  u.email, u.full_name, u.mobile_number, u.address, u.account_status
`;

function mapApplication(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    specialization: row.specialization,
    licenseNumber: row.license_number,
    qualifications: row.qualifications,
    education: row.education,
    yearsOfExperience: row.years_of_experience,
    bio: row.bio,
    availableDays: row.available_days || [],
    licenseDocumentUrl: row.license_document_url,
    profileImageUrl: row.profile_image_url,
    status: row.status,
    adminNotes: row.admin_notes,
    rejectionReason: row.rejection_reason,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    applicant: {
      email: row.email,
      fullName: row.full_name,
      mobileNumber: row.mobile_number,
      address: row.address,
      accountStatus: row.account_status,
    },
  };
}

async function fetchApplicationByUserId(userId) {
  const result = await pool.query(
    `SELECT ${APPLICATION_SELECT}
     FROM doctor_applications da
     JOIN auth_users u ON u.id = da.user_id
     WHERE da.user_id = $1`,
    [userId]
  );
  return mapApplication(result.rows[0]);
}

async function fetchApplicationById(id) {
  const result = await pool.query(
    `SELECT ${APPLICATION_SELECT}
     FROM doctor_applications da
     JOIN auth_users u ON u.id = da.user_id
     WHERE da.id = $1`,
    [id]
  );
  return mapApplication(result.rows[0]);
}

async function listApplications(status) {
  let query = `SELECT ${APPLICATION_SELECT}
     FROM doctor_applications da
     JOIN auth_users u ON u.id = da.user_id`;
  const params = [];
  if (status) {
    query += ' WHERE da.status = $1';
    params.push(status);
  }
  query += ' ORDER BY da.created_at DESC';
  const result = await pool.query(query, params);
  return result.rows.map(mapApplication);
}

async function getDoctorProfileByUserId(userId) {
  const result = await pool.query(
    `SELECT d.id, d.name, d.specialization, d.email, d.phone, d.bio, d.available_days, d.user_id,
            COALESCE(d.image_url, da.profile_image_url) AS image_url
     FROM doctors d
     LEFT JOIN doctor_applications da ON da.user_id = d.user_id
     WHERE d.user_id = $1
     ORDER BY da.updated_at DESC NULLS LAST
     LIMIT 1`,
    [userId]
  );
  const row = result.rows[0];
  if (!row) return null;
  return mapDoctorProfileRow(row);
}

function mapDoctorProfileRow(row) {
  return {
    id: row.id,
    name: row.name,
    specialization: row.specialization,
    email: row.email,
    phone: row.phone,
    imageUrl: row.image_url || null,
    bio: row.bio,
    availableDays: row.available_days || [],
    userId: row.user_id,
  };
}

/** Links an orphan clinic-doctors row (same email) to the logged-in vet account. */
async function ensureDoctorProfileForUser(userId) {
  const existing = await getDoctorProfileByUserId(userId);
  if (existing) return existing;

  const userRes = await pool.query(
    'SELECT email FROM auth_users WHERE id = $1',
    [userId]
  );
  const email = userRes.rows[0]?.email;
  if (!email) return null;

  const docRes = await pool.query(
    `SELECT id FROM doctors
     WHERE user_id = $1 OR (user_id IS NULL AND LOWER(email) = LOWER($2))
     ORDER BY user_id NULLS LAST, id ASC
     LIMIT 1`,
    [userId, email]
  );
  if (docRes.rows.length === 0) return null;

  await pool.query(
    `UPDATE doctors SET user_id = $1
     WHERE id = $2 AND (user_id IS NULL OR user_id = $1)`,
    [userId, docRes.rows[0].id]
  );
  return getDoctorProfileByUserId(userId);
}

async function approveApplication(applicationId, adminUserId, adminNotes) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const appRes = await client.query(
      `SELECT da.*, u.email, u.full_name, u.mobile_number
       FROM doctor_applications da
       JOIN auth_users u ON u.id = da.user_id
       WHERE da.id = $1 FOR UPDATE`,
      [applicationId]
    );
    const app = appRes.rows[0];
    if (!app) throw new Error('Application not found');
    if (app.status !== 'pending') throw new Error('Only pending applications can be approved');

    await client.query(
      `UPDATE auth_users
       SET account_status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [ACCOUNT_STATUS.ACTIVE, app.user_id]
    );

    const existingDoctor = await client.query(
      'SELECT id FROM doctors WHERE user_id = $1 OR email = $2',
      [app.user_id, app.email]
    );

    let doctorId;
    if (existingDoctor.rows.length > 0) {
      doctorId = existingDoctor.rows[0].id;
      await client.query(
        `UPDATE doctors SET
           user_id = $1, name = $2, specialization = $3, phone = $4,
           bio = $5, available_days = $6, image_url = COALESCE($7, image_url)
         WHERE id = $8`,
        [
          app.user_id,
          app.full_name,
          app.specialization,
          app.mobile_number,
          app.bio,
          app.available_days || [],
          app.profile_image_url || null,
          doctorId,
        ]
      );
    } else {
      const ins = await client.query(
        `INSERT INTO doctors (user_id, name, specialization, email, phone, bio, available_days, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          app.user_id,
          app.full_name,
          app.specialization,
          app.email,
          app.mobile_number || null,
          app.bio,
          app.available_days || [],
          app.profile_image_url || null,
        ]
      );
      doctorId = ins.rows[0].id;
    }

    await client.query(
      `UPDATE doctor_applications
       SET status = 'approved', admin_notes = $1, reviewed_by = $2,
           reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [adminNotes || null, adminUserId, applicationId]
    );

    await client.query('COMMIT');
    return { doctorId, userId: app.user_id };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function rejectApplication(applicationId, adminUserId, rejectionReason, adminNotes) {
  const appRes = await pool.query(
    'SELECT user_id, status FROM doctor_applications WHERE id = $1',
    [applicationId]
  );
  const app = appRes.rows[0];
  if (!app) throw new Error('Application not found');
  if (app.status !== 'pending') throw new Error('Only pending applications can be rejected');

  await pool.query(
    `UPDATE auth_users SET account_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
    [ACCOUNT_STATUS.REJECTED, app.user_id]
  );
  await pool.query(
    `UPDATE doctor_applications
     SET status = 'rejected', rejection_reason = $1, admin_notes = $2,
         reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = $4`,
    [rejectionReason, adminNotes || null, adminUserId, applicationId]
  );
}

module.exports = {
  mapApplication,
  fetchApplicationByUserId,
  fetchApplicationById,
  listApplications,
  getDoctorProfileByUserId,
  approveApplication,
  rejectApplication,
};
