const pool = require('../db');

async function getHomeStats() {
  const stats = {
    registeredPets: 0,
    totalAppointments: 0,
    registeredVeterinarians: 0,
    clientSatisfactionPercent: null,
    feedbackCount: 0,
  };

  try {
    const pets = await pool.query('SELECT COUNT(*)::int AS c FROM pets_owned');
    stats.registeredPets = pets.rows[0]?.c ?? 0;
  } catch (e) {
    console.warn('home stats pets:', e.message);
  }

  try {
    const appts = await pool.query('SELECT COUNT(*)::int AS c FROM appointments');
    stats.totalAppointments = appts.rows[0]?.c ?? 0;
  } catch (e) {
    console.warn('home stats appointments:', e.message);
  }

  try {
    const docs = await pool.query('SELECT COUNT(*)::int AS c FROM doctors');
    stats.registeredVeterinarians = docs.rows[0]?.c ?? 0;
  } catch (e) {
    console.warn('home stats doctors:', e.message);
  }

  try {
    const fb = await pool.query(
      `SELECT COUNT(*)::int AS count, AVG(rating)::float AS avg_rating FROM client_feedback`
    );
    const count = fb.rows[0]?.count ?? 0;
    const avg = fb.rows[0]?.avg_rating;
    stats.feedbackCount = count;
    if (count > 0 && avg != null && !Number.isNaN(avg)) {
      stats.clientSatisfactionPercent = Math.round((avg / 5) * 100);
    }
  } catch (e) {
    console.warn('home stats feedback:', e.message);
  }

  return stats;
}

module.exports = { getHomeStats };
