const pool = require('./db');

async function migrateAppointments() {
  try {
    await pool.query(`
      ALTER TABLE appointments
      ADD COLUMN IF NOT EXISTS confirmation_message TEXT,
      ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS cancellation_reason TEXT
    `);

    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'appointments' AND column_name = 'doctor_notes'
        ) THEN
          ALTER TABLE appointments ADD COLUMN doctor_notes TEXT;
        END IF;
      END $$;
    `);

    await pool.query(`
      UPDATE appointments SET status = 'pending' WHERE status IN ('scheduled', 'rescheduled');
      UPDATE appointments SET status = 'approved' WHERE status = 'confirmed';
    `);

    await pool.query(`
      ALTER TABLE appointments ALTER COLUMN status SET DEFAULT 'pending'
    `);

    console.log('✓ appointments table migrated (SRS statuses: pending, approved, rejected, completed, cancelled)');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateAppointments();
