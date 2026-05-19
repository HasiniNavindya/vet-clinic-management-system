'use client';

import React, { useEffect, useMemo, useState } from 'react';
import PetCard from './PetCard';
import PetDetailModal, { type MarketplacePet } from './PetDetailModal';

interface PetsSectionProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  searchQuery: string;
  onEdit?: (pet: MarketplacePet) => void;
  onDelete?: (id: number) => void;
  refreshKey?: number;
  isAdmin?: boolean;
}

export default function PetsSection({
  sortBy,
  setSortBy,
  searchQuery,
  onEdit,
  onDelete,
  refreshKey,
  isAdmin = false,
}: PetsSectionProps) {
  const [pets, setPets] = useState<MarketplacePet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPet, setSelectedPet] = useState<MarketplacePet | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

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
      const q = searchQuery.toLowerCase();
      return (
        pet.name.toLowerCase().includes(q) ||
        pet.description.toLowerCase().includes(q) ||
        pet.location.toLowerCase().includes(q) ||
        pet.seller.toLowerCase().includes(q)
      );
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
  }, [pets, searchQuery, sortBy]);

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5">
        <p className="text-sm text-gray-600 mb-3 pb-3 border-b border-gray-100">
          Pet owners can list pets here for buyers to discover. Open <strong>View Details</strong> to see the full description and contact the owner directly.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{filteredPets.length}</span> listings found
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
      </div>

      {loading && <div className="text-center py-12 text-gray-500">Loading pets...</div>}
      {error && <div className="text-center py-12 text-red-500">{error}</div>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPets.map((pet) => (
              <PetCard
                key={pet.id}
                {...pet}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewDetails={(p) => {
                  setSelectedPet(p);
                  setDetailOpen(true);
                }}
                isAdmin={isAdmin}
              />
            ))}
          </div>

          {filteredPets.length === 0 && (
            <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500">No pets found matching your search.</p>
            </div>
          )}
        </>
      )}

      <PetDetailModal
        isOpen={detailOpen}
        pet={selectedPet}
        onClose={() => {
          setDetailOpen(false);
          setSelectedPet(null);
        }}
      />
    </div>
  );
}
