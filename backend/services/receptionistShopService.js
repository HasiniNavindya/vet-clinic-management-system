const pool = require('../db');
const { PRODUCT_CATEGORIES, LOW_STOCK_THRESHOLD } = require('../config/shop');
const {
  notifyAdminsInventoryRestock,
  processLowStockInventoryAlerts,
} = require('./notificationService');

function mapProductRow(row) {
  const stock = Number(row.stock_quantity ?? 0);
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    image: row.image,
    stockQuantity: stock,
    isActive: row.is_active !== false,
    stockLevel:
      stock === 0 ? 'out' : stock <= LOW_STOCK_THRESHOLD ? 'low' : 'ok',
    needsRestock: stock <= LOW_STOCK_THRESHOLD,
  };
}

async function listMarketplaceInventory() {
  const productsRes = await pool.query(
    `SELECT id, name, category, price, image, stock_quantity, is_active
     FROM products
     WHERE COALESCE(is_active, true) = true
     ORDER BY stock_quantity ASC, name ASC`
  );
  const products = productsRes.rows.map(mapProductRow);

  const lowStock = products.filter((p) => p.needsRestock);
  const outOfStock = products.filter((p) => p.stockQuantity === 0);

  return {
    products,
    summary: {
      totalProducts: products.length,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      threshold: LOW_STOCK_THRESHOLD,
    },
    categories: PRODUCT_CATEGORIES,
  };
}

async function getProductForRestock(productId) {
  const r = await pool.query(
    `SELECT id, name, category, COALESCE(stock_quantity, 0)::int AS stock_quantity
     FROM products WHERE id = $1`,
    [productId]
  );
  return r.rows[0] ? mapProductRow(r.rows[0]) : null;
}

async function loadInventoryWithAlerts() {
  const inventory = await listMarketplaceInventory();
  await processLowStockInventoryAlerts().catch((err) => {
    console.error('Low stock scan:', err.message);
  });
  return inventory;
}

async function receptionNotifyRestock(productId, receptionistUserId, receptionistName) {
  const product = await getProductForRestock(productId);
  if (!product) return { ok: false, error: 'Product not found' };
  if (!product.needsRestock) {
    return {
      ok: false,
      error: `Stock is above ${LOW_STOCK_THRESHOLD}. Restock alert is only needed when count is ${LOW_STOCK_THRESHOLD} or less.`,
    };
  }
  const result = await notifyAdminsInventoryRestock(product, {
    triggeredByUserId: receptionistUserId,
    receptionistName,
  });
  if (result.skipped && result.reason === 'recent_alert') {
    return {
      ok: true,
      message: 'Admins were already notified recently. No duplicate alert sent.',
      ...result,
    };
  }
  if (result.sent === 0) {
    return { ok: false, error: 'Could not notify admins', ...result };
  }
  return {
    ok: true,
    message: `Restock request sent to ${result.sent} admin(s).`,
    ...result,
  };
}

module.exports = {
  listMarketplaceInventory,
  loadInventoryWithAlerts,
  receptionNotifyRestock,
  LOW_STOCK_THRESHOLD,
};
