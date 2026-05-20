const pool = require('../db');

async function getPetForUser(petId, userId, role) {
  const result = await pool.query(
    `SELECT p.*, u.id AS owner_id
     FROM pets_owned p
     JOIN auth_users u ON p.user_id = u.id
     WHERE p.id = $1`,
    [petId]
  );
  if (result.rows.length === 0) return { ok: false, error: 'Pet not found' };

  const pet = result.rows[0];
  if (role === 'user' && pet.user_id !== userId) {
    return { ok: false, error: 'Not authorized to access this pet' };
  }
  return { ok: true, pet };
}

async function listPetsForUser(userId, role) {
  if (role === 'user') {
    const result = await pool.query(
      'SELECT * FROM pets_owned WHERE user_id = $1 ORDER BY pet_name',
      [userId]
    );
    return result.rows;
  }
  const result = await pool.query('SELECT * FROM pets_owned ORDER BY pet_name');
  return result.rows;
}

module.exports = { getPetForUser, listPetsForUser };
