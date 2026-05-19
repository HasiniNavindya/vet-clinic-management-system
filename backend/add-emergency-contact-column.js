const pool = require('./db');

async function addEmergencyContactColumn() {
  try {
    const checkColumn = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'auth_users' AND column_name = 'emergency_contact'
    `);

    if (checkColumn.rows.length === 0) {
      await pool.query(`
        ALTER TABLE auth_users
        ADD COLUMN emergency_contact TEXT
      `);
      console.log('✓ emergency_contact column added to auth_users table');
    } else {
      console.log('✓ emergency_contact column already exists');
    }

    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
  }
}

addEmergencyContactColumn();