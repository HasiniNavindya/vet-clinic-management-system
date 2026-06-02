import { apiFetch, authHeaders } from './api';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type PaymentType =
  | 'appointment_booking'
  | 'shop_order'
  | 'consultation'
  | 'prescription'
  | 'other';

export type PaymentTransaction = {
  id: number;
  userId: number;
  type: PaymentType;
  referenceType?: string | null;
  referenceId?: number | null;
  amountCents: number;
  currency: string;
  paymentMethod: string;
  status: PaymentStatus;
  description?: string | null;
  metadata?: Record<string, unknown>;
  stripeCheckoutSessionId?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  ownerName?: string;
  ownerEmail?: string;
};

export type PaymentConfig = {
  stripeEnabled: boolean;
  appointmentBookingFeeCents: number;
  currency: string;
};

export function formatMoney(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export type MyShopOrder = {
  id: number;
  paymentStatus: string;
  totalCents: number;
  fulfillmentStatus: string;
  trackingNote?: string;
  createdAt: string;
  items: { productName?: string; quantity: number; unitPriceCents: number }[];
};

export function fetchMyShopOrders(token: string) {
  return apiFetch<{ orders: MyShopOrder[] }>('/api/payments/my-orders', {
    headers: authHeaders(token),
  });
}

export function fetchPaymentConfig(token: string) {
  return apiFetch<PaymentConfig>('/api/payments/config', {
    headers: authHeaders(token),
  });
}

export function fetchTransactions(token: string) {
  return apiFetch<PaymentTransaction[]>('/api/payments/transactions', {
    headers: authHeaders(token),
  });
}

export function createAppointmentCheckout(
  token: string,
  body: {
    doctor_id?: number;
    pet_id?: number;
    appointment_date?: string;
    appointment_time?: string;
    notes?: string;
    appointment_id?: number;
  }
) {
  return apiFetch<{
    url: string;
    sessionId?: string;
    transactionId: number;
    demoMode?: boolean;
  }>('/api/payments/appointment/checkout', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

export function createShopCheckout(
  token: string,
  body: {
    items: Array<{
      id: number;
      name: string;
      price: number;
      image: string;
      type: 'product' | 'pet';
      quantity: number;
    }>;
    shipping: {
      fullName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      zipCode: string;
    };
  }
) {
  return apiFetch<{
    url: string;
    sessionId?: string;
    transactionId: number;
    orderId?: number;
    demoMode?: boolean;
  }>('/api/payments/shop/checkout', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

export function confirmPaymentSession(token: string, sessionId: string) {
  return apiFetch<{
    appointment?: { id: number };
    transaction?: PaymentTransaction;
    alreadyCompleted?: boolean;
  }>('/api/payments/confirm-session', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ session_id: sessionId }),
  });
}

export function completeDemoPayment(token: string, transactionId: number) {
  return apiFetch<{
    appointment?: { id: number };
    transaction?: PaymentTransaction;
  }>(`/api/payments/demo-complete/${transactionId}`, {
    method: 'POST',
    headers: authHeaders(token),
  });
}

export function recordOfflinePayment(
  token: string,
  body: {
    user_id: number;
    amount_cents: number;
    type: 'consultation' | 'prescription' | 'other';
    description: string;
    payment_method: 'cash' | 'card_offline' | 'other';
    reference_type?: string;
    reference_id?: number;
    notes?: string;
  }
) {
  return apiFetch<PaymentTransaction>('/api/payments/offline', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
}

export function fetchPetOwnersForStaff(token: string) {
  return apiFetch<Array<{ id: number; full_name: string; email: string }>>(
    '/api/payments/receptionist/pet-owners',
    { headers: authHeaders(token) }
  );
}

export function paymentTypeLabel(type: PaymentType) {
  const labels: Record<PaymentType, string> = {
    appointment_booking: 'Appointment booking',
    shop_order: 'Shop order',
    consultation: 'Consultation fee',
    prescription: 'Prescription / medicine',
    other: 'Other',
  };
  return labels[type] || type;
}

export function paymentStatusLabel(status: PaymentStatus) {
  const labels: Record<PaymentStatus, string> = {
    pending: 'Pending',
    processing: 'Processing',
    succeeded: 'Paid',
    failed: 'Failed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return labels[status] || status;
}
