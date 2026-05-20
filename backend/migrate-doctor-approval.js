const pool = require('./db');

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE auth_users
      ADD COLUMN IF NOT EXISTS account_status VARCHAR(30) DEFAULT 'active'
    `);

    await pool.query(`
      ALTER TABLE doctors
      ADD COLUMN IF NOT EXISTS user_id INTEGER UNIQUE REFERENCES auth_users(id) ON DELETE SET NULL
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctor_applications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
        specialization VARCHAR(100) NOT NULL,
        license_number VARCHAR(100) NOT NULL,
        qualifications TEXT NOT NULL,
        education TEXT,
        years_of_experience INTEGER,
        bio TEXT,
        available_days TEXT[],
        status VARCHAR(30) DEFAULT 'pending',
        admin_notes TEXT,
        rejection_reason TEXT,
        reviewed_by INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      UPDATE auth_users SET account_status = 'active'
      WHERE account_status IS NULL
    `);

    await pool.query(`
      ALTER TABLE doctor_applications
      ADD COLUMN IF NOT EXISTS license_document_url TEXT
    `);

    console.log('✓ doctor approval migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
