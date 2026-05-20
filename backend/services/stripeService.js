const {
  isStripeConfigured,
  CURRENCY,
  FRONTEND_URL,
} = require('../config/payments');

let stripe = null;

function getStripe() {
  if (!isStripeConfigured()) return null;
  if (!stripe) {
    // eslint-disable-next-line global-require
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

async function createCheckoutSession({
  amountCents,
  description,
  metadata,
  successPath,
  cancelPath,
  customerEmail,
}) {
  const client = getStripe();
  if (!client) return { ok: false, error: 'Stripe is not configured' };

  const session = await client.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: customerEmail || undefined,
    line_items: [
      {
        price_data: {
          currency: CURRENCY,
          unit_amount: amountCents,
          product_data: { name: description },
        },
        quantity: 1,
      },
    ],
    metadata: metadata || {},
    success_url: `${FRONTEND_URL}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${FRONTEND_URL}${cancelPath}`,
  });

  return { ok: true, sessionId: session.id, url: session.url };
}

async function retrieveCheckoutSession(sessionId) {
  const client = getStripe();
  if (!client) return { ok: false, error: 'Stripe is not configured' };
  const session = await client.checkout.sessions.retrieve(sessionId);
  return { ok: true, session };
}

function constructWebhookEvent(rawBody, signature) {
  const client = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!client || !secret) {
    return { ok: false, error: 'Webhook not configured' };
  }
  try {
    const event = client.webhooks.constructEvent(rawBody, signature, secret);
    return { ok: true, event };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = {
  getStripe,
  createCheckoutSession,
  retrieveCheckoutSession,
  constructWebhookEvent,
  isStripeConfigured,
};
