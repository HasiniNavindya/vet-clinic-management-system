/**
 * Consultation billing line items for reception after doctor completes visit.
 * Run: node backend/migrate-appointment-billing.js
 */
const pool = require('./db');

async function migrate() {
  await pool.query(`
    ALTER TABLE appointments
      ADD COLUMN IF NOT EXISTS consultation_fee_cents INTEGER,
      ADD COLUMN IF NOT EXISTS vaccination_fee_cents INTEGER,
      ADD COLUMN IF NOT EXISTS medicine_fee_cents INTEGER,
      ADD COLUMN IF NOT EXISTS billing_status VARCHAR(20) DEFAULT 'none';
  `);
  console.log('✓ Appointment billing columns ready');
  process.exit(0);
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
