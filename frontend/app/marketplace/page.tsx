'use client';

import React, { useState } from 'react';
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

  // Product Data
  const products = [
    {
      id: 1,
      name: 'Premium Dog Food',
      description: 'High-quality nutrition for your dog',
      price: 25.99,
      image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&q=80',
      category: 'food'
    },
    {
      id: 2,
      name: 'Interactive Cat Toy',
      description: 'Keeps your cat entertained for hours',
      price: 12.50,
      image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400&q=80',
      category: 'toys'
    },
    {
      id: 3,
      name: 'Gentle Pet Shampoo',
      description: 'Mild and soothing for your pet\'s coat',
      price: 15.00,
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80',
      category: 'grooming'
    },
    {
      id: 4,
      name: 'Flea and Tick Treatment',
      description: 'Effective protection against fleas and ticks',
      price: 35.20,
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80',
      category: 'health'
    },
    {
      id: 5,
      name: 'Stylish Pet Collar',
      description: 'Fashionable and comfortable for your pet',
      price: 18.99,
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&q=80',
      category: 'accessories'
    },
    {
      id: 6,
      name: 'Cozy Pet Bed',
      description: 'Soft and warm for a good night\'s sleep',
      price: 45.00,
      image: 'https://images.unsplash.com/photo-1615789591457-74a63395c990?w=400&q=80',
      category: 'accessories'
    },
    {
      id: 7,
      name: 'Nutritious Bird Seed',
      description: 'Balanced diet for your feathered friend',
      price: 10.50,
      image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&q=80',
      category: 'food'
    },
    {
      id: 8,
      name: 'Durable Hamster Wheel',
      description: 'Provides exercise and fun for hamsters',
      price: 8.00,
      image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&q=80',
      category: 'toys'
    }
  ];

  // Pet Ads Data
  const petAds = [
    {
      id: 1,
      name: 'Golden Retriever Puppy',
      age: '3 months',
      price: 800,
      description: 'Adorable and playful golden retriever puppy, vaccinated and health checked',
      image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&q=80',
      location: 'New York, NY',
      seller: 'John Breeder'
    },
    {
      id: 2,
      name: 'Persian Cat',
      age: '1 year',
      price: 500,
      description: 'Beautiful white Persian cat, very friendly and litter trained',
      image: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400&q=80',
      location: 'Los Angeles, CA',
      seller: 'Sarah\'s Cattery'
    },
    {
      id: 3,
      name: 'Labrador Retriever',
      age: '6 months',
      price: 650,
      description: 'Energetic and loving lab puppy, great with kids',
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80',
      location: 'Chicago, IL',
      seller: 'Mike\'s Kennels'
    },
    {
      id: 4,
      name: 'Siamese Kitten',
      age: '2 months',
      price: 400,
      description: 'Stunning blue-eyed Siamese kitten, playful and affectionate',
      image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400&q=80',
      location: 'Houston, TX',
      seller: 'Cat Paradise'
    },
    {
      id: 5,
      name: 'Pomeranian Puppy',
      age: '4 months',
      price: 1200,
      description: 'Fluffy and adorable Pomeranian, perfect companion',
      image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80',
      location: 'Miami, FL',
      seller: 'Tiny Paws'
    },
    {
      id: 6,
      name: 'British Shorthair',
      age: '8 months',
      price: 750,
      description: 'Gentle and calm British Shorthair, excellent temperament',
      image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80',
      location: 'Boston, MA',
      seller: 'Elite Cats'
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
    return matchesCategory && matchesSearch && matchesPrice;
  });

  const filteredPets = petAds.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pet.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = pet.price >= priceRange.min && pet.price <= priceRange.max;
    return matchesSearch && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <MarketplaceHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {activeTab === 'products' && (
        <ProductsSection
          products={filteredProducts}
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
        />
      )}

      {activeTab === 'pets' && (
        <PetsSection
          pets={filteredPets}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      )}

      <Footer />
    </div>
  );
}
