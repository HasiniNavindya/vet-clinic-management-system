import React from 'react';
import FilterSidebar from './FilterSidebar';
import PetCard from './PetCard';

interface Pet {
  id: number;
  name: string;
  age: string;
  price: number;
  description: string;
  image: string;
  location: string;
  seller: string;
}

interface PetsSectionProps {
  pets: Pet[];
  priceRange: { min: number; max: number };
  setPriceRange: (range: { min: number; max: number }) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
}

export default function PetsSection({
  pets,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy
}: PetsSectionProps) {
  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex gap-6">
          {/* Sidebar Filter */}
          <FilterSidebar
            type="pets"
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{pets.length}</span> results found
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
            </div>

            {/* Pets Grid */}
            <div className="grid grid-cols-4 gap-4">
              {pets.map((pet) => (
                <PetCard key={pet.id} {...pet} />
              ))}
            </div>

            {pets.length === 0 && (
              <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">No pets found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
