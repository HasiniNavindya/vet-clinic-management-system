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
  const backfill = await pool.query(`
    UPDATE appointments a
    SET status = 'completed',
        billing_status = 'pending',
        updated_at = CURRENT_TIMESTAMP
    WHERE EXISTS (
      SELECT 1 FROM pet_medical_records r WHERE r.appointment_id = a.id
    )
    AND COALESCE(a.billing_status, 'none') IN ('none', '')
    AND a.status NOT IN ('cancelled', 'rejected')
  `);
  console.log('✓ Appointment billing columns ready');
  console.log(`✓ Backfilled ${backfill.rowCount} visit(s) into billing queue`);
  process.exit(0);
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
