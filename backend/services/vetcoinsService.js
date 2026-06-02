const pool = require('../db');

/** VetCoins earned per appointment after online payment confirms booking (status → approved). */
const VETCOINS_PER_CONFIRMED_APPOINTMENT = 10;

/**
 * Confirmed = paid booking: status approved/completed and payment_status paid.
 */
async function getVetCoinBalance(userId) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM appointments
     WHERE user_id = $1
       AND status IN ('approved', 'completed')
       AND payment_status = 'paid'`,
    [userId]
  );
  const confirmedCount = result.rows[0]?.count || 0;
  return confirmedCount * VETCOINS_PER_CONFIRMED_APPOINTMENT;
}

module.exports = {
  VETCOINS_PER_CONFIRMED_APPOINTMENT,
  getVetCoinBalance,
};
