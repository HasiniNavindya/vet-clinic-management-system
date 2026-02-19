import React from 'react';

type Tab = 'products' | 'pets';

interface MarketplaceHeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function MarketplaceHeader({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery
}: MarketplaceHeaderProps) {
  return (
    <section className="pt-32 pb-6 bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pet Marketplace</h1>
            <p className="text-gray-600">Find quality products and pets</p>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                activeTab === 'products'
                  ? 'bg-[#ec6d13] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('pets')}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                activeTab === 'pets'
                  ? 'bg-[#ec6d13] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pets
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products or pets..."
            className="w-full px-5 py-3 pl-12 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent"
          />
          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-5 py-2 bg-[#ec6d13] text-white rounded-md font-semibold hover:bg-[#d65e0f] transition-colors">
            Search
          </button>
        </div>
      </div>
    </section>
  );
}
