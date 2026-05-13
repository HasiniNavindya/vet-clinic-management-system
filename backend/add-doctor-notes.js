const pool = require('./db');

async function addDoctorNotes() {
  try {
    // Add doctor_notes column to appointments table
    await pool.query(`
      ALTER TABLE appointments 
      ADD COLUMN IF NOT EXISTS doctor_notes TEXT
    `);
    console.log('✓ doctor_notes column added to appointments table');

    // Add some sample doctor notes to existing appointments
    await pool.query(`
      UPDATE appointments
      SET doctor_notes = CASE id % 3
        WHEN 0 THEN 'Patient showing good progress. Continue current treatment plan. Monitor for any changes in behavior.'
        WHEN 1 THEN 'Recommend follow-up in 2 weeks. Prescribed medication should be taken with meals. Watch for any allergic reactions.'
        ELSE 'All vitals normal. Pet is healthy and active. Regular checkups recommended every 6 months.'
      END
      WHERE doctor_notes IS NULL
    `);
    console.log('✓ Sample doctor notes added to existing appointments');

    await pool.end();
    console.log('\nDatabase updated successfully!');
  } catch (error) {
    console.error('Error updating database:', error);
    process.exit(1);
  }
}

addDoctorNotes();
