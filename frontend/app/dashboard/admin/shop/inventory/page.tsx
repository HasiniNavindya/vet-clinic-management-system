'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { fetchInventorySummary, patchAdminProduct } from '@/lib/adminShop';
import { categoryLabel } from '@/lib/shopCategories';

export default function AdminInventoryPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [rows, setRows] = useState<
    { id: number; name: string; category: string; stockQuantity: number; isActive: boolean }[]
  >([]);
  const [outOfStock, setOutOfStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stockEdits, setStockEdits] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const r = await fetchInventorySummary(token);
      setRows(r.lowStockRows);
      setOutOfStock(r.outOfStockCount);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=admin');
    if (!isLoading && isAuthenticated && !hasRole('admin')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, hasRole, router]);

  useEffect(() => {
    if (isAuthenticated && hasRole('admin') && token) load();
  }, [isAuthenticated, hasRole, token, load]);

  const saveStock = async (id: number) => {
    if (!token) return;
    const raw = stockEdits[id];
    if (raw === undefined) return;
    const n = Math.max(0, Math.floor(Number(raw)));
    try {
      await patchAdminProduct(token, id, { stockQuantity: n });
      setStockEdits((s) => {
        const next = { ...s };
        delete next[id];
        return next;
      });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Update failed');
    }
  };

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
      <div className="container mx-auto max-w-4xl px-4 py-8 pt-28">
        <Link href="/dashboard/admin/shop" className="text-sm font-semibold text-[#ec6d13] hover:underline">
          ← Shop hub
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Inventory dashboard</h1>
        <p className="text-gray-600">
          Products at or below 10 units in stock. Total catalog items with zero stock:{' '}
          <strong>{outOfStock}</strong>
        </p>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <div className="mt-10 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
          </div>
        ) : rows.length === 0 ? (
          <p className="mt-8 rounded-xl border border-green-200 bg-green-50 p-4 text-green-900">
            No low-stock alerts — all active products are above the 10-unit threshold.
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {rows.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4"
              >
                <div>
                  <p className="font-semibold text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-600">
                    {categoryLabel(r.category)} · current stock <strong>{r.stockQuantity}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
                    placeholder="New qty"
                    value={stockEdits[r.id] ?? ''}
                    onChange={(e) => setStockEdits((s) => ({ ...s, [r.id]: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => saveStock(r.id)}
                    className="rounded bg-[#ec6d13] px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-8 text-sm text-gray-500">
          Full catalog edits (including categories) live on the{' '}
          <Link href="/dashboard/admin/shop/products" className="font-semibold text-[#ec6d13] hover:underline">
            Products
          </Link>{' '}
          screen.
        </p>
      </div>
    </div>
  );
}
