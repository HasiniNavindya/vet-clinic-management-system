const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  loadInventoryWithAlerts,
  receptionNotifyRestock,
} = require('../services/receptionistShopService');
const pool = require('../db');

const router = express.Router();
const STAFF = ['receptionist', 'admin'];

router.use(authenticateToken, requireRole(...STAFF));

/** Marketplace product stock — same data as public /products, with summary for reception desk. */
router.get('/inventory', async (_req, res) => {
  try {
    res.json(await loadInventoryWithAlerts());
  } catch (err) {
    console.error('Shop inventory:', err.message);
    res.status(500).json({ error: 'Failed to load marketplace inventory' });
  }
});

router.post('/inventory/:productId/notify-restock', async (req, res) => {
  const productId = Number(req.params.productId);
  if (!Number.isFinite(productId)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }
  try {
    const staff = await pool.query(
      'SELECT full_name FROM auth_users WHERE id = $1',
      [req.user.id]
    );
    const result = await receptionNotifyRestock(
      productId,
      req.user.id,
      staff.rows[0]?.full_name || 'Reception'
    );
    if (!result.ok) {
      return res.status(400).json({ error: result.error || 'Could not notify admins' });
    }
    res.json({ message: result.message, ...result });
  } catch (err) {
    console.error('Shop notify restock:', err.message);
    res.status(500).json({ error: 'Failed to notify admins' });
  }
});

module.exports = router;
