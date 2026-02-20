'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import ProductsSection from '@/components/marketplace/ProductsSection';
import PetsSection from '@/components/marketplace/PetsSection';

type Tab = 'products' | 'pets';
type Category = 'all' | 'food' | 'toys' | 'grooming' | 'health' | 'accessories';

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1500 });
  const [sortBy, setSortBy] = useState('featured');
  const [minOrder, setMinOrder] = useState(1);
  const [showReadyToShip, setShowReadyToShip] = useState(false);
  const [showPaidSamples, setShowPaidSamples] = useState(false);

  const clearAllFilters = () => {
    setShowReadyToShip(false);
    setShowPaidSamples(false);
    setPriceRange({ min: 0, max: 1500 });
    setMinOrder(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <MarketplaceHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Add buttons */}
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex gap-4">
          <Link href="/marketplace/add-product" className="px-6 py-2 bg-[#ec6d13] text-white rounded-lg font-semibold hover:bg-[#d55a0a] transition-colors">
            + Add Product
          </Link>
          <Link href="/marketplace/add-pet" className="px-6 py-2 bg-[#ec6d13] text-white rounded-lg font-semibold hover:bg-[#d55a0a] transition-colors">
            + Add Pet
          </Link>
        </div>
      </div>

      {activeTab === 'products' && (
        <ProductsSection
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showReadyToShip={showReadyToShip}
          setShowReadyToShip={setShowReadyToShip}
          showPaidSamples={showPaidSamples}
          setShowPaidSamples={setShowPaidSamples}
          minOrder={minOrder}
          setMinOrder={setMinOrder}
          clearAllFilters={clearAllFilters}
          searchQuery={searchQuery}
        />
      )}

      {activeTab === 'pets' && (
        <PetsSection
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
          searchQuery={searchQuery}
        />
      )}

      <Footer />
    </div>
  );
}