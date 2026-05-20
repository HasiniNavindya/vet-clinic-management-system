const pool = require('./db');

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE appointments
      ADD COLUMN IF NOT EXISTS staff_response_reason TEXT,
      ADD COLUMN IF NOT EXISTS proposed_appointment_date DATE,
      ADD COLUMN IF NOT EXISTS proposed_appointment_time TIME,
      ADD COLUMN IF NOT EXISTS staff_responded_at TIMESTAMP
    `);

    await pool.query(`
      UPDATE appointments SET status = 'awaiting_payment'
      WHERE status = 'approved' AND COALESCE(payment_status, 'unpaid') = 'unpaid'
    `);

    console.log('✓ appointment request flow columns migrated');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
