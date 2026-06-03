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
  const appointmentId = meta.appointment_id ? Number(meta.appointment_id) : null;

  if (appointmentId) {
    const existing = await fetchAppointmentById(appointmentId);
    if (!existing) throw new Error('Appointment not found');
    if (existing.status !== 'awaiting_payment') {
      throw new Error('Appointment is not awaiting payment');
    }
    if (Number(existing.userId) !== Number(transaction.userId)) {
      throw new Error('Not authorized for this appointment');
    }

    await pool.query(
      `UPDATE appointments
       SET status = 'approved',
           payment_status = $1,
           booking_fee_cents = $2,
           confirmation_message = $3,
           confirmed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [
        APPOINTMENT_PAYMENT_STATUSES.PAID,
        transaction.amountCents,
        'Your appointment is confirmed. Payment received. We look forward to your visit.',
        appointmentId,
      ]
    );

    await updateTransaction(transaction.id, {
      reference_type: 'appointment',
      reference_id: appointmentId,
      status: PAYMENT_STATUSES.SUCCEEDED,
      paid_at: new Date(),
    });

    const appointment = await fetchAppointmentById(appointmentId);
    try {
      const { notifyPaymentConfirmation, notifyAppointmentBooked } = require('./notificationService');
      const txn = await getTransactionById(transaction.id);
      await notifyPaymentConfirmation(Number(transaction.userId), {
        ...txn,
        referenceType: 'appointment',
        referenceId: appointmentId,
      });
      await notifyAppointmentBooked(Number(transaction.userId), appointment);
    } catch (notifyErr) {
      console.error('Payment notification error:', notifyErr.message);
    }
    return appointment;
  }

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
     ) VALUES ($1, $2, $3, $4, $5, 'approved', $6, $7, $8, $9)
     RETURNING id`,
    [
      userId,
      doctorId,
      petId || null,
      appointmentDate,
      validation.timeNorm,
      notes || null,
      'Your appointment is confirmed. Payment received.',
      APPOINTMENT_PAYMENT_STATUSES.PAID,
      transaction.amountCents,
    ]
  );

  const newId = insert.rows[0].id;
  await updateTransaction(transaction.id, {
    reference_type: 'appointment',
    reference_id: newId,
    status: PAYMENT_STATUSES.SUCCEEDED,
    paid_at: new Date(),
  });

  const appointment = await fetchAppointmentById(newId);
  try {
    const {
      notifyPaymentConfirmation,
      notifyAppointmentBooked,
    } = require('./notificationService');
    const txn = await getTransactionById(transaction.id);
    await notifyPaymentConfirmation(Number(userId), {
      ...txn,
      referenceType: 'appointment',
      referenceId: newId,
    });
    await notifyAppointmentBooked(Number(userId), appointment);
  } catch (notifyErr) {
    console.error('Payment notification error:', notifyErr.message);
  }
  return appointment;
}

async function createAppointmentPaymentCheckout(userId, userEmail, appointmentId) {
  const appointment = await fetchAppointmentById(appointmentId);
  if (!appointment) return { ok: false, error: 'Appointment not found' };
  if (appointment.userId !== userId) return { ok: false, error: 'Not authorized' };
  if (appointment.status !== 'awaiting_payment') {
    return { ok: false, error: 'This appointment does not require payment' };
  }

  const description = `Appointment confirmation — ${appointment.appointmentDate} at ${appointment.appointmentTime}`;
  const metadata = {
    type: PAYMENT_TYPES.APPOINTMENT_BOOKING,
    user_id: String(userId),
    appointment_id: String(appointmentId),
  };

  const txn = await createTransaction({
    userId,
    type: PAYMENT_TYPES.APPOINTMENT_BOOKING,
    amountCents: APPOINTMENT_BOOKING_FEE_CENTS,
    description,
    metadata,
    referenceType: 'appointment',
    referenceId: appointmentId,
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
  const normalized = [];

  for (const item of items) {
    const type = String(item.type || 'product').toLowerCase();
    if (type !== 'product') {
      return {
        ok: false,
        error: 'Checkout supports clinic shop products only. Pet advertisements are arranged with the seller directly.',
      };
    }

    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const prodId = Number(item.id);

    try {
      const pr = await pool.query(
        `SELECT id, name, price, COALESCE(stock_quantity, 0)::int AS stock_quantity,
                COALESCE(is_active, true) AS is_active
         FROM products WHERE id = $1`,
        [prodId]
      );
      const row = pr.rows[0];
      if (!row || !row.is_active) {
        return { ok: false, error: item.name ? `${item.name} is unavailable` : 'A product in your cart is unavailable' };
      }
      if (row.stock_quantity < qty) {
        return { ok: false, error: `Not enough stock for ${row.name}` };
      }

      const dbUnitCents = Math.round(Number(row.price) * 100);
      const cartUnitCents = Math.round(Number(item.price) * 100);
      if (dbUnitCents !== cartUnitCents) {
        return {
          ok: false,
          error: 'Shop prices were updated. Refresh the marketplace and update your cart.',
        };
      }

      totalCents += dbUnitCents * qty;
      normalized.push({
        item_type: 'product',
        item_id: prodId,
        item_name: item.name || row.name,
        unit_price_cents: dbUnitCents,
        quantity: qty,
        image_url: item.image || null,
      });
    } catch (e) {
      console.error('createShopCheckout stock check:', e.message);
      return { ok: false, error: 'Could not verify product inventory' };
    }
  }

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

  const existing = await getTransactionById(transaction.id);
  if (existing?.status === PAYMENT_STATUSES.SUCCEEDED) {
    return { orderId };
  }

  const client = await pool.connect();
  const stockedProducts = [];
  try {
    await client.query('BEGIN');

    const lineRes = await client.query(
      `SELECT item_id, quantity FROM shop_order_items
       WHERE order_id = $1 AND item_type = 'product'`,
      [orderId]
    );
    for (const line of lineRes.rows) {
      const dec = await client.query(
        `UPDATE products
         SET stock_quantity = stock_quantity - $1
         WHERE id = $2 AND stock_quantity >= $1
         RETURNING id, name, stock_quantity`,
        [line.quantity, line.item_id]
      );
      if (dec.rows.length === 0) {
        throw new Error(`Insufficient stock to fulfill order #${orderId}`);
      }
      stockedProducts.push({
        id: dec.rows[0].id,
        name: dec.rows[0].name,
        stockQuantity: Number(dec.rows[0].stock_quantity),
      });
    }

    await client.query(
      `UPDATE shop_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [ORDER_STATUSES.PAID, orderId]
    );

    await client.query(
      `UPDATE payment_transactions
       SET status = $1, paid_at = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [PAYMENT_STATUSES.SUCCEEDED, new Date(), transaction.id]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  try {
    const { notifyPaymentConfirmation } = require('./notificationService');
    const txn = await getTransactionById(transaction.id);
    await notifyPaymentConfirmation(txn.userId, {
      ...txn,
      referenceType: 'shop_order',
      referenceId: orderId,
    });
  } catch (notifyErr) {
    console.error('Shop payment notification error:', notifyErr.message);
  }

  try {
    const { notifyAdminsInventoryRestock } = require('./notificationService');
    for (const product of stockedProducts) {
      await notifyAdminsInventoryRestock(product, {});
    }
  } catch (stockErr) {
    console.error('Low stock alert after order:', stockErr.message);
  }

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

async function adminListTransactions({
  page = 1,
  limit = 25,
  status,
  type,
  search,
} = {}) {
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 25));
  const offset = (Math.max(1, Number(page) || 1) - 1) * safeLimit;
  const conditions = ['1=1'];
  const params = [];
  let p = 1;

  if (status && String(status).trim()) {
    conditions.push(`pt.status = $${p++}`);
    params.push(String(status).trim().toLowerCase());
  }
  if (type && String(type).trim()) {
    conditions.push(`pt.type = $${p++}`);
    params.push(String(type).trim().toLowerCase());
  }
  if (search && String(search).trim()) {
    const q = `%${String(search).trim()}%`;
    conditions.push(
      `(u.email ILIKE $${p} OR u.full_name ILIKE $${p} OR pt.description ILIKE $${p} OR pt.id::text = $${p + 1})`
    );
    params.push(q, String(search).trim());
    p += 2;
  }

  const where = conditions.join(' AND ');
  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM payment_transactions pt
     LEFT JOIN auth_users u ON u.id = pt.user_id
     WHERE ${where}`,
    params
  );
  const total = countRes.rows[0]?.total || 0;

  const listParams = [...params, safeLimit, offset];
  const limIdx = params.length + 1;
  const offIdx = params.length + 2;

  const listRes = await pool.query(
    `SELECT pt.*, u.full_name AS owner_name, u.email AS owner_email
     FROM payment_transactions pt
     LEFT JOIN auth_users u ON pt.user_id = u.id
     WHERE ${where}
     ORDER BY pt.created_at DESC
     LIMIT $${limIdx} OFFSET $${offIdx}`,
    listParams
  );

  return {
    transactions: listRes.rows.map(mapTransactionRow),
    total,
    page: Math.max(1, Number(page) || 1),
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1,
  };
}

async function getPaymentOverviewStats() {
  const byStatus = await pool.query(
    `SELECT status, COUNT(*)::int AS count, COALESCE(SUM(amount_cents), 0)::bigint AS cents
     FROM payment_transactions
     GROUP BY status`
  );
  const succeeded = await pool.query(
    `SELECT COALESCE(SUM(amount_cents), 0)::bigint AS s
     FROM payment_transactions WHERE status = $1`,
    [PAYMENT_STATUSES.SUCCEEDED]
  );
  const last30 = await pool.query(
    `SELECT COALESCE(SUM(amount_cents), 0)::bigint AS s
     FROM payment_transactions
     WHERE status = $1
       AND COALESCE(paid_at, created_at) >= NOW() - INTERVAL '30 days'`,
    [PAYMENT_STATUSES.SUCCEEDED]
  );
  const pending = await pool.query(
    `SELECT COUNT(*)::int AS c FROM payment_transactions
     WHERE status IN ($1, $2)`,
    [PAYMENT_STATUSES.PENDING, PAYMENT_STATUSES.PROCESSING]
  );
  const byType = await pool.query(
    `SELECT type, COUNT(*)::int AS count
     FROM payment_transactions
     WHERE status = $1
     GROUP BY type`,
    [PAYMENT_STATUSES.SUCCEEDED]
  );

  return {
    totalRevenueCents: Number(succeeded.rows[0]?.s ?? 0),
    revenueLast30DaysCents: Number(last30.rows[0]?.s ?? 0),
    pendingCount: pending.rows[0]?.c ?? 0,
    statusBreakdown: byStatus.rows.map((r) => ({
      status: r.status,
      count: r.count,
      cents: Number(r.cents),
    })),
    succeededByType: byType.rows,
  };
}

async function adminFulfillTransaction(transactionId, adminUserId) {
  const txn = await getTransactionById(transactionId);
  if (!txn) return { ok: false, error: 'Transaction not found' };
  if (txn.status === PAYMENT_STATUSES.SUCCEEDED) {
    return { ok: true, alreadyCompleted: true, transaction: txn };
  }
  if (txn.status === PAYMENT_STATUSES.REFUNDED) {
    return { ok: false, error: 'Cannot verify a refunded transaction' };
  }

  if (txn.type === PAYMENT_TYPES.APPOINTMENT_BOOKING) {
    const appointment = await fulfillAppointmentBooking(txn);
    return {
      ok: true,
      appointment,
      transaction: await getTransactionById(transactionId),
      verifiedBy: adminUserId,
    };
  }
  if (txn.type === PAYMENT_TYPES.SHOP_ORDER) {
    await fulfillShopOrder(txn);
    return {
      ok: true,
      transaction: await getTransactionById(transactionId),
      verifiedBy: adminUserId,
    };
  }

  await updateTransaction(transactionId, {
    status: PAYMENT_STATUSES.SUCCEEDED,
    paid_at: new Date(),
  });
  try {
    const { notifyPaymentConfirmation } = require('./notificationService');
    const fresh = await getTransactionById(transactionId);
    await notifyPaymentConfirmation(fresh.userId, fresh);
  } catch (_e) {
    /* */
  }
  return {
    ok: true,
    transaction: await getTransactionById(transactionId),
    verifiedBy: adminUserId,
  };
}

async function adminRefundTransaction(transactionId, adminUserId, { reason } = {}) {
  const txn = await getTransactionById(transactionId);
  if (!txn) return { ok: false, error: 'Transaction not found' };
  if (txn.status !== PAYMENT_STATUSES.SUCCEEDED) {
    return { ok: false, error: 'Only succeeded payments can be refunded' };
  }

  const meta =
    typeof txn.metadata === 'object' && txn.metadata
      ? { ...txn.metadata, refund_reason: reason || '', refunded_by: adminUserId }
      : { refund_reason: reason || '', refunded_by: adminUserId };

  await updateTransaction(transactionId, {
    status: PAYMENT_STATUSES.REFUNDED,
    metadata: typeof meta === 'string' ? meta : JSON.stringify(meta),
  });

  try {
    const { createNotification } = require('./notificationService');
    const { NOTIFICATION_TYPES } = require('../config/notifications');
    await createNotification({
      userId: txn.userId,
      type: NOTIFICATION_TYPES.PAYMENT_CONFIRMATION,
      title: 'Payment refunded',
      message: `A refund was issued for ${txn.description || 'your payment'}${reason ? `: ${reason}` : '.'}`,
      linkPath: '/dashboard/pet-owner/payments',
      referenceType: 'payment',
      referenceId: transactionId,
      emailSubject: 'Payment refund processed',
      emailBody: `Your payment has been marked as refunded.${reason ? ` Reason: ${reason}` : ''}`,
    });
  } catch (_e) {
    /* */
  }

  return { ok: true, transaction: await getTransactionById(transactionId) };
}

module.exports = {
  mapTransactionRow,
  listTransactions,
  getTransactionById,
  createAppointmentCheckout,
  createAppointmentPaymentCheckout,
  createShopCheckout,
  completeTransactionById,
  confirmPaymentFromSession,
  handleStripeCheckoutCompleted,
  recordOfflinePayment,
  listPetOwnersForStaff,
  adminListTransactions,
  getPaymentOverviewStats,
  adminFulfillTransaction,
  adminRefundTransaction,
  APPOINTMENT_BOOKING_FEE_CENTS,
};
