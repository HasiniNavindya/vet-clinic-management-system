const PAYMENT_TYPES = {
  APPOINTMENT_BOOKING: 'appointment_booking',
  SHOP_ORDER: 'shop_order',
  CONSULTATION: 'consultation',
  PRESCRIPTION: 'prescription',
  OTHER: 'other',
};

const PAYMENT_METHODS = {
  STRIPE: 'stripe',
  CASH: 'cash',
  CARD_OFFLINE: 'card_offline',
  OTHER: 'other',
};

const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

const APPOINTMENT_PAYMENT_STATUSES = {
  UNPAID: 'unpaid',
  PAID: 'paid',
};

const ORDER_STATUSES = {
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  CANCELLED: 'cancelled',
};

const APPOINTMENT_BOOKING_FEE_CENTS = Number(process.env.APPOINTMENT_BOOKING_FEE_CENTS || 5000);
const CURRENCY = (process.env.PAYMENT_CURRENCY || 'usd').toLowerCase();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_'));
}

module.exports = {
  PAYMENT_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  APPOINTMENT_PAYMENT_STATUSES,
  ORDER_STATUSES,
  APPOINTMENT_BOOKING_FEE_CENTS,
  CURRENCY,
  FRONTEND_URL,
  isStripeConfigured,
};
