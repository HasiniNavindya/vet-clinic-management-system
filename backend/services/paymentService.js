const pool = require('../db');
const { DEFAULT_STATUS } = require('../config/appointments');
const {
  PAYMENT_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  APPOINTMENT_PAYMENT_STATUSES,
  ORDER_STATUSES,
  APPOINTMENT_BOOKING_FEE_CENTS,
  CURRENCY,
  FRONTEND_URL,
} = require('../config/payments');
const { validateBookingInput, fetchAppointmentById } = require('./appointmentService');
const { createCheckoutSession, retrieveCheckoutSession } = require('./stripeService');

function mapTransactionRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    referenceType: row.reference_type,
    referenceId: row.reference_id,
    amountCents: row.amount_cents,
    currency: row.currency,
    paymentMethod: row.payment_method,
    status: row.status,
    description: row.description,
    metadata:
      typeof row.metadata === 'string'
        ? JSON.parse(row.metadata || '{}')
        : row.metadata || {},
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    recordedBy: row.recorded_by,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
  };
}

async function createTransaction({
  userId,
  type,
  amountCents,
  description,
  metadata,
  paymentMethod = PAYMENT_METHODS.STRIPE,
  referenceType = null,
  referenceId = null,
}) {
  const result = await pool.query(
    `INSERT INTO payment_transactions (
       user_id, type, reference_type, reference_id, amount_cents, currency,
       payment_method, status, description, metadata
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      userId,
      type,
      referenceType,
      referenceId,
      amountCents,
      CURRENCY,
      paymentMethod,
      PAYMENT_STATUSES.PENDING,
      description,
      JSON.stringify(metadata || {}),
    ]
  );
  return mapTransactionRow(result.rows[0]);
}

async function updateTransaction(id, fields) {
  const sets = [];
  const params = [];
  Object.entries(fields).forEach(([key, value]) => {
    params.push(value);
    sets.push(`${key} = $${params.length}`);
  });
  params.push(id);
  sets.push(`updated_at = CURRENT_TIMESTAMP`);
  const result = await pool.query(
    `UPDATE payment_transactions SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return mapTransactionRow(result.rows[0]);
}

async function getTransactionById(id) {
  const result = await pool.query(
    `SELECT pt.*, u.full_name AS owner_name, u.email AS owner_email
     FROM payment_transactions pt
     LEFT JOIN auth_users u ON pt.user_id = u.id
     WHERE pt.id = $1`,
    [id]
  );
  return mapTransactionRow(result.rows[0]);
}

async function getTransactionByStripeSession(sessionId) {
  const result = await pool.query(
    `SELECT * FROM payment_transactions WHERE stripe_checkout_session_id = $1`,
    [sessionId]
  );
  return mapTransactionRow(result.rows[0]);
}

async function listTransactions({ userId, role, limit = 50 }) {
  const params = [];
  let sql = `
    SELECT pt.*, u.full_name AS owner_name, u.email AS owner_email
    FROM payment_transactions pt
    LEFT JOIN auth_users u ON pt.user_id = u.id
    WHERE 1=1
  `;
  if (role === 'user') {
    params.push(userId);
    sql += ` AND pt.user_id = $${params.length}`;
  }
  sql += ` ORDER BY pt.created_at DESC LIMIT ${Number(limit)}`;
  const result = await pool.query(sql, params);
  return result.rows.map(mapTransactionRow);
}

async function fulfillAppointmentBooking(transaction) {
  const meta = transaction.metadata || {};
  const {
    doctor_id: doctorId,
    pet_id: petId,
    appointment_date: appointmentDate,
    appointment_time: appointmentTime,
    notes,
    user_id: userId,
  } = meta;

  const validation = await validateBookingInput({
    doctorId: Number(doctorId),
    petId: petId ? Number(petId) : null,
    userId: Number(userId),
    appointmentDate,
    appointmentTime,
  });
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const insert = await pool.query(
    `INSERT INTO appointments (
       user_id, doctor_id, pet_id, appointment_date, appointment_time,
       status, notes, confirmation_message, payment_status, booking_fee_cents
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      userId,
      doctorId,
      petId || null,
      appointmentDate,
      validation.timeNorm,
      DEFAULT_STATUS,
      notes || null,
      'Your appointment is confirmed. Payment received. The clinic will review and approve your visit.',
      APPOINTMENT_PAYMENT_STATUSES.PAID,
      transaction.amountCents,
    ]
  );

  const appointmentId = insert.rows[0].id;
  await updateTransaction(transaction.id, {
    reference_type: 'appointment',
    reference_id: appointmentId,
    status: PAYMENT_STATUSES.SUCCEEDED,
    paid_at: new Date(),
  });

  return fetchAppointmentById(appointmentId);
}

async function createAppointmentCheckout(userId, userEmail, booking) {
  const validation = await validateBookingInput({
    doctorId: booking.doctor_id,
    petId: booking.pet_id,
    userId,
    appointmentDate: booking.appointment_date,
    appointmentTime: booking.appointment_time,
  });
  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  const doctorRes = await pool.query('SELECT name FROM doctors WHERE id = $1', [booking.doctor_id]);
  const doctorName = doctorRes.rows[0]?.name || 'Veterinarian';

  const description = `Appointment booking — Dr. ${doctorName} on ${booking.appointment_date} at ${validation.timeNorm}`;
  const metadata = {
    type: PAYMENT_TYPES.APPOINTMENT_BOOKING,
    user_id: String(userId),
    doctor_id: String(booking.doctor_id),
    pet_id: booking.pet_id ? String(booking.pet_id) : '',
    appointment_date: booking.appointment_date,
    appointment_time: validation.timeNorm,
    notes: booking.notes || '',
  };

  const txn = await createTransaction({
    userId,
    type: PAYMENT_TYPES.APPOINTMENT_BOOKING,
    amountCents: APPOINTMENT_BOOKING_FEE_CENTS,
    description,
    metadata,
  });

  const { isStripeConfigured } = require('../config/payments');
  if (!isStripeConfigured()) {
    return {
      ok: true,
      demoMode: true,
      transactionId: txn.id,
      url: `${FRONTEND_URL}/dashboard/pet-owner/payments/demo-complete?transactionId=${txn.id}`,
    };
  }

  const session = await createCheckoutSession({
    amountCents: APPOINTMENT_BOOKING_FEE_CENTS,
    description,
    metadata: { ...metadata, transaction_id: String(txn.id) },
    successPath: '/dashboard/pet-owner/payments/success',
    cancelPath: '/dashboard/pet-owner/payments/failed',
    customerEmail: userEmail,
  });

  if (!session.ok) {
    await updateTransaction(txn.id, { status: PAYMENT_STATUSES.FAILED });
    return { ok: false, error: session.error };
  }

  await updateTransaction(txn.id, {
    stripe_checkout_session_id: session.sessionId,
    status: PAYMENT_STATUSES.PROCESSING,
  });

  return { ok: true, url: session.url, sessionId: session.sessionId, transactionId: txn.id };
}

async function createShopCheckout(userId, userEmail, { items, shipping }) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { ok: false, error: 'Cart is empty' };
  }

  let totalCents = 0;
  const normalized = items.map((item) => {
    const unitCents = Math.round(Number(item.price) * 100);
    const qty = Number(item.quantity) || 1;
    totalCents += unitCents * qty;
    return {
      item_type: item.type,
      item_id: item.id,
      item_name: item.name,
      unit_price_cents: unitCents,
      quantity: qty,
      image_url: item.image || null,
    };
  });

  if (totalCents <= 0) {
    return { ok: false, error: 'Invalid order total' };
  }

  const orderRes = await pool.query(
    `INSERT INTO shop_orders (
       user_id, status, total_cents, currency,
       shipping_name, shipping_email, shipping_phone,
       shipping_address, shipping_city, shipping_zip
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      userId,
      ORDER_STATUSES.PENDING_PAYMENT,
      totalCents,
      CURRENCY,
      shipping?.fullName || null,
      shipping?.email || userEmail,
      shipping?.phone || null,
      shipping?.address || null,
      shipping?.city || null,
      shipping?.zipCode || null,
    ]
  );
  const orderId = orderRes.rows[0].id;

  for (const line of normalized) {
    await pool.query(
      `INSERT INTO shop_order_items (order_id, item_type, item_id, item_name, unit_price_cents, quantity, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [orderId, line.item_type, line.item_id, line.item_name, line.unit_price_cents, line.quantity, line.image_url]
    );
  }

  const description = `Shop order #${orderId}`;
  const txn = await createTransaction({
    userId,
    type: PAYMENT_TYPES.SHOP_ORDER,
    amountCents: totalCents,
    description,
    metadata: { order_id: String(orderId) },
    referenceType: 'shop_order',
    referenceId: orderId,
  });

  const { isStripeConfigured } = require('../config/payments');
  if (!isStripeConfigured()) {
    return {
      ok: true,
      demoMode: true,
      transactionId: txn.id,
      orderId,
      url: `${FRONTEND_URL}/dashboard/pet-owner/payments/demo-complete?transactionId=${txn.id}`,
    };
  }

  const session = await createCheckoutSession({
    amountCents: totalCents,
    description,
    metadata: {
      type: PAYMENT_TYPES.SHOP_ORDER,
      transaction_id: String(txn.id),
      order_id: String(orderId),
      user_id: String(userId),
    },
    successPath: '/dashboard/pet-owner/payments/success',
    cancelPath: '/dashboard/pet-owner/payments/failed',
    customerEmail: userEmail,
  });

  if (!session.ok) {
    await updateTransaction(txn.id, { status: PAYMENT_STATUSES.FAILED });
    return { ok: false, error: session.error };
  }

  await pool.query(
    `UPDATE shop_orders SET stripe_checkout_session_id = $1 WHERE id = $2`,
    [session.sessionId, orderId]
  );
  await updateTransaction(txn.id, {
    stripe_checkout_session_id: session.sessionId,
    status: PAYMENT_STATUSES.PROCESSING,
  });

  return { ok: true, url: session.url, sessionId: session.sessionId, transactionId: txn.id, orderId };
}

async function fulfillShopOrder(transaction) {
  const orderId = transaction.referenceId || Number(transaction.metadata?.order_id);
  if (!orderId) throw new Error('Order not found for transaction');

  await pool.query(
    `UPDATE shop_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
    [ORDER_STATUSES.PAID, orderId]
  );
  await updateTransaction(transaction.id, {
    status: PAYMENT_STATUSES.SUCCEEDED,
    paid_at: new Date(),
  });
  return { orderId };
}

async function completeTransactionById(transactionId, userId) {
  const txn = await getTransactionById(transactionId);
  if (!txn) return { ok: false, error: 'Transaction not found' };
  if (txn.userId !== userId) return { ok: false, error: 'Not authorized' };
  if (txn.status === PAYMENT_STATUSES.SUCCEEDED) {
    return { ok: true, alreadyCompleted: true, transaction: txn };
  }

  if (txn.type === PAYMENT_TYPES.APPOINTMENT_BOOKING) {
    const appointment = await fulfillAppointmentBooking(txn);
    return { ok: true, appointment, transaction: await getTransactionById(transactionId) };
  }
  if (txn.type === PAYMENT_TYPES.SHOP_ORDER) {
    await fulfillShopOrder(txn);
    return { ok: true, transaction: await getTransactionById(transactionId) };
  }
  return { ok: false, error: 'Unsupported transaction type' };
}

async function handleStripeCheckoutCompleted(session) {
  const sessionId = session.id;
  let txn = await getTransactionByStripeSession(sessionId);
  if (!txn && session.metadata?.transaction_id) {
    txn = await getTransactionById(Number(session.metadata.transaction_id));
    if (txn) {
      await updateTransaction(txn.id, {
        stripe_checkout_session_id: sessionId,
        stripe_payment_intent_id: session.payment_intent || null,
      });
    }
  }
  if (!txn) return { ok: false, error: 'Transaction not found' };
  if (txn.status === PAYMENT_STATUSES.SUCCEEDED) return { ok: true, alreadyCompleted: true };

  await updateTransaction(txn.id, {
    stripe_payment_intent_id: session.payment_intent || null,
    status: PAYMENT_STATUSES.PROCESSING,
  });

  if (txn.type === PAYMENT_TYPES.APPOINTMENT_BOOKING) {
    const appointment = await fulfillAppointmentBooking(txn);
    return { ok: true, appointment };
  }
  if (txn.type === PAYMENT_TYPES.SHOP_ORDER) {
    await fulfillShopOrder(txn);
    return { ok: true };
  }
  return { ok: false, error: 'Unknown payment type' };
}

async function confirmPaymentFromSession(sessionId, userId) {
  const { isStripeConfigured } = require('../config/payments');
  if (!isStripeConfigured()) {
    return { ok: false, error: 'Use demo complete endpoint in demo mode' };
  }

  const retrieved = await retrieveCheckoutSession(sessionId);
  if (!retrieved.ok) return { ok: false, error: retrieved.error };

  const session = retrieved.session;
  if (session.payment_status !== 'paid') {
    return { ok: false, error: 'Payment not completed yet' };
  }

  const txn = await getTransactionByStripeSession(sessionId);
  if (!txn) return { ok: false, error: 'Transaction not found' };
  if (userId && txn.userId !== userId) return { ok: false, error: 'Not authorized' };

  return handleStripeCheckoutCompleted(session);
}

async function recordOfflinePayment(staffUserId, payload) {
  const {
    user_id: targetUserId,
    amount_cents: amountCents,
    type,
    description,
    reference_type: referenceType,
    reference_id: referenceId,
    payment_method: paymentMethod,
    notes,
  } = payload;

  if (!targetUserId || !amountCents || amountCents <= 0) {
    return { ok: false, error: 'User and valid amount are required' };
  }

  const allowedTypes = [
    PAYMENT_TYPES.CONSULTATION,
    PAYMENT_TYPES.PRESCRIPTION,
    PAYMENT_TYPES.OTHER,
  ];
  const payType = allowedTypes.includes(type) ? type : PAYMENT_TYPES.OTHER;

  const result = await pool.query(
    `INSERT INTO payment_transactions (
       user_id, type, reference_type, reference_id, amount_cents, currency,
       payment_method, status, description, metadata, recorded_by, paid_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
     RETURNING *`,
    [
      targetUserId,
      payType,
      referenceType || null,
      referenceId || null,
      amountCents,
      CURRENCY,
      paymentMethod || PAYMENT_METHODS.CASH,
      PAYMENT_STATUSES.SUCCEEDED,
      description || 'Clinic payment recorded',
      JSON.stringify({ notes: notes || '', recorded_offline: true }),
      staffUserId,
    ]
  );

  return { ok: true, transaction: mapTransactionRow(result.rows[0]) };
}

async function listPetOwnersForStaff() {
  const result = await pool.query(
    `SELECT id, full_name, email FROM auth_users WHERE role = 'user' ORDER BY full_name`
  );
  return result.rows;
}

module.exports = {
  mapTransactionRow,
  listTransactions,
  getTransactionById,
  createAppointmentCheckout,
  createShopCheckout,
  completeTransactionById,
  confirmPaymentFromSession,
  handleStripeCheckoutCompleted,
  recordOfflinePayment,
  listPetOwnersForStaff,
  APPOINTMENT_BOOKING_FEE_CENTS,
};
