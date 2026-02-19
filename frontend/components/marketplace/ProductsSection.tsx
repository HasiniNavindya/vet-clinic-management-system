import React from 'react';
import FilterSidebar from './FilterSidebar';
import ProductCard from './ProductCard';

type Category = 'all' | 'food' | 'toys' | 'grooming' | 'health' | 'accessories';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface ProductsSectionProps {
  products: Product[];
  activeCategory: Category;
  setActiveCategory: (category: Category) => void;
  priceRange: { min: number; max: number };
  setPriceRange: (range: { min: number; max: number }) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  showReadyToShip: boolean;
  setShowReadyToShip: (value: boolean) => void;
  showPaidSamples: boolean;
  setShowPaidSamples: (value: boolean) => void;
  minOrder: number;
  setMinOrder: (value: number) => void;
  clearAllFilters: () => void;
}

export default function ProductsSection({
  products,
  activeCategory,
  setActiveCategory,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  showReadyToShip,
  setShowReadyToShip,
  showPaidSamples,
  setShowPaidSamples,
  minOrder,
  setMinOrder,
  clearAllFilters
}: ProductsSectionProps) {
  const activeFilters = [
    showReadyToShip && { key: 'readyToShip', label: 'Ready to ship', action: () => setShowReadyToShip(false) },
    showPaidSamples && { key: 'paidSamples', label: 'Paid Samples', action: () => setShowPaidSamples(false) },
    priceRange.min > 0 && { key: 'priceMin', label: `Min: $${priceRange.min}`, action: () => setPriceRange({ ...priceRange, min: 0 }) },
    priceRange.max < 1500 && { key: 'priceMax', label: `Max: $${priceRange.max}`, action: () => setPriceRange({ ...priceRange, max: 1500 }) },
    minOrder > 1 && { key: 'minOrder', label: `Min Order: ${minOrder}`, action: () => setMinOrder(1) },
  ].filter(Boolean) as { key: string; label: string; action: () => void }[];

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex gap-6">
          {/* Sidebar Filter */}
          <FilterSidebar
            type="products"
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            showReadyToShip={showReadyToShip}
            setShowReadyToShip={setShowReadyToShip}
            showPaidSamples={showPaidSamples}
            setShowPaidSamples={setShowPaidSamples}
            minOrder={minOrder}
            setMinOrder={setMinOrder}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{products.length}</span> results found
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#ec6d13]"
                  >
                    <option value="featured">Best Match</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>

              {/* Active Filters */}
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
                  <button onClick={clearAllFilters} className="text-sm text-[#ec6d13] hover:underline font-medium">
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">No products found matching your filters.</p>
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-12">
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
      </div>
    </section>
  );
}
