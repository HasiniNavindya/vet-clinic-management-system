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
    <section className="pt-6 pb-4 bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Pet Marketplace</h1>
            <p className="text-sm text-gray-600">
              {activeTab === 'pets'
                ? 'Pet owner listings — contact sellers directly'
                : 'Shop pet care products'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all text-sm ${
                activeTab === 'products'
                  ? 'bg-[#ec6d13] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('pets')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all text-sm ${
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
        <div className="flex flex-col sm:block relative w-full max-w-2xl gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products or pets..."
            className="w-full px-4 py-2.5 pl-10 sm:pr-24 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent"
          />
          <svg className="absolute left-4 top-3 sm:top-1/2 sm:-translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button
            type="button"
            className="w-full sm:w-auto sm:absolute sm:right-2 sm:top-1/2 sm:-translate-y-1/2 px-5 py-2 bg-[#ec6d13] text-white rounded-md font-semibold hover:bg-[#d65e0f] transition-colors text-sm"
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
}
