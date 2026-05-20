const pool = require('./db');
const { LISTING_STATUS } = require('./config/shop');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS stock_quantity INTEGER NOT NULL DEFAULT 0;
    `);
    await client.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
    `);

    await client.query(`
      ALTER TABLE pets
      ADD COLUMN IF NOT EXISTS owner_user_id INTEGER REFERENCES auth_users(id) ON DELETE SET NULL;
    `);
    await client.query(`
      ALTER TABLE pets
      ADD COLUMN IF NOT EXISTS listing_status VARCHAR(40) NOT NULL DEFAULT 'approved';
    `);
    await client.query(`
      ALTER TABLE pets
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    `);
    await client.query(`
      ALTER TABLE pets
      ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP;
    `);
    await client.query(`
      ALTER TABLE pets
      ADD COLUMN IF NOT EXISTS moderated_by INTEGER REFERENCES auth_users(id) ON DELETE SET NULL;
    `);

    await client.query(`
      ALTER TABLE shop_orders
      ADD COLUMN IF NOT EXISTS fulfillment_status VARCHAR(40) NOT NULL DEFAULT 'unfulfilled';
    `);
    await client.query(`
      ALTER TABLE shop_orders
      ADD COLUMN IF NOT EXISTS tracking_note TEXT;
    `);

    // Legacy marketplace rows without moderation columns filled
    await client.query(
      `UPDATE pets SET listing_status = $1 WHERE listing_status IS NULL OR listing_status = ''`,
      [LISTING_STATUS.APPROVED]
    );

    console.log('✓ shop + marketplace columns ready');
  } catch (e) {
    console.error('migrate-shop-marketplace failed:', e);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
