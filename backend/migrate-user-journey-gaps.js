/**
 * Adds columns for SRS user-journey gaps: pet weight, symptoms, check-in, service fee.
 * Run: node backend/migrate-user-journey-gaps.js
 */
const pool = require('./db');

async function migrate() {
  await pool.query(`
    ALTER TABLE pets_owned
      ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(6,2);

    ALTER TABLE pet_medical_records
      ADD COLUMN IF NOT EXISTS symptoms TEXT;

    ALTER TABLE appointments
      ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS service_fee_cents INTEGER;
  `);
  console.log('✓ User journey gap columns ready');
  process.exit(0);
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
