'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';

export default function AdminShopHubPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=admin');
    if (!isLoading && isAuthenticated && !hasRole('admin')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, hasRole, router]);

  if (isLoading || !isAuthenticated || !hasRole('admin')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-10 pt-28">
        <Link href="/dashboard/admin" className="text-sm font-semibold text-[#ec6d13] hover:underline">
          ← Admin home
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Shop management</h1>
        <p className="mt-2 text-gray-600">
          Curate the online store catalog, watch stock levels, and process paid customer orders.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard/admin/shop/products"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="text-lg font-bold text-gray-900">Product catalog</h2>
            <p className="mt-2 text-sm text-gray-600">Create, edit, delete, categorize, and deactivate products.</p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">Open →</span>
          </Link>
          <Link
            href="/dashboard/admin/shop/inventory"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="text-lg font-bold text-gray-900">Inventory dashboard</h2>
            <p className="mt-2 text-sm text-gray-600">Low-stock alerts and quick stock adjustments.</p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">Open →</span>
          </Link>
          <Link
            href="/dashboard/admin/shop/orders"
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:col-span-2"
          >
            <h2 className="text-lg font-bold text-gray-900">Orders</h2>
            <p className="mt-2 text-sm text-gray-600">View Stripe-paid orders and update fulfillment workflow.</p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#ec6d13]">Open →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
