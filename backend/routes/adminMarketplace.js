const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { LISTING_STATUS } = require('../config/shop');

const router = express.Router();
router.use(authenticateToken, requireRole('admin'));

function mapPet(row, includeModeration = true) {
  const base = {
    id: row.id,
    name: row.name,
    age: row.age,
    price: Number(row.price),
    description: row.description,
    image: row.image,
    location: row.location,
    seller: row.seller,
    contactNumber: row.contact_number,
    ownerUserId: row.owner_user_id,
    listingStatus: row.listing_status || LISTING_STATUS.APPROVED,
    createdAt: row.created_at,
  };
  if (includeModeration) {
    base.rejectionReason = row.rejection_reason;
    base.moderatedAt = row.moderated_at;
    base.moderatedBy = row.moderated_by;
  }
  return base;
}

router.get('/marketplace/listings', async (req, res) => {
  const raw = typeof req.query.status === 'string' ? req.query.status.trim() : '';
  try {
    const params = [];
    let where = "COALESCE(listing_status, '') <> $1";

    params.push(LISTING_STATUS.REMOVED);
    let p = 2;

    if (raw === 'pending') {
      where += ` AND listing_status = $${p}`;
      params.push(LISTING_STATUS.PENDING);
      p++;
    } else if (raw === 'approved') {
      where += ` AND listing_status = $${p}`;
      params.push(LISTING_STATUS.APPROVED);
      p++;
    } else if (raw === 'rejected') {
      where += ` AND listing_status = $${p}`;
      params.push(LISTING_STATUS.REJECTED);
      p++;
    }

    const r = await pool.query(
      `SELECT p.* FROM pets p WHERE ${where} ORDER BY p.created_at DESC`,
      params
    );

    const pendingCount = await pool.query(
      `SELECT COUNT(*)::int AS c FROM pets WHERE listing_status = $1`,
      [LISTING_STATUS.PENDING]
    );

    res.json({
      listings: r.rows.map((row) => mapPet(row)),
      pendingCount: pendingCount.rows[0]?.c ?? 0,
    });
  } catch (err) {
    console.error('adminMarketplace list:', err.message);
    res.status(500).json({ error: 'Failed to load marketplace listings' });
  }
});

router.patch('/marketplace/listings/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

  const { action, rejectionReason } = req.body || {};
  const act = typeof action === 'string' ? action.trim().toLowerCase() : '';

  try {
    const cur = await pool.query(
      `SELECT id, listing_status FROM pets WHERE id = $1`,
      [id]
    );
    if (cur.rows.length === 0) return res.status(404).json({ error: 'Listing not found' });

    let listingStatus = null;
    let reason = rejectionReason !== undefined ? String(rejectionReason).trim() || null : null;

    if (act === 'approve') {
      listingStatus = LISTING_STATUS.APPROVED;
      reason = null;
    } else if (act === 'reject') {
      listingStatus = LISTING_STATUS.REJECTED;
    } else if (act === 'remove') {
      listingStatus = LISTING_STATUS.REMOVED;
    } else {
      return res.status(400).json({ error: 'Invalid action — use approve, reject, or remove' });
    }

    await pool.query(
      `UPDATE pets SET
        listing_status = $1,
        rejection_reason = $2,
        moderated_at = CURRENT_TIMESTAMP,
        moderated_by = $3
       WHERE id = $4`,
      [listingStatus, reason, req.user.id, id]
    );

    const updated = await pool.query(`SELECT * FROM pets WHERE id = $1`, [id]);

    res.json({ listing: mapPet(updated.rows[0]) });
  } catch (err) {
    console.error('adminMarketplace moderate:', err.message);
    res.status(500).json({ error: 'Failed to moderate listing' });
  }
});

module.exports = router;
