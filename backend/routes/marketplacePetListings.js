const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { LISTING_STATUS } = require('../config/shop');

const router = express.Router();

function mapPet(row) {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    price: Number(row.price),
    description: row.description,
    image: row.image,
    location: row.location,
    seller: row.seller,
    contactNumber: row.contact_number,
    listingStatus: row.listing_status || LISTING_STATUS.PENDING,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
  };
}

/** Pet owners submit ads for moderator approval */
router.post('/pet-listings', authenticateToken, requireRole('user'), async (req, res) => {
  const { name, age, price, description, image, location, seller, contactNumber } = req.body || {};
  const userId = req.user.id;

  if (!name || price === undefined || price === null) {
    return res.status(400).json({ error: 'name and price are required' });
  }

  const userRes = await pool.query(
    `SELECT full_name FROM auth_users WHERE id = $1`,
    [userId]
  );
  const fullName = userRes.rows[0]?.full_name || '';

  try {
    const r = await pool.query(
      `INSERT INTO pets (
        name, age, price, description, image, location, seller, contact_number,
        owner_user_id, listing_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        name,
        age != null ? String(age) : '',
        Number(price),
        description || '',
        image || '',
        location || '',
        seller || fullName,
        contactNumber || null,
        userId,
        LISTING_STATUS.PENDING,
      ]
    );

    res.status(201).json({
      listing: mapPet(r.rows[0]),
      message:
        'Your advertisement was submitted for review. It will appear publicly after clinic approval.',
    });
  } catch (err) {
    console.error('pet-listings create:', err.message);
    res.status(500).json({ error: 'Failed to submit listing' });
  }
});

router.get('/pet-listings/mine', authenticateToken, requireRole('user'), async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT * FROM pets
       WHERE owner_user_id = $1 AND listing_status <> $2
       ORDER BY created_at DESC`,
      [req.user.id, LISTING_STATUS.REMOVED]
    );
    res.json({ listings: r.rows.map(mapPet) });
  } catch (err) {
    console.error('pet-listings mine:', err.message);
    res.status(500).json({ error: 'Failed to load your listings' });
  }
});

router.put('/pet-listings/:id', authenticateToken, requireRole('user'), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

  const body = req.body || {};

  try {
    const cur = await pool.query(`SELECT * FROM pets WHERE id = $1 AND owner_user_id = $2`, [
      id,
      req.user.id,
    ]);
    if (cur.rows.length === 0) return res.status(404).json({ error: 'Listing not found' });

    const prev = cur.rows[0];
    if ((prev.listing_status || '') === LISTING_STATUS.REMOVED) {
      return res.status(400).json({ error: 'This listing has been withdrawn' });
    }

    const wasApproved =
      (prev.listing_status || '').toLowerCase() === LISTING_STATUS.APPROVED.toLowerCase();

    const finalName = body.name !== undefined ? body.name : prev.name;
    const finalAge = body.age !== undefined ? String(body.age) : prev.age;
    const finalPrice = body.price !== undefined ? Number(body.price) : Number(prev.price);
    const finalDescription = body.description !== undefined ? body.description : prev.description;
    const finalImage = body.image !== undefined ? body.image : prev.image;
    const finalLocation = body.location !== undefined ? body.location : prev.location;
    const finalSeller = body.seller !== undefined ? body.seller : prev.seller;
    const finalContact =
      body.contactNumber !== undefined ? body.contactNumber || null : prev.contact_number;

    const nextStatus = wasApproved ? LISTING_STATUS.PENDING : prev.listing_status;

    await pool.query(
      `UPDATE pets SET
        name = $1,
        age = $2,
        price = $3,
        description = $4,
        image = $5,
        location = $6,
        seller = $7,
        contact_number = $8,
        listing_status = $9,
        rejection_reason = CASE WHEN $10 THEN NULL ELSE rejection_reason END,
        moderated_at = CASE WHEN $10 THEN NULL ELSE moderated_at END,
        moderated_by = CASE WHEN $10 THEN NULL ELSE moderated_by END
       WHERE id = $11 AND owner_user_id = $12`,
      [
        finalName,
        finalAge,
        finalPrice,
        finalDescription,
        finalImage,
        finalLocation,
        finalSeller,
        finalContact,
        nextStatus,
        wasApproved,
        id,
        req.user.id,
      ]
    );

    const updated = await pool.query(`SELECT * FROM pets WHERE id = $1`, [id]);

    let message = 'Listing updated.';
    if (wasApproved) {
      message = 'Changes saved — this listing awaits approval again before it is public.';
    }

    res.json({ listing: mapPet(updated.rows[0]), message });
  } catch (err) {
    console.error('pet-listings update:', err.message);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

router.delete('/pet-listings/:id', authenticateToken, requireRole('user'), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const r = await pool.query(
      `UPDATE pets SET listing_status = $1, moderated_at = CURRENT_TIMESTAMP WHERE id = $2 AND owner_user_id = $3 RETURNING id`,
      [LISTING_STATUS.REMOVED, id, req.user.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Listing not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('pet-listings delete:', err.message);
    res.status(500).json({ error: 'Failed to remove listing' });
  }
});

module.exports = router;
