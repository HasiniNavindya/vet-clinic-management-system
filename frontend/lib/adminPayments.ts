import { API_BASE_URL, authHeaders } from './api';
import type { PaymentTransaction } from './payments';

async function parseJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid response');
  }
}

export interface PaymentOverview {
  totalRevenueCents: number;
  revenueLast30DaysCents: number;
  pendingCount: number;
  stripeEnabled: boolean;
  statusBreakdown: { status: string; count: number; cents: number }[];
  succeededByType: { type: string; count: number }[];
  recentTransactions: PaymentTransaction[];
}

export async function fetchPaymentOverview(token: string): Promise<PaymentOverview> {
  const res = await fetch(`${API_BASE_URL}/api/admin/payments/overview`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed');
  return data as PaymentOverview;
}

export async function fetchAdminTransactions(
  token: string,
  params?: { page?: number; limit?: number; status?: string; type?: string; search?: string }
): Promise<{
  transactions: PaymentTransaction[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.status) q.set('status', params.status);
  if (params?.type) q.set('type', params.type);
  if (params?.search) q.set('search', params.search);
  const res = await fetch(`${API_BASE_URL}/api/admin/payments/transactions?${q}`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed');
  return data as {
    transactions: PaymentTransaction[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export async function verifyAdminTransaction(
  token: string,
  id: number
): Promise<{ transaction: PaymentTransaction; message?: string }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/payments/transactions/${id}/verify`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({}),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Verify failed');
  return data as { transaction: PaymentTransaction };
}

export async function refundAdminTransaction(
  token: string,
  id: number,
  reason?: string
): Promise<{ transaction: PaymentTransaction }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/payments/transactions/${id}/refund`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ reason }),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Refund failed');
  return data as { transaction: PaymentTransaction };
}

export interface OrderPaymentRow {
  id: number;
  user_id: number;
  status: string;
  total_cents: number;
  fulfillment_status: string | null;
  created_at: string;
  user_email: string;
  user_full_name: string;
  payment_tx_id: number | null;
  payment_status: string | null;
}

export async function fetchPaymentOrderTracking(
  token: string,
  params?: { page?: number; limit?: number }
): Promise<{
  orders: OrderPaymentRow[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  const res = await fetch(`${API_BASE_URL}/api/admin/payments/order-tracking?${q}`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed');
  return data as {
    orders: OrderPaymentRow[];
    total: number;
    page: number;
    totalPages: number;
  };
}
