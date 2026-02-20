'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  contactNumber?: string;
  createdAt?: string;
}

interface PetsSectionProps {
  priceRange: { min: number; max: number };
  setPriceRange: (range: { min: number; max: number }) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  searchQuery: string;
  onEdit?: (pet: Pet) => void;
  onDelete?: (id: number) => void;
  onAddToCart?: (item: { id: number; name: string; price: number; image: string; type: 'pet' }) => void;
  refreshKey?: number;
}

export default function PetsSection({
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  searchQuery,
  onEdit,
  onDelete,
  onAddToCart,
  refreshKey
}: PetsSectionProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    fetch(`${apiBase}/pets`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load pets (${res.status})`);
        return res.json();
      })
      .then((data) => {
        setPets(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [refreshKey]);

  const filteredPets = useMemo(() => {
    const matches = pets.filter((pet) => {
      const matchesSearch =
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = pet.price >= priceRange.min && pet.price <= priceRange.max;
      return matchesSearch && matchesPrice;
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
  }, [pets, priceRange, searchQuery, sortBy]);

  return (
    <div className="flex gap-6">
      <FilterSidebar
        type="pets"
        priceRange={priceRange}
        setPriceRange={setPriceRange}
      />

      <div className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{filteredPets.length}</span> results found
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

            {loading && <div className="text-center py-12 text-gray-500">Loading pets...</div>}
            {error && <div className="text-center py-12 text-red-500">{error}</div>}

            {!loading && !error && (
              <>
                <div className="grid grid-cols-4 gap-4">
                  {filteredPets.map((pet) => (
                    <PetCard 
                      key={pet.id} 
                      {...pet} 
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onAddToCart={onAddToCart}
                    />
                  ))}
                </div>

                {filteredPets.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500">No pets found matching your filters.</p>
                  </div>
                )}
              </>
            )}

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
  );
}