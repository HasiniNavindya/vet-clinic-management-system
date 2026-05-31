const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  listTransactions,
  getTransactionById,
  createAppointmentCheckout,
  createAppointmentPaymentCheckout,
  createShopCheckout,
  completeTransactionById,
  confirmPaymentFromSession,
  recordOfflinePayment,
  listPetOwnersForStaff,
  APPOINTMENT_BOOKING_FEE_CENTS,
} = require('../services/paymentService');
const { isStripeConfigured } = require('../config/payments');

const router = express.Router();

router.get('/config', authenticateToken, (req, res) => {
  res.json({
    stripeEnabled: isStripeConfigured(),
    appointmentBookingFeeCents: APPOINTMENT_BOOKING_FEE_CENTS,
    currency: 'usd',
  });
});

router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const list = await listTransactions({
      userId: req.user.id,
      role: req.user.role,
    });
    res.json(list);
  } catch (err) {
    console.error('List transactions error:', err);
    res.status(500).json({ error: 'Failed to load transactions' });
  }
});

router.get('/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const txn = await getTransactionById(req.params.id);
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });
    if (req.user.role === 'user' && txn.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json(txn);
  } catch (err) {
    console.error('Get transaction error:', err);
    res.status(500).json({ error: 'Failed to load transaction' });
  }
});

router.post('/appointment/checkout', authenticateToken, requireRole('user'), async (req, res) => {
  try {
    const { appointment_id } = req.body;
    const result = appointment_id
      ? await createAppointmentPaymentCheckout(
          req.user.id,
          req.user.email,
          Number(appointment_id)
        )
      : await createAppointmentCheckout(req.user.id, req.user.email, req.body);
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (err) {
    console.error('Appointment checkout error:', err);
    res.status(500).json({ error: 'Failed to start checkout' });
  }
});

router.post('/shop/checkout', authenticateToken, requireRole('user'), async (req, res) => {
  try {
    const result = await createShopCheckout(req.user.id, req.user.email, req.body);
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (err) {
    console.error('Shop checkout error:', err);
    res.status(500).json({ error: 'Failed to start checkout' });
  }
});

router.post('/confirm-session', authenticateToken, requireRole('user'), async (req, res) => {
  const { session_id: sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'session_id is required' });
  try {
    const result = await confirmPaymentFromSession(sessionId, req.user.id);
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (err) {
    console.error('Confirm session error:', err);
    res.status(500).json({ error: err.message || 'Failed to confirm payment' });
  }
});

router.post('/demo-complete/:id', authenticateToken, requireRole('user'), async (req, res) => {
  if (isStripeConfigured()) {
    return res.status(400).json({ error: 'Demo mode is disabled when Stripe is configured' });
  }
  try {
    const result = await completeTransactionById(Number(req.params.id), req.user.id);
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (err) {
    console.error('Demo complete error:', err);
    res.status(500).json({ error: err.message || 'Failed to complete payment' });
  }
});

async function listPetOwnersHandler(req, res) {
  try {
    const owners = await listPetOwnersForStaff();
    res.json(owners);
  } catch (err) {
    console.error('List pet owners error:', err);
    res.status(500).json({ error: 'Failed to load pet owners' });
  }
}

router.get('/receptionist/pet-owners', authenticateToken, requireRole('admin', 'doctor', 'receptionist'), listPetOwnersHandler);
router.get('/staff/pet-owners', authenticateToken, requireRole('admin', 'doctor', 'receptionist'), listPetOwnersHandler);

router.post('/offline', authenticateToken, requireRole('admin', 'doctor', 'receptionist'), async (req, res) => {
  try {
    const result = await recordOfflinePayment(req.user.id, req.body);
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.status(201).json(result.transaction);
  } catch (err) {
    console.error('Offline payment error:', err);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

module.exports = router;
