'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import CheckoutModal from '@/components/marketplace/CheckoutModal';
import OwnerPostPetAdModal from '@/components/marketplace/OwnerPostPetAdModal';
import {
  cartItemCount,
  cartTotal,
  loadCart,
  resolveCartImageUrl,
  saveCart,
  type CartItem,
} from '@/lib/cart';
import {
  fetchMyPetListings,
  listingStatusLabel,
  resolveListingImageUrl,
  type PetListing,
} from '@/lib/marketplaceListings';
import {
  fetchMyShopOrders,
  fetchTransactions,
  formatMoney,
  paymentStatusLabel,
  type MyShopOrder,
  type PaymentTransaction,
} from '@/lib/payments';

type MarketplaceTab = 'cart' | 'orders' | 'payments' | 'listings';

const TABS: { id: MarketplaceTab; label: string }[] = [
  { id: 'cart', label: 'Cart' },
  { id: 'orders', label: 'Purchase history' },
  { id: 'payments', label: 'Shop payments' },
  { id: 'listings', label: 'My advertisements' },
];

function parseTab(value: string | null): MarketplaceTab {
  if (value === 'orders' || value === 'payments' || value === 'listings') return value;
  return 'cart';
}

export default function PetOwnerMarketplaceHub() {
  return (
    <Suspense fallback={<HubSpinner />}>
      <HubContent />
    </Suspense>
  );
}

function HubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get('tab'));

  const setTab = useCallback(
    (next: MarketplaceTab) => {
      router.replace(`/dashboard/pet-owner/marketplace?tab=${next}`, { scroll: false });
    },
    [router]
  );

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-sans text-xl font-semibold text-gray-900">Marketplace</p>
          <p className="mt-0.5 text-sm text-gray-500">
            Shop, track orders, payments, and your pet advertisements
          </p>
        </div>
        <Link
          href="/marketplace"
          className="inline-flex items-center justify-center rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f]"
        >
          Browse marketplace
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-3 py-2.5 text-sm font-semibold transition sm:px-4 ${
              tab === t.id
                ? 'border-b-2 border-[#ec6d13] text-[#ec6d13]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'cart' ? <CartPanel /> : null}
      {tab === 'orders' ? <OrdersPanel /> : null}
      {tab === 'payments' ? <PaymentsPanel /> : null}
      {tab === 'listings' ? <ListingsPanel /> : null}
    </div>
  );
}

function HubSpinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
    </div>
  );
}

function CartPanel() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setMounted(true);
  }, []);

  const persist = (next: CartItem[]) => {
    setItems(next);
    saveCart(next);
  };

  const updateQty = (id: number, type: CartItem['type'], quantity: number) => {
    persist(
      items.map((i) =>
        i.id === id && i.type === type ? { ...i, quantity: Math.max(1, quantity) } : i
      )
    );
  };

  const remove = (id: number, type: CartItem['type']) => {
    persist(items.filter((i) => !(i.id === id && i.type === type)));
  };

  const total = cartTotal(items);
  const count = cartItemCount(items);

  if (!mounted) return <HubSpinner />;

  return (
    <section>
      <p className="text-sm text-gray-600">
        Items you add from the public marketplace shop appear here. Checkout saves your order and
        payment status under the other tabs.
      </p>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-600">Your cart is empty.</p>
          <Link
            href="/marketplace"
            className="mt-3 inline-block text-sm font-semibold text-[#ec6d13] hover:text-[#d65e0f]"
          >
            Shop products & pets →
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <img
                src={resolveCartImageUrl(item.image)}
                alt={item.name}
                className="h-20 w-20 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="font-sans text-sm font-semibold text-gray-900">{item.name}</p>
                <p className="text-xs capitalize text-gray-500">{item.type}</p>
                <p className="mt-1 text-sm font-semibold text-[#ec6d13]">
                  ${item.price.toFixed(2)} each
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQty(item.id, item.type, item.quantity - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQty(item.id, item.type, item.quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(item.id, item.type)}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-orange-50 px-5 py-4">
            <div>
              <p className="text-sm text-gray-600">{count} item(s)</p>
              <p className="font-sans text-lg font-semibold text-gray-900">
                Total: ${total.toFixed(2)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="rounded-lg bg-[#ec6d13] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#d65e0f]"
            >
              Proceed to checkout
            </button>
          </div>
        </div>
      )}

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={items}
        total={total}
        onOrderPlaced={() => {
          persist([]);
          setCheckoutOpen(false);
        }}
      />
    </section>
  );
}

function OrdersPanel() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<MyShopOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchMyShopOrders(token).then((res) => {
      if (res.ok) setOrders(res.data.orders);
      setLoading(false);
    });
  }, [token]);

  if (loading) return <HubSpinner />;

  if (orders.length === 0) {
    return (
      <EmptyPanel message="No shop orders yet. Add items to your cart and complete checkout." />
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li key={o.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-sans text-base font-semibold text-gray-900">Order #{o.id}</p>
            <FulfillmentBadge status={o.fulfillmentStatus} />
          </div>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase text-gray-500">Total</dt>
              <dd className="text-gray-900">{formatMoney(o.totalCents)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-gray-500">Payment</dt>
              <dd>
                <PaymentBadge status={o.paymentStatus} />
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase text-gray-500">Placed</dt>
              <dd className="text-gray-700">{new Date(o.createdAt).toLocaleString()}</dd>
            </div>
          </dl>
          {o.trackingNote ? (
            <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
              <span className="font-medium">Tracking: </span>
              {o.trackingNote}
            </p>
          ) : null}
          {o.items?.length ? (
            <ul className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm text-gray-700">
              {o.items.map((item, i) => (
                <li key={i}>
                  {item.productName || 'Item'} × {item.quantity} —{' '}
                  {formatMoney(item.unitPriceCents * item.quantity)}
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function PaymentsPanel() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetchTransactions(token).then((res) => {
      if (res.ok) {
        setTransactions(res.data.filter((tx) => tx.type === 'shop_order'));
      } else {
        setError((res.data as { error?: string }).error || 'Failed to load');
      }
      setLoading(false);
    });
  }, [token]);

  if (loading) return <HubSpinner />;
  if (error) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  }
  if (transactions.length === 0) {
    return (
      <EmptyPanel message="No shop order payments yet. Complete checkout from your cart to see payment status here." />
    );
  }

  return (
    <ul className="space-y-3">
      {transactions.map((tx) => (
        <li key={tx.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-sans text-sm font-semibold text-gray-900">Shop order payment</p>
              <p className="mt-1 text-sm text-gray-600">{tx.description}</p>
              <p className="mt-1 text-xs text-gray-500">
                {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {formatMoney(tx.amountCents, tx.currency)}
              </p>
              <PaymentBadge status={tx.status} />
            </div>
          </div>
          <Link
            href="/dashboard/pet-owner/marketplace?tab=orders"
            className="mt-3 inline-block text-sm font-semibold text-[#ec6d13] hover:text-[#d65e0f]"
          >
            View purchase history →
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ListingsPanel() {
  const { token } = useAuth();
  const [listings, setListings] = useState<PetListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [postOpen, setPostOpen] = useState(false);

  const load = () => {
    if (!token) return;
    setLoading(true);
    fetchMyPetListings(token)
      .then((d) => setListings(d.listings))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [token]);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Pet ads you post appear here after clinic review. Approved ads show on the public
          marketplace.
        </p>
        <button
          type="button"
          onClick={() => setPostOpen(true)}
          className="rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f]"
        >
          Post new ad
        </button>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <HubSpinner />
      ) : listings.length === 0 ? (
        <EmptyPanel message="You have not posted any marketplace advertisements yet." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {listings.map((l) => {
            const img = resolveListingImageUrl(l.image);
            return (
              <li
                key={l.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="flex gap-4 p-4">
                  {img ? (
                    <img
                      src={img}
                      alt={l.name}
                      className="h-24 w-24 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-2xl font-bold text-[#ec6d13]">
                      {l.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-base font-semibold text-gray-900">{l.name}</p>
                    <p className="text-sm font-semibold text-[#ec6d13]">${l.price}</p>
                    <ListingStatusBadge status={l.listingStatus} />
                  </div>
                </div>
                <dl className="space-y-2 border-t border-gray-50 px-4 py-3 text-sm">
                  {l.age ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase text-gray-500">Age</dt>
                      <dd className="text-gray-800">{l.age}</dd>
                    </div>
                  ) : null}
                  {l.location ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase text-gray-500">Location</dt>
                      <dd className="text-gray-800">{l.location}</dd>
                    </div>
                  ) : null}
                  {l.description ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase text-gray-500">Description</dt>
                      <dd className="leading-relaxed text-gray-700">{l.description}</dd>
                    </div>
                  ) : null}
                  {l.contactNumber ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase text-gray-500">Contact</dt>
                      <dd className="text-gray-800">{l.contactNumber}</dd>
                    </div>
                  ) : null}
                  {l.createdAt ? (
                    <p className="text-xs text-gray-500">
                      Submitted {new Date(l.createdAt).toLocaleDateString()}
                    </p>
                  ) : null}
                  {l.rejectionReason ? (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                      {l.rejectionReason}
                    </p>
                  ) : null}
                </dl>
              </li>
            );
          })}
        </ul>
      )}

      <OwnerPostPetAdModal
        isOpen={postOpen}
        onClose={() => setPostOpen(false)}
        onSuccess={() => {
          setPostOpen(false);
          load();
        }}
      />
    </section>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-600 shadow-sm">
      {message}
    </p>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    succeeded: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-700',
    refunded: 'bg-purple-100 text-purple-800',
    paid: 'bg-green-100 text-green-800',
  };
  return (
    <span
      className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status] || 'bg-gray-100 text-gray-700'}`}
    >
      {(paymentStatusLabel as (s: string) => string)(status) || status.replace(/_/g, ' ')}
    </span>
  );
}

function FulfillmentBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-[#c45f10]">
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function ListingStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const ring =
    s === 'approved'
      ? 'bg-green-100 text-green-800'
      : s === 'rejected'
        ? 'bg-red-100 text-red-800'
        : 'bg-amber-100 text-amber-900';
  return (
    <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ring}`}>
      {listingStatusLabel(status)}
    </span>
  );
}
