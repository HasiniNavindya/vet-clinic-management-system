import React from 'react';

type Category = 'all' | 'food' | 'toys' | 'grooming' | 'health' | 'accessories';

interface FilterSidebarProps {
  type: 'products' | 'pets';
  activeCategory?: Category;
  setActiveCategory?: (category: Category) => void;
  priceRange: { min: number; max: number };
  setPriceRange: (range: { min: number; max: number }) => void;
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
  setPriceRange
}: FilterSidebarProps) {
  return (
    <div className="w-64 shrink-0">
      <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-6">
        <h3 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-200">Filter</h3>
        
        {type === 'products' && (
          <>
            {/* Product Types */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Product Types</h4>
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 text-sm text-gray-700 mb-2 cursor-pointer hover:text-[#ec6d13]">
                  <input
                    type="radio"
                    name="category"
                    checked={activeCategory === category.id}
                    onChange={() => setActiveCategory?.(category.id as Category)}
                    className="w-4 h-4 text-[#ec6d13] border-gray-300 focus:ring-[#ec6d13]"
                  />
                  {category.name}
                </label>
              ))}
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
