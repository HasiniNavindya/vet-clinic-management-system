/**
 * Rename staff → receptionist and add receptionist_applications table.
 * Run: node backend/migrate-receptionist-role.js
 */
const pool = require('./db');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      UPDATE auth_users
      SET role = 'receptionist'
      WHERE LOWER(TRIM(role)) = 'staff'
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS receptionist_applications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES auth_users(id) ON DELETE CASCADE,
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        rejection_reason TEXT,
        admin_notes TEXT,
        reviewed_by INTEGER REFERENCES auth_users(id),
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      INSERT INTO receptionist_applications (user_id, status)
      SELECT u.id, 'pending'
      FROM auth_users u
      WHERE LOWER(TRIM(u.role)) = 'receptionist'
        AND COALESCE(u.account_status, 'active') = 'pending'
        AND NOT EXISTS (
          SELECT 1 FROM receptionist_applications ra WHERE ra.user_id = u.id
        )
    `);

    await client.query('COMMIT');
    console.log('✓ receptionist role migration complete');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
