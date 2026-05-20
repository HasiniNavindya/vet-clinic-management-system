import { API_BASE_URL, authHeaders } from './api';
import type { ShopCategoryId } from './shopCategories';

async function parseJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(res.status === 404 ? 'API not found' : 'Invalid response');
  }
}

export interface AdminProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stockQuantity: number;
  isActive: boolean;
  createdAt?: string;
}

export async function fetchAdminShopProducts(token: string): Promise<{
  products: AdminProduct[];
  categories: { id: string; label: string }[];
}> {
  const res = await fetch(`${API_BASE_URL}/api/admin/shop/products`, { headers: authHeaders(token) });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to load products');
  return data as { products: AdminProduct[]; categories: { id: string; label: string }[] };
}

export async function createAdminProduct(
  token: string,
  body: {
    name: string;
    description?: string;
    price: number;
    image?: string;
    category: ShopCategoryId | string;
    stockQuantity: number;
    isActive?: boolean;
  }
): Promise<{ product: AdminProduct }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/shop/products`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Create failed');
  return data as { product: AdminProduct };
}

export async function patchAdminProduct(
  token: string,
  id: number,
  body: Partial<{
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    stockQuantity: number;
    isActive: boolean;
  }>
): Promise<{ product: AdminProduct }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/shop/products/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Update failed');
  return data as { product: AdminProduct };
}

export async function deleteAdminProduct(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/admin/shop/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Delete failed');
}

export async function fetchInventorySummary(token: string): Promise<{
  lowStockRows: { id: number; name: string; category: string; stockQuantity: number; isActive: boolean }[];
  outOfStockCount: number;
  categories: { id: string; label: string }[];
}> {
  const res = await fetch(`${API_BASE_URL}/api/admin/shop/inventory-summary`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed');
  return data as {
    lowStockRows: { id: number; name: string; category: string; stockQuantity: number; isActive: boolean }[];
    outOfStockCount: number;
    categories: { id: string; label: string }[];
  };
}

export interface AdminShopOrder {
  id: number;
  userId: number;
  userEmail: string;
  userFullName: string;
  paymentStatus: string;
  totalCents: number;
  currency: string;
  fulfillmentStatus: string;
  trackingNote?: string | null;
  shippingName?: string | null;
  shippingEmail?: string | null;
  shippingPhone?: string | null;
  shippingAddress?: string | null;
  shippingCity?: string | null;
  shippingZip?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export async function fetchAdminShopOrders(
  token: string,
  params?: { page?: number; limit?: number; paymentStatus?: string }
): Promise<{ orders: AdminShopOrder[]; total: number; page: number; totalPages: number }> {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.paymentStatus) q.set('paymentStatus', params.paymentStatus);
  const res = await fetch(`${API_BASE_URL}/api/admin/shop/orders?${q}`, { headers: authHeaders(token) });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed');
  return data as { orders: AdminShopOrder[]; total: number; page: number; totalPages: number };
}

export async function fetchAdminShopOrderDetail(
  token: string,
  id: number
): Promise<{
  order: AdminShopOrder;
  items: {
    id: number;
    itemType: string;
    itemId: number;
    itemName: string;
    unitPriceCents: number;
    quantity: number;
    imageUrl?: string | null;
  }[];
}> {
  const res = await fetch(`${API_BASE_URL}/api/admin/shop/orders/${id}`, { headers: authHeaders(token) });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed');
  return data as {
    order: AdminShopOrder;
    items: {
      id: number;
      itemType: string;
      itemId: number;
      itemName: string;
      unitPriceCents: number;
      quantity: number;
      imageUrl?: string | null;
    }[];
  };
}

export async function patchAdminShopOrder(
  token: string,
  id: number,
  body: { fulfillmentStatus?: string; trackingNote?: string | null }
): Promise<{ order: { id: number; paymentStatus: string; fulfillmentStatus: string; trackingNote?: string } }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/shop/orders/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Update failed');
  return data as {
    order: { id: number; paymentStatus: string; fulfillmentStatus: string; trackingNote?: string };
  };
}
