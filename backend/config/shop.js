/**
 * Shop product categories (SRS-aligned) and marketplace listing rules.
 */
const PRODUCT_CATEGORIES = [
  { id: 'pet_food', label: 'Pet food' },
  { id: 'toys', label: 'Toys' },
  { id: 'medicines', label: 'Medicines' },
  { id: 'accessories', label: 'Accessories' },
];

const LEGACY_CATEGORY_MAP = {
  food: 'pet_food',
  pet_food: 'pet_food',
  toys: 'toys',
  medicines: 'medicines',
  health: 'medicines',
  accessories: 'accessories',
  grooming: 'accessories',
};

const LISTING_STATUS = {
  PENDING: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REMOVED: 'removed',
};

const FULFILLMENT_STATUS = {
  UNFULFILLED: 'unfulfilled',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

const ALL_FULFILLMENT = Object.values(FULFILLMENT_STATUS);

/** Alert reception & admin when marketplace stock falls at or below this level. */
const LOW_STOCK_THRESHOLD = 10;

function normalizeProductCategory(raw) {
  const k = String(raw || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_');
  if (PRODUCT_CATEGORIES.some((c) => c.id === k)) return k;
  return LEGACY_CATEGORY_MAP[k] || 'accessories';
}

function isAllowedProductCategory(id) {
  return PRODUCT_CATEGORIES.some((c) => c.id === id);
}

module.exports = {
  PRODUCT_CATEGORIES,
  LEGACY_CATEGORY_MAP,
  LISTING_STATUS,
  FULFILLMENT_STATUS,
  ALL_FULFILLMENT,
  LOW_STOCK_THRESHOLD,
  normalizeProductCategory,
  isAllowedProductCategory,
};
