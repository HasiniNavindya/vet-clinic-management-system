const express = require('express');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  PRODUCT_CATEGORIES,
  normalizeProductCategory,
  ALL_FULFILLMENT,
} = require('../config/shop');

const router = express.Router();
router.use(authenticateToken, requireRole('admin'));

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    image: row.image,
    category: row.category,
    stockQuantity: row.stock_quantity != null ? Number(row.stock_quantity) : 0,
    isActive: row.is_active !== false,
    createdAt: row.created_at,
  };
}

/** Full product catalog for admins */
router.get('/shop/products', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, name, description, price, image, category, stock_quantity, is_active, created_at
       FROM products ORDER BY id DESC`
    );
    res.json({ products: r.rows.map(mapProduct), categories: PRODUCT_CATEGORIES });
  } catch (err) {
    console.error('adminShop list products:', err.message);
    res.status(500).json({ error: 'Failed to list products' });
  }
});

router.post('/shop/products', async (req, res) => {
  const { name, description, price, image, category, stockQuantity, isActive } = req.body || {};
  if (!name || price === undefined || price === null) {
    return res.status(400).json({ error: 'name and price are required' });
  }
  const cat = normalizeProductCategory(category);
  const stock = Math.max(0, Math.floor(Number(stockQuantity) || 0));
  try {
    const r = await pool.query(
      `INSERT INTO products (name, description, price, image, category, stock_quantity, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        name,
        description || '',
        Number(price),
        image || '',
        cat,
        stock,
        isActive === false ? false : true,
      ]
    );
    res.status(201).json({ product: mapProduct(r.rows[0]) });
  } catch (err) {
    console.error('adminShop create product:', err.message);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.patch('/shop/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

  const { name, description, price, image, category, stockQuantity, isActive } = req.body || {};
  try {
    const exists = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
    if (exists.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    const sets = [];
    const vals = [];
    let p = 1;

    if (name !== undefined) {
      sets.push(`name = $${p++}`);
      vals.push(name);
    }
    if (description !== undefined) {
      sets.push(`description = $${p++}`);
      vals.push(description);
    }
    if (price !== undefined) {
      sets.push(`price = $${p++}`);
      vals.push(Number(price));
    }
    if (image !== undefined) {
      sets.push(`image = $${p++}`);
      vals.push(image);
    }
    if (category !== undefined) {
      sets.push(`category = $${p++}`);
      vals.push(normalizeProductCategory(category));
    }
    if (stockQuantity !== undefined) {
      sets.push(`stock_quantity = $${p++}`);
      vals.push(Math.max(0, Math.floor(Number(stockQuantity))));
    }
    if (isActive !== undefined) {
      sets.push(`is_active = $${p++}`);
      vals.push(Boolean(isActive));
    }

    if (sets.length === 0) return res.status(400).json({ error: 'No updates provided' });

    vals.push(id);
    const r = await pool.query(
      `UPDATE products SET ${sets.join(', ')} WHERE id = $${p} RETURNING *`,
      vals
    );
    res.json({ product: mapProduct(r.rows[0]) });
  } catch (err) {
    console.error('adminShop patch product:', err.message);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/shop/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const r = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('adminShop delete product:', err.message);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

/** Low-stock and inactive summary */
router.get('/shop/inventory-summary', async (_req, res) => {
  try {
    const low = await pool.query(
      `SELECT id, name, category, stock_quantity, is_active
       FROM products
       WHERE COALESCE(is_active, true) = true AND stock_quantity <= 10
       ORDER BY stock_quantity ASC, id ASC`
    );
    const out = await pool.query(
      `SELECT COUNT(*)::int AS c FROM products WHERE COALESCE(is_active, true) = true AND stock_quantity = 0`
    );
    res.json({
      lowStockRows: low.rows.map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        stockQuantity: Number(row.stock_quantity),
        isActive: row.is_active !== false,
      })),
      outOfStockCount: out.rows[0]?.c ?? 0,
      categories: PRODUCT_CATEGORIES,
    });
  } catch (err) {
    console.error('adminShop inventory-summary:', err.message);
    res.status(500).json({ error: 'Failed to load inventory summary' });
  }
});

router.get('/shop/orders', async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(80, Math.max(5, parseInt(String(req.query.limit), 10) || 20));
  const offset = (page - 1) * limit;

  const payStatus =
    typeof req.query.paymentStatus === 'string' ? req.query.paymentStatus.trim() : '';

  try {
    const conditions = ['1=1'];
    const params = [];
    let pi = 1;

    if (payStatus === 'paid' || payStatus === 'pending_payment' || payStatus === 'cancelled') {
      conditions.push(`o.status = $${pi++}`);
      params.push(payStatus);
    }

    const where = conditions.join(' AND ');

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM shop_orders o WHERE ${where}`,
      params
    );
    const total = countRes.rows[0]?.total || 0;

    const listParams = [...params, limit, offset];
    const limI = params.length + 1;
    const offI = params.length + 2;

    const r = await pool.query(
      `SELECT o.*, u.email AS user_email, u.full_name AS user_full_name
       FROM shop_orders o
       JOIN auth_users u ON u.id = o.user_id
       WHERE ${where}
       ORDER BY o.created_at DESC
       LIMIT $${limI} OFFSET $${offI}`,
      listParams
    );

    const orders = r.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      userFullName: row.user_full_name,
      paymentStatus: row.status,
      totalCents: row.total_cents,
      currency: row.currency,
      fulfillmentStatus: row.fulfillment_status || 'unfulfilled',
      trackingNote: row.tracking_note,
      shippingName: row.shipping_name,
      shippingEmail: row.shipping_email,
      shippingPhone: row.shipping_phone,
      shippingAddress: row.shipping_address,
      shippingCity: row.shipping_city,
      shippingZip: row.shipping_zip,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json({
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error('adminShop list orders:', err.message);
    res.status(500).json({ error: 'Failed to list orders' });
  }
});

router.get('/shop/orders/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const head = await pool.query(
      `SELECT o.*, u.email AS user_email, u.full_name AS user_full_name
       FROM shop_orders o
       JOIN auth_users u ON u.id = o.user_id
       WHERE o.id = $1`,
      [id]
    );
    if (head.rows.length === 0) return res.status(404).json({ error: 'Order not found' });

    const items = await pool.query(
      `SELECT id, item_type AS "itemType", item_id AS "itemId", item_name AS "itemName",
              unit_price_cents AS "unitPriceCents", quantity, image_url AS "imageUrl"
       FROM shop_order_items WHERE order_id = $1 ORDER BY id`,
      [id]
    );

    const row = head.rows[0];
    res.json({
      order: {
        id: row.id,
        userId: row.user_id,
        userEmail: row.user_email,
        userFullName: row.user_full_name,
        paymentStatus: row.status,
        totalCents: row.total_cents,
        currency: row.currency,
        fulfillmentStatus: row.fulfillment_status || 'unfulfilled',
        trackingNote: row.tracking_note,
        shippingName: row.shipping_name,
        shippingEmail: row.shipping_email,
        shippingPhone: row.shipping_phone,
        shippingAddress: row.shipping_address,
        shippingCity: row.shipping_city,
        shippingZip: row.shipping_zip,
        createdAt: row.created_at,
      },
      items: items.rows,
    });
  } catch (err) {
    console.error('adminShop get order:', err.message);
    res.status(500).json({ error: 'Failed to load order' });
  }
});

router.patch('/shop/orders/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

  const { fulfillmentStatus, trackingNote } = req.body || {};
  if (fulfillmentStatus === undefined && trackingNote === undefined) {
    return res.status(400).json({ error: 'Provide fulfillmentStatus and/or trackingNote' });
  }

  if (
    fulfillmentStatus !== undefined &&
    !ALL_FULFILLMENT.includes(String(fulfillmentStatus).trim().toLowerCase())
  ) {
    return res.status(400).json({
      error: 'Invalid fulfillmentStatus',
      allowed: ALL_FULFILLMENT,
    });
  }

  try {
    const exists = await pool.query(
      `SELECT id, status FROM shop_orders WHERE id = $1`,
      [id]
    );
    if (exists.rows.length === 0) return res.status(404).json({ error: 'Order not found' });

    const sets = [];
    const vals = [];
    let p = 1;

    if (fulfillmentStatus !== undefined) {
      sets.push(`fulfillment_status = $${p++}`);
      vals.push(String(fulfillmentStatus).trim().toLowerCase());
    }
    if (trackingNote !== undefined) {
      sets.push(`tracking_note = $${p++}`);
      vals.push(trackingNote === null ? null : String(trackingNote));
    }
    vals.push(id);
    await pool.query(`UPDATE shop_orders SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${p}`, vals);

    const head = await pool.query(`SELECT * FROM shop_orders WHERE id = $1`, [id]);
    const row = head.rows[0];
    res.json({
      order: {
        id: row.id,
        paymentStatus: row.status,
        fulfillmentStatus: row.fulfillment_status,
        trackingNote: row.tracking_note,
      },
    });
  } catch (err) {
    console.error('adminShop patch order:', err.message);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

module.exports = router;
