'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAdminShopProducts,
  createAdminProduct,
  patchAdminProduct,
  deleteAdminProduct,
  type AdminProduct,
} from '@/lib/adminShop';
import { SHOP_PRODUCT_CATEGORIES, categoryLabel } from '@/lib/shopCategories';

export default function AdminShopProductsPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>(
    [...SHOP_PRODUCT_CATEGORIES]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'pet_food',
    stockQuantity: '50',
    isActive: true,
  });

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const r = await fetchAdminShopProducts(token);
      setProducts(r.products);
      setCategories(r.categories?.length ? r.categories : [...SHOP_PRODUCT_CATEGORIES]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
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

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'pet_food',
      stockQuantity: '50',
      isActive: true,
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError('');
    try {
      if (editingId) {
        await patchAdminProduct(token, editingId, {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          image: form.image,
          category: form.category,
          stockQuantity: Number(form.stockQuantity),
          isActive: form.isActive,
        });
      } else {
        await createAdminProduct(token, {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          image: form.image,
          category: form.category,
          stockQuantity: Number(form.stockQuantity),
          isActive: form.isActive,
        });
      }
      resetForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const startEdit = (p: AdminProduct) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      image: p.image,
      category: p.category,
      stockQuantity: String(p.stockQuantity),
      isActive: p.isActive,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <div className="container mx-auto max-w-6xl px-4 py-8 pt-28">
        <Link href="/dashboard/admin/shop" className="text-sm font-semibold text-[#ec6d13] hover:underline">
          ← Shop hub
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Product management</h1>

        <form onSubmit={submit} className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{editingId ? `Edit product #${editingId}` : 'New product'}</h2>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase text-gray-500">Name</span>
              <input
                required
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase text-gray-500">Description</span>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-gray-500">Price (USD)</span>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-gray-500">Stock quantity</span>
              <input
                required
                type="number"
                min="0"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.stockQuantity}
                onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-gray-500">Category</span>
              <select
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              <span className="text-sm text-gray-700">Active in catalog</span>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase text-gray-500">Image URL</span>
              <input
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-[#ec6d13] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f]"
            >
              {editingId ? 'Save changes' : 'Create product'}
            </button>
            {editingId ? (
              <button type="button" onClick={resetForm} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>

        <h2 className="mt-10 text-lg font-semibold text-gray-900">All products</h2>
        {loading ? (
          <div className="mt-6 flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-3 py-2 font-semibold">ID</th>
                  <th className="px-3 py-2 font-semibold">Name</th>
                  <th className="px-3 py-2 font-semibold">Category</th>
                  <th className="px-3 py-2 font-semibold">Price</th>
                  <th className="px-3 py-2 font-semibold">Stock</th>
                  <th className="px-3 py-2 font-semibold">Active</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-gray-600">{p.id}</td>
                    <td className="px-3 py-2 font-medium">{p.name}</td>
                    <td className="px-3 py-2">{categoryLabel(p.category)}</td>
                    <td className="px-3 py-2">${Number(p.price).toFixed(2)}</td>
                    <td className="px-3 py-2">{p.stockQuantity}</td>
                    <td className="px-3 py-2">{p.isActive ? 'yes' : 'no'}</td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" className="text-[#ec6d13] font-semibold mr-3" onClick={() => startEdit(p)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-red-600 font-semibold"
                        onClick={async () => {
                          if (!token || !confirm('Delete this product?')) return;
                          try {
                            await deleteAdminProduct(token, p.id);
                            load();
                          } catch (err) {
                            alert(err instanceof Error ? err.message : 'Delete failed');
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
