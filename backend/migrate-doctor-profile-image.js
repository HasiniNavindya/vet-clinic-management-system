/**
 * Adds profile_image_url to doctor_applications for doctor photo at registration.
 * Run: node migrate-doctor-profile-image.js
 */
require('dotenv').config();
const pool = require('./db');

async function run() {
  await pool.query(`
    ALTER TABLE doctor_applications
    ADD COLUMN IF NOT EXISTS profile_image_url TEXT
  `);
  await pool.query(`
    ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS image_url TEXT
  `);
  console.log('doctor_applications.profile_image_url and doctors.image_url ready');
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
