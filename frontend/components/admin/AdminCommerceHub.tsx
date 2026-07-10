'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchAdminMarketplaceListings } from '@/lib/marketplaceListings';
import AdminPageTabs, { useAdminTab } from '@/components/admin/AdminPageTabs';
import AdminMarketplacePanel from '@/components/admin/AdminMarketplacePanel';

function CommerceHubInner() {
  const { token } = useAuth();
  const { active } = useAdminTab('shop', ['shop', 'marketplace']);
  const [pendingAds, setPendingAds] = useState(0);

  const onPendingCount = useCallback((n: number) => setPendingAds(n), []);

  useEffect(() => {
    if (!token) return;
    fetchAdminMarketplaceListings(token, 'pending')
      .then((r) => setPendingAds(r.pendingCount))
      .catch(() => {});
  }, [token]);

  const tabs = [
    { id: 'shop', label: 'Clinic store' },
    { id: 'marketplace', label: 'Pet marketplace', badge: pendingAds },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#ec6d13]/15 bg-gradient-to-br from-orange-50 via-white to-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-[#ec6d13]">Commerce</p>
        <h1 className="mt-1 font-sans text-2xl font-bold text-gray-900">Shop & marketplace</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Manage the clinic online store (products, stock, orders) and moderate pet-owner ads on the public
          marketplace.
        </p>
        {pendingAds > 0 ? (
          <span className="mt-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
            {pendingAds} marketplace ad{pendingAds === 1 ? '' : 's'} awaiting approval
          </span>
        ) : null}
      </div>

      <AdminPageTabs tabs={tabs} defaultTab="shop" />

      {active === 'shop' ? (
        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard/admin/shop/products"
            className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-[#ec6d13]/30 hover:shadow-md"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-[#ec6d13]">Product catalog</h3>
            <p className="mt-2 text-sm text-gray-600">
              Create, edit, delete, categorize, and deactivate store products.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">Open →</span>
          </Link>
          <Link
            href="/dashboard/admin/shop/inventory"
            className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-[#ec6d13]/30 hover:shadow-md"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-[#ec6d13]">Inventory</h3>
            <p className="mt-2 text-sm text-gray-600">Low-stock alerts and quick stock adjustments.</p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">Open →</span>
          </Link>
          <Link
            href="/dashboard/admin/shop/orders"
            className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-[#ec6d13]/30 hover:shadow-md sm:col-span-2"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-[#ec6d13]">Paid orders</h3>
            <p className="mt-2 text-sm text-gray-600">
              View Stripe-paid shop orders and update fulfillment status.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">Open →</span>
          </Link>
        </section>
      ) : (
        <AdminMarketplacePanel onPendingCount={onPendingCount} />
      )}
    </div>
  );
}

export default function AdminCommerceHub() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
        </div>
      }
    >
      <CommerceHubInner />
    </Suspense>
  );
}
