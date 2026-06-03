import { API_BASE_URL, authHeaders } from './api';
import { SHOP_PRODUCT_CATEGORIES } from './shopCategories';
import type { ReceptionistOrder } from './receptionist';

const LOW_STOCK_THRESHOLD = 10;

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    if (res.status === 404) {
      throw new Error('Inventory API not found — restart the backend (port 5000) and refresh.');
    }
    throw new Error(`Server error (${res.status})`);
  }
}

export type OrderLineItem = {
  name: string;
  quantity: number;
  unitPriceCents: number;
};

export type ReceptionistOrderWithItems = ReceptionistOrder & {
  items?: OrderLineItem[];
};

export type InventoryProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  image?: string;
  stockQuantity: number;
  stockLevel: 'out' | 'low' | 'ok';
  needsRestock: boolean;
};

export type ReceptionistInventory = {
  products: InventoryProduct[];
  summary: {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    threshold: number;
  };
  categories: { id: string; label: string }[];
};

export {
  FULFILLMENT_STEPS,
  fulfillmentStepIndex,
  fulfillmentStatusLabel,
} from './shopFulfillment';

export function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    cents / 100
  );
}

type PublicProductRow = {
  id: number;
  name: string;
  category?: string;
  price: string | number;
  image?: string;
  stockQuantity?: number;
  stock_quantity?: number;
};

function mapPublicProduct(row: PublicProductRow): InventoryProduct {
  const stock = Number(row.stockQuantity ?? row.stock_quantity ?? 0);
  return {
    id: row.id,
    name: row.name,
    category: row.category || 'accessories',
    price: Number(row.price),
    image: row.image,
    stockQuantity: stock,
    stockLevel: stock === 0 ? 'out' : stock <= LOW_STOCK_THRESHOLD ? 'low' : 'ok',
    needsRestock: stock <= LOW_STOCK_THRESHOLD,
  };
}

function buildInventoryFromPublicProducts(rows: PublicProductRow[]): ReceptionistInventory {
  const products = rows.map(mapPublicProduct);
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
    categories: [...SHOP_PRODUCT_CATEGORIES],
  };
}

async function fetchMarketplaceProductsPublic(): Promise<ReceptionistInventory> {
  const res = await fetch(`${API_BASE_URL}/products`);
  const rows = await parseJson<PublicProductRow[]>(res);
  if (!res.ok) {
    throw new Error((rows as unknown as { error?: string })?.error || 'Failed to load marketplace products');
  }
  if (!Array.isArray(rows)) {
    throw new Error('Invalid marketplace products response');
  }
  return buildInventoryFromPublicProducts(rows);
}

const INVENTORY_PATHS = [
  '/api/shop/inventory',
  '/api/receptionist/inventory',
] as const;

export async function fetchReceptionistInventory(token: string): Promise<ReceptionistInventory> {
  let lastError: Error | null = null;

  for (const path of INVENTORY_PATHS) {
    try {
      const res = await fetch(`${API_BASE_URL}${path}`, { headers: authHeaders(token) });
      const data = await parseJson<ReceptionistInventory & { error?: string }>(res);
      if (res.ok) return data;
      if (res.status !== 404) {
        throw new Error(data.error || `Failed to load inventory (${res.status})`);
      }
      lastError = new Error(data.error || 'Inventory API not found');
    } catch (e) {
      lastError = e instanceof Error ? e : new Error('Failed to load inventory');
      if (!lastError.message.includes('not found') && !lastError.message.includes('404')) {
        throw lastError;
      }
    }
  }

  try {
    return await fetchMarketplaceProductsPublic();
  } catch (fallbackErr) {
    throw lastError || (fallbackErr instanceof Error ? fallbackErr : new Error('Failed to load inventory'));
  }
}

const RESTOCK_PATHS = [
  (id: number) => `/api/shop/inventory/${id}/notify-restock`,
  (id: number) => `/api/receptionist/inventory/${id}/notify-restock`,
] as const;

export async function notifyAdminRestock(token: string, productId: number) {
  let lastError: Error | null = null;

  for (const pathFn of RESTOCK_PATHS) {
    const res = await fetch(`${API_BASE_URL}${pathFn(productId)}`, {
      method: 'POST',
      headers: authHeaders(token),
    });
    const data = await parseJson<{ message?: string; error?: string }>(res);
    if (res.ok) return data;
    lastError = new Error(data.error || 'Failed to notify admin');
    if (res.status !== 404) throw lastError;
  }

  throw lastError || new Error('Restock API not found — restart the backend on port 5000.');
}
