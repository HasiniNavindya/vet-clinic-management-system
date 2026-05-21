const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { isStripeConfigured } = require('../config/payments');
const { isEmailConfigured } = require('../config/notifications');
const {
  adminListTransactions,
  getPaymentOverviewStats,
  getTransactionById,
  adminFulfillTransaction,
  adminRefundTransaction,
} = require('../services/paymentService');

const router = express.Router();
router.use(authenticateToken, requireRole('admin'));

router.get('/payments/overview', async (_req, res) => {
  try {
    const stats = await getPaymentOverviewStats();
    const recent = await adminListTransactions({ page: 1, limit: 8 });
    res.json({
      ...stats,
      stripeEnabled: isStripeConfigured(),
      recentTransactions: recent.transactions,
    });
  } catch (err) {
    console.error('admin payments overview:', err.message);
    res.status(500).json({ error: 'Failed to load payment overview' });
  }
});

router.get('/payments/transactions', async (req, res) => {
  try {
    const page = parseInt(String(req.query.page), 10) || 1;
    const limit = parseInt(String(req.query.limit), 10) || 25;
    const status = typeof req.query.status === 'string' ? req.query.status : '';
    const type = typeof req.query.type === 'string' ? req.query.type : '';
    const search = typeof req.query.search === 'string' ? req.query.search : '';
    const data = await adminListTransactions({ page, limit, status, type, search });
    res.json(data);
  } catch (err) {
    console.error('admin list transactions:', err.message);
    res.status(500).json({ error: 'Failed to list transactions' });
  }
});

router.get('/payments/transactions/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const txn = await getTransactionById(id);
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ transaction: txn });
  } catch (err) {
    console.error('admin get transaction:', err.message);
    res.status(500).json({ error: 'Failed to load transaction' });
  }
});

/** Admin verify / complete a pending or processing payment (fulfills linked order/appointment). */
router.post('/payments/transactions/:id/verify', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await adminFulfillTransaction(id, req.user.id);
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (err) {
    console.error('admin verify payment:', err.message);
    res.status(500).json({ error: err.message || 'Verification failed' });
  }
});

/** Mark succeeded payment as refunded (records status; Stripe refund API not wired). */
router.post('/payments/transactions/:id/refund', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { reason } = req.body || {};
    const result = await adminRefundTransaction(id, req.user.id, { reason });
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (err) {
    console.error('admin refund payment:', err.message);
    res.status(500).json({ error: 'Refund failed' });
  }
});

/** Shop orders linked to payment_transactions for order payment tracking. */
router.get('/payments/order-tracking', async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(50, Math.max(5, parseInt(String(req.query.limit), 10) || 15));
  const offset = (page - 1) * limit;
  try {
    const count = await pool.query(`SELECT COUNT(*)::int AS total FROM shop_orders`);
    const r = await pool.query(
      `SELECT o.id, o.user_id, o.status, o.total_cents, o.fulfillment_status, o.created_at,
              u.email AS user_email, u.full_name AS user_full_name,
              pt.id AS payment_tx_id, pt.status AS payment_status
       FROM shop_orders o
       JOIN auth_users u ON u.id = o.user_id
       LEFT JOIN payment_transactions pt ON pt.reference_type = 'shop_order' AND pt.reference_id = o.id
       ORDER BY o.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json({
      orders: r.rows,
      total: count.rows[0]?.total || 0,
      page,
      limit,
      totalPages: Math.ceil((count.rows[0]?.total || 0) / limit) || 1,
    });
  } catch (err) {
    console.error('admin order tracking:', err.message);
    res.status(500).json({ error: 'Failed to load order payments' });
  }
});

module.exports = router;
