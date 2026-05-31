/**
 * @deprecated Demo seeding removed. Use Admin → Doctor profiles to add vets,
 * or approve doctor applications. This script only lists current profiles.
 * Run: node backend/update-doctors.js
 */
const pool = require('./db');

async function updateDoctors() {
  try {
    const result = await pool.query(
      'SELECT id, name, specialization, email FROM doctors ORDER BY name'
    );
    console.log('\nCurrent doctors in database:');
    if (result.rows.length === 0) {
      console.log('  (none — add via admin dashboard or doctor applications)');
    } else {
      result.rows.forEach((doc) => {
        console.log(`  ${doc.id}. ${doc.name} - ${doc.specialization} (${doc.email || 'no email'})`);
      });
    }
    await pool.end();
    console.log('\nDone.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateDoctors();
