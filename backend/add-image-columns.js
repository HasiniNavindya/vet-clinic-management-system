const pool = require('./db');

async function addImageColumns() {
  try {
    // Add image_url to pets_owned
    await pool.query(`
      ALTER TABLE IF EXISTS pets_owned
      ADD COLUMN IF NOT EXISTS image_url TEXT
    `);
    console.log('✓ pets_owned.image_url ensured');

    // Add avatar_url to auth_users
    await pool.query(`
      ALTER TABLE IF EXISTS auth_users
      ADD COLUMN IF NOT EXISTS avatar_url TEXT
    `);
    console.log('✓ auth_users.avatar_url ensured');

    process.exit(0);
  } catch (err) {
    console.error('Error adding image columns:', err);
    process.exit(1);
  }
}

addImageColumns();
