'use client';

import React, { useEffect, useMemo, useState } from 'react';
import FilterSidebar from './FilterSidebar';
import ProductCard from './ProductCard';
import type { ProductFilterCategory } from '@/lib/shopCategories';
import { LEGACY_CATEGORY_MAP, categoryLabel } from '@/lib/shopCategories';

function matchesCategory(productCategory: string, filter: ProductFilterCategory): boolean {
  if (filter === 'all') return true;
  const c = String(productCategory || '').toLowerCase().trim();
  if (c === filter) return true;
  const mapped = LEGACY_CATEGORY_MAP[c];
  return mapped === filter;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stockQuantity?: number;
  createdAt?: string;
}

interface ProductsSectionProps {
  activeCategory: ProductFilterCategory;
  setActiveCategory: (category: ProductFilterCategory) => void;
  priceRange: { min: number; max: number };
  setPriceRange: (range: { min: number; max: number }) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  searchQuery: string;
  onEdit?: (product: Product) => void;
  onDelete?: (id: number) => void;
  onAddToCart?: (item: { id: number; name: string; price: number; image: string; type: 'product' }) => void;
  refreshKey?: number;
  isAdmin?: boolean;
}

export default function ProductsSection({
  activeCategory,
  setActiveCategory,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  searchQuery,
  onEdit,
  onDelete,
  onAddToCart,
  refreshKey,
  isAdmin = false
}: ProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    fetch(`${apiBase}/products`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [refreshKey]);

  const filteredProducts = useMemo(() => {
    const matches = products.filter((product) => {
      const matchesCat = matchesCategory(product.category, activeCategory);
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      return matchesCat && matchesSearch && matchesPrice;
    });

    if (sortBy === 'priceLow') return [...matches].sort((a, b) => a.price - b.price);
    if (sortBy === 'priceHigh') return [...matches].sort((a, b) => b.price - a.price);
    if (sortBy === 'newest') {
      return [...matches].sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
        return bDate - aDate;
      });
    }
    return matches;
  }, [products, activeCategory, searchQuery, priceRange, sortBy]);

  const activeFilters = [
    activeCategory !== 'all' && {
      key: 'category',
      label: categoryLabel(activeCategory),
      action: () => setActiveCategory('all'),
    },
    priceRange.min > 0 && { key: 'priceMin', label: `Min: $${priceRange.min}`, action: () => setPriceRange({ ...priceRange, min: 0 }) },
    priceRange.max < 1500 && { key: 'priceMax', label: `Max: $${priceRange.max}`, action: () => setPriceRange({ ...priceRange, max: 1500 }) },
  ].filter(Boolean) as { key: string; label: string; action: () => void }[];

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      <button
        type="button"
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        className="lg:hidden flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-[#ec6d13] hover:text-[#ec6d13] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block`}>
        <FilterSidebar
          type="products"
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
        />
      </div>

      <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{filteredProducts.length}</span> results found
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 shrink-0">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#ec6d13]"
                  >
                    <option value="featured">Best Match</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>

              {activeFilters.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {activeFilters.map((filter) => (
                    <span key={filter.key} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-sm text-gray-700 rounded">
                      {filter.label}
                      <button onClick={filter.action} className="hover:text-[#ec6d13]">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  <button 
                    onClick={() => {
                      setActiveCategory('all');
                      setPriceRange({ min: 0, max: 1500 });
                    }} 
                    className="text-sm text-[#ec6d13] hover:underline font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {loading && <div className="text-center py-12 text-gray-500">Loading products...</div>}
            {error && <div className="text-center py-12 text-red-500">{error}</div>}

            {!loading && !error && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      {...product} 
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onAddToCart={onAddToCart}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500">No products found matching your filters.</p>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-center items-center gap-1 sm:gap-2 mt-12 overflow-x-auto pb-2">
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                &lt;
              </button>
              <button className="px-4 py-2 rounded-lg bg-[#ec6d13] text-white font-semibold">
                1
              </button>
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                2
              </button>
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                3
              </button>
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                4
              </button>
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                5
              </button>
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                &gt;
              </button>
            </div>
          </div>
        </div>
  );
}