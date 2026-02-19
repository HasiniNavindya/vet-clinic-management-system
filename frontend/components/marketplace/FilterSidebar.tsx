import React from 'react';

type Category = 'all' | 'food' | 'toys' | 'grooming' | 'health' | 'accessories';

interface FilterSidebarProps {
  type: 'products' | 'pets';
  activeCategory?: Category;
  setActiveCategory?: (category: Category) => void;
  priceRange: { min: number; max: number };
  setPriceRange: (range: { min: number; max: number }) => void;
  showReadyToShip?: boolean;
  setShowReadyToShip?: (value: boolean) => void;
  showPaidSamples?: boolean;
  setShowPaidSamples?: (value: boolean) => void;
  minOrder?: number;
  setMinOrder?: (value: number) => void;
}

const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'food', name: 'Food' },
  { id: 'toys', name: 'Toys' },
  { id: 'grooming', name: 'Grooming' },
  { id: 'health', name: 'Health' },
  { id: 'accessories', name: 'Accessories' }
];

export default function FilterSidebar({
  type,
  activeCategory,
  setActiveCategory,
  priceRange,
  setPriceRange,
  showReadyToShip,
  setShowReadyToShip,
  showPaidSamples,
  setShowPaidSamples,
  minOrder,
  setMinOrder
}: FilterSidebarProps) {
  return (
    <div className="w-64 shrink-0">
      <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-6">
        <h3 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-200">Filter</h3>
        
        {type === 'products' && (
          <>
            {/* Supplier Types */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Supplier Types</h4>
              <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 cursor-pointer hover:text-[#ec6d13]">
                <input
                  type="checkbox"
                  checked={showReadyToShip}
                  onChange={(e) => setShowReadyToShip?.(e.target.checked)}
                  className="w-4 h-4 text-[#ec6d13] border-gray-300 rounded focus:ring-[#ec6d13]"
                />
                Ready to ship
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-[#ec6d13]">
                <input
                  type="checkbox"
                  checked={showPaidSamples}
                  onChange={(e) => setShowPaidSamples?.(e.target.checked)}
                  className="w-4 h-4 text-[#ec6d13] border-gray-300 rounded focus:ring-[#ec6d13]"
                />
                Paid Samples
              </label>
            </div>

            {/* Product Types */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Product Types</h4>
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 text-sm text-gray-700 mb-2 cursor-pointer hover:text-[#ec6d13]">
                  <input
                    type="checkbox"
                    checked={activeCategory === category.id}
                    onChange={() => setActiveCategory?.(category.id as Category)}
                    className="w-4 h-4 text-[#ec6d13] border-gray-300 rounded focus:ring-[#ec6d13]"
                  />
                  {category.name}
                </label>
              ))}
            </div>

            {/* Condition */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Condition</h4>
              <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 cursor-pointer hover:text-[#ec6d13]">
                <input type="checkbox" className="w-4 h-4 text-[#ec6d13] border-gray-300 rounded focus:ring-[#ec6d13]" />
                New
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-[#ec6d13]">
                <input type="checkbox" className="w-4 h-4 text-[#ec6d13] border-gray-300 rounded focus:ring-[#ec6d13]" />
                Used
              </label>
            </div>

            {/* Min Order */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Min Order</h4>
              <input
                type="range"
                min="1"
                max="100"
                value={minOrder}
                onChange={(e) => setMinOrder?.(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ec6d13]"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>1</span>
                <span className="font-semibold text-[#ec6d13]">{minOrder}</span>
                <span>100</span>
              </div>
            </div>
          </>
        )}

        {/* Price */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-3">Price</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#ec6d13]"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#ec6d13]"
              />
            </div>
            <div className="flex gap-2 text-xs">
              <button onClick={() => setPriceRange({ min: 0, max: 500 })} className="flex-1 px-2 py-1.5 border border-gray-300 rounded hover:border-[#ec6d13] hover:text-[#ec6d13] transition-colors">
                Under $500
              </button>
              <button onClick={() => setPriceRange({ min: 500, max: 1000 })} className="flex-1 px-2 py-1.5 border border-gray-300 rounded hover:border-[#ec6d13] hover:text-[#ec6d13] transition-colors">
                $500-$1000
              </button>
            </div>
            <button onClick={() => setPriceRange({ min: 1000, max: 1500 })} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs hover:border-[#ec6d13] hover:text-[#ec6d13] transition-colors">
              $1000 - $1500
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
