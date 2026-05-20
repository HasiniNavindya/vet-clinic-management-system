const pool = require('./db');

async function migratePayments() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        reference_type VARCHAR(50),
        reference_id INTEGER,
        amount_cents INTEGER NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'usd',
        payment_method VARCHAR(30) NOT NULL DEFAULT 'stripe',
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        description TEXT,
        metadata JSONB DEFAULT '{}',
        stripe_checkout_session_id VARCHAR(255),
        stripe_payment_intent_id VARCHAR(255),
        recorded_by INTEGER REFERENCES auth_users(id),
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ payment_transactions table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS shop_orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
        status VARCHAR(30) NOT NULL DEFAULT 'pending_payment',
        total_cents INTEGER NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'usd',
        shipping_name VARCHAR(255),
        shipping_email VARCHAR(255),
        shipping_phone VARCHAR(50),
        shipping_address TEXT,
        shipping_city VARCHAR(100),
        shipping_zip VARCHAR(20),
        stripe_checkout_session_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ shop_orders table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS shop_order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
        item_type VARCHAR(20) NOT NULL,
        item_id INTEGER NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        unit_price_cents INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        image_url TEXT
      )
    `);
    console.log('✓ shop_order_items table ready');

    await pool.query(`
      ALTER TABLE appointments
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) DEFAULT 'unpaid'
    `);
    await pool.query(`
      ALTER TABLE appointments
      ADD COLUMN IF NOT EXISTS booking_fee_cents INTEGER
    `);
    console.log('✓ appointments payment columns ready');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_user
      ON payment_transactions(user_id, created_at DESC)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_session
      ON payment_transactions(stripe_checkout_session_id)
    `);

    console.log('\n✅ Payment migration completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Payment migration failed:', error);
    process.exit(1);
  }
}

migratePayments();
