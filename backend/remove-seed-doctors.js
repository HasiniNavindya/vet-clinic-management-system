/**
 * Remove demo doctor profiles seeded with @clinic.com emails (no linked login).
 * Linked appointments for those doctors are removed via ON DELETE CASCADE.
 * Run: node backend/remove-seed-doctors.js
 */
const pool = require('./db');

async function run() {
  const preview = await pool.query(
    `SELECT d.id, d.name, d.email,
            (SELECT COUNT(*)::int FROM appointments a WHERE a.doctor_id = d.id) AS appts
     FROM doctors d
     WHERE d.email LIKE '%@clinic.com' AND d.user_id IS NULL
     ORDER BY d.name`
  );

  if (preview.rows.length === 0) {
    console.log('No seed doctors (@clinic.com, no login) found.');
    process.exit(0);
  }

  console.log('Removing seed doctors:');
  preview.rows.forEach((row) =>
    console.log(`  - ${row.name} (${row.email}) — ${row.appts} appointment(s)`)
  );

  const r = await pool.query(
    `DELETE FROM doctors d
     WHERE d.email LIKE '%@clinic.com'
       AND d.user_id IS NULL
     RETURNING d.id, d.name, d.email`
  );

  console.log(`\nRemoved ${r.rowCount} seed doctor profile(s).`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
