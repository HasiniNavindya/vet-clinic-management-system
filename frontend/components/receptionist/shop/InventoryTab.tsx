'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchReceptionistInventory,
  notifyAdminRestock,
  type InventoryProduct,
} from '@/lib/receptionistShop';
import { categoryLabel } from '@/lib/shopCategories';

export default function InventoryTab() {
  const { token } = useAuth();
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [threshold, setThreshold] = useState(10);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setMessage('');
    try {
      const data = await fetchReceptionistInventory(token);
      setProducts(data.products);
      setSummary(data.summary);
      setThreshold(data.summary.threshold);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const filtered = useMemo(() => {
    if (filter === 'low') return products.filter((p) => p.needsRestock && p.stockQuantity > 0);
    if (filter === 'out') return products.filter((p) => p.stockQuantity === 0);
    return products;
  }, [products, filter]);

  const notifyRestock = async (productId: number) => {
    if (!token) return;
    setBusyId(productId);
    setMessage('');
    try {
      const res = await notifyAdminRestock(token, productId);
      setMessage(res.message || 'Admin notified.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-900">
        Stock levels match the public <strong>Marketplace</strong> shop products. Items at{' '}
        <strong>{threshold} units or fewer</strong> need restock — use <strong>Notify admin</strong>{' '}
        to alert the shop manager. Admins are also alerted automatically when stock drops after a
        sale.
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Active products" value={summary.totalProducts} />
        <SummaryCard label="Low stock" value={summary.lowStockCount} tone="amber" />
        <SummaryCard label="Out of stock" value={summary.outOfStockCount} tone="red" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ['all', 'All products'],
            ['low', 'Low stock'],
            ['out', 'Out of stock'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === id
                ? 'bg-[#ec6d13] text-white'
                : 'bg-white text-gray-700 ring-1 ring-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {message ? (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">{message}</p>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs font-semibold uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No products in this view.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{categoryLabel(p.category)}</td>
                  <td className="px-4 py-3">${Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <StockBar quantity={p.stockQuantity} threshold={threshold} />
                  </td>
                  <td className="px-4 py-3">
                    <StockBadge level={p.stockLevel} quantity={p.stockQuantity} />
                  </td>
                  <td className="px-4 py-3">
                    {p.needsRestock ? (
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => notifyRestock(p.id)}
                        className="rounded-lg bg-[#ec6d13] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
                      >
                        {busyId === p.id ? 'Sending…' : 'Notify admin'}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">OK</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: 'amber' | 'red';
}) {
  const styles =
    tone === 'amber'
      ? 'border-amber-200 bg-amber-50'
      : tone === 'red'
        ? 'border-red-200 bg-red-50'
        : 'border-gray-200 bg-white';
  return (
    <div className={`rounded-xl border px-3 py-3 ${styles}`}>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    </div>
  );
}

function StockBar({ quantity, threshold }: { quantity: number; threshold: number }) {
  const max = Math.max(threshold * 2, quantity, 1);
  const pct = Math.min(100, (quantity / max) * 100);
  const color =
    quantity === 0 ? 'bg-red-500' : quantity <= threshold ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 font-semibold tabular-nums">{quantity}</span>
      <div className="h-2 flex-1 min-w-[60px] overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StockBadge({
  level,
  quantity,
}: {
  level: string;
  quantity: number;
}) {
  if (quantity === 0) {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800">
        Out of stock
      </span>
    );
  }
  if (level === 'low') {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
        Low stock
      </span>
    );
  }
  return (
    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-800">
      In stock
    </span>
  );
}
