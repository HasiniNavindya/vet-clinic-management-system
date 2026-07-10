const pool = require('./db');

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS client_feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
        appointment_id INTEGER UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        target_type VARCHAR(30) NOT NULL DEFAULT 'appointment',
        target_id INTEGER,
        approved_by INTEGER REFERENCES auth_users(id) ON DELETE SET NULL,
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      ALTER TABLE client_feedback
      ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'pending'
    `);
    await pool.query(`
      ALTER TABLE client_feedback
      ADD COLUMN IF NOT EXISTS target_type VARCHAR(30) NOT NULL DEFAULT 'appointment'
    `);
    await pool.query(`
      ALTER TABLE client_feedback
      ADD COLUMN IF NOT EXISTS target_id INTEGER
    `);
    await pool.query(`
      ALTER TABLE client_feedback
      ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES auth_users(id) ON DELETE SET NULL
    `);
    await pool.query(`
      ALTER TABLE client_feedback
      ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_client_feedback_user ON client_feedback(user_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_client_feedback_status ON client_feedback(status)
    `);

    console.log('✓ client_feedback table ready');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
