const pool = require('../db');
const { ACCOUNT_STATUS } = require('../config/accountStatus');

function mapRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    rejectionReason: row.rejection_reason,
    adminNotes: row.admin_notes,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    applicant: {
      email: row.email,
      fullName: row.full_name,
      mobileNumber: row.mobile_number,
      address: row.address,
      accountStatus: row.account_status,
    },
  };
}

async function listApplications(statusFilter) {
  const params = [];
  let where = '1=1';
  if (statusFilter && statusFilter !== 'all') {
    params.push(statusFilter);
    where += ` AND ra.status = $${params.length}`;
  }
  const res = await pool.query(
    `SELECT ra.*, u.email, u.full_name, u.mobile_number, u.address, u.account_status
     FROM receptionist_applications ra
     JOIN auth_users u ON u.id = ra.user_id
     WHERE ${where}
     ORDER BY ra.created_at DESC`,
    params
  );
  return res.rows.map(mapRow);
}

async function fetchApplicationById(id) {
  const res = await pool.query(
    `SELECT ra.*, u.email, u.full_name, u.mobile_number, u.address, u.account_status
     FROM receptionist_applications ra
     JOIN auth_users u ON u.id = ra.user_id
     WHERE ra.id = $1`,
    [id]
  );
  return res.rows[0] ? mapRow(res.rows[0]) : null;
}

async function approveApplication(applicationId, adminId, adminNotes) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const appRes = await client.query(
      'SELECT user_id, status FROM receptionist_applications WHERE id = $1 FOR UPDATE',
      [applicationId]
    );
    if (appRes.rows.length === 0) throw new Error('Application not found');
    const app = appRes.rows[0];
    if (app.status !== 'pending') throw new Error('Only pending applications can be approved');

    await client.query(
      `UPDATE receptionist_applications
       SET status = 'approved', admin_notes = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [adminNotes || null, adminId, applicationId]
    );
    await client.query(
      `UPDATE auth_users SET account_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [ACCOUNT_STATUS.ACTIVE, app.user_id]
    );
    await client.query('COMMIT');
    return fetchApplicationById(applicationId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function rejectApplication(applicationId, adminId, rejectionReason, adminNotes) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const appRes = await client.query(
      'SELECT user_id, status FROM receptionist_applications WHERE id = $1 FOR UPDATE',
      [applicationId]
    );
    if (appRes.rows.length === 0) throw new Error('Application not found');
    const app = appRes.rows[0];
    if (app.status !== 'pending') throw new Error('Only pending applications can be rejected');

    await client.query(
      `UPDATE receptionist_applications
       SET status = 'rejected', rejection_reason = $1, admin_notes = $2, reviewed_by = $3,
           reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [rejectionReason, adminNotes || null, adminId, applicationId]
    );
    await client.query(
      `UPDATE auth_users SET account_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [ACCOUNT_STATUS.REJECTED, app.user_id]
    );
    await client.query('COMMIT');
    return fetchApplicationById(applicationId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  listApplications,
  fetchApplicationById,
  approveApplication,
  rejectApplication,
};
