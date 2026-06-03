import { API_BASE_URL, authHeaders } from './api';
import type { ReceptionistOrder } from './receptionist';

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(res.status === 404 ? 'API not found' : `Server error (${res.status})`);
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

export async function fetchReceptionistInventory(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/receptionist/inventory`, {
    headers: authHeaders(token),
  });
  const data = await parseJson<ReceptionistInventory & { error?: string }>(res);
  if (!res.ok) throw new Error(data.error || 'Failed to load inventory');
  return data;
}

export async function notifyAdminRestock(token: string, productId: number) {
  const res = await fetch(
    `${API_BASE_URL}/api/receptionist/inventory/${productId}/notify-restock`,
    { method: 'POST', headers: authHeaders(token) }
  );
  const data = await parseJson<{ message?: string; error?: string }>(res);
  if (!res.ok) throw new Error(data.error || 'Failed to notify admin');
  return data;
}
