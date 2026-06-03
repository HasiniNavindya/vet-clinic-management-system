'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import ProductsSection from '@/components/marketplace/ProductsSection';
import PetsSection from '@/components/marketplace/PetsSection';
import AddProductModal from '@/components/marketplace/AddProductModal';
import AddPetModal from '@/components/marketplace/AddPetModal';
import OwnerPostPetAdModal from '@/components/marketplace/OwnerPostPetAdModal';
import type { ProductFilterCategory } from '@/lib/shopCategories';
import EditProductModal from '@/components/marketplace/EditProductModal';
import EditPetModal from '@/components/marketplace/EditPetModal';
import Cart from '@/components/marketplace/Cart';
import CheckoutModal from '@/components/marketplace/CheckoutModal';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL, authHeaders } from '@/lib/api';

type Tab = 'products' | 'pets';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  type: 'product' | 'pet';
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

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
}

export default function MarketplacePage() {
  const { user, hasRole, token } = useAuth();
  const isAdmin = hasRole('admin');
  const isPetOwner = hasRole('user');
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [activeCategory, setActiveCategory] = useState<ProductFilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1500 });
  const [sortBy, setSortBy] = useState('featured');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [showOwnerPetModal, setShowOwnerPetModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showEditPetModal, setShowEditPetModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setCartItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (item: { id: number; name: string; price: number; image: string; type: 'product' | 'pet' }) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.type === item.type);
      if (existing) {
        return prev.map(i => i.id === item.id && i.type === item.type ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setShowCart(true);
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const handleRemoveFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleProductSuccess = () => {
    alert('Product added successfully!');
    setRefreshKey(prev => prev + 1);
  };

  const handlePetSuccess = () => {
    alert('Pet listing saved.');
    setRefreshKey((prev) => prev + 1);
  };

  const handleOwnerPetSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditProductModal(true);
  };

  const handleEditPet = (pet: Pet) => {
    setSelectedPet(pet);
    setShowEditPetModal(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      alert('Product deleted successfully!');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      alert('Error deleting product');
    }
  };

  const handleDeletePet = async (id: number) => {
    if (!confirm('Are you sure you want to delete this pet?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/pets/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to delete pet');
      }

      alert('Pet deleted successfully!');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      alert('Error deleting pet');
    }
  };

  const handleProductUpdateSuccess = () => {
    alert('Product updated successfully!');
    setRefreshKey(prev => prev + 1);
  };

  const handlePetUpdateSuccess = () => {
    alert('Pet updated successfully!');
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=1920&q=80"
            alt="Marketplace background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-white mb-4 sm:mb-6">
              Pet Marketplace
            </h1>
            <p className="text-base sm:text-xl text-white/90 max-w-3xl mx-auto px-2">
              Find quality products and pets in one convenient place
            </p>
          </div>
        </div>
      </section>

      <MarketplaceHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {isAdmin && activeTab === 'products' && (
        <div className="py-4">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddProductModal(true)}
                className="px-4 py-2 text-sm font-semibold text-white transition-colors bg-[#ec6d13] rounded-lg hover:bg-[#d55a0a] sm:px-6 sm:text-base"
              >
                + Add shop product
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdmin && activeTab === 'pets' && (
        <div className="py-4">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddPetModal(true)}
                className="px-4 py-2 text-sm font-semibold text-[#ec6d13] transition-colors border border-[#ec6d13] rounded-lg hover:bg-orange-50 sm:px-6 sm:text-base"
              >
                + Add pet (instant publish)
              </button>
            </div>
          </div>
        </div>
      )}

      {isPetOwner && !isAdmin && activeTab === 'pets' && (
        <div className="pb-2 pt-1">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowOwnerPetModal(true)}
                className="px-5 py-2.5 text-sm font-semibold text-white transition-colors bg-[#ec6d13] rounded-lg hover:bg-[#d55a0a] sm:text-base"
              >
                + Post pet advertisement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart — products only (pet listings use contact owner flow) */}
      {activeTab === 'products' && (
        <div className="py-4">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowCart(true)}
                className="relative px-4 sm:px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Cart
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ec6d13] text-white text-xs rounded-full flex items-center justify-center">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pb-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            {activeTab === 'products' && (
              <ProductsSection
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                sortBy={sortBy}
                setSortBy={setSortBy}
                searchQuery={searchQuery}
                onEdit={isAdmin ? handleEditProduct : undefined}
                onDelete={isAdmin ? handleDeleteProduct : undefined}
                onAddToCart={handleAddToCart}
                refreshKey={refreshKey}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === 'pets' && (
              <PetsSection
                sortBy={sortBy}
                setSortBy={setSortBy}
                searchQuery={searchQuery}
                onEdit={isAdmin ? handleEditPet : undefined}
                onDelete={isAdmin ? handleDeletePet : undefined}
                refreshKey={refreshKey}
                isAdmin={isAdmin}
              />
            )}
        </div>
      </div>

      <Footer />

      {/* Modals */}
      <AddProductModal 
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSuccess={handleProductSuccess}
      />
      <AddPetModal
        isOpen={showAddPetModal}
        onClose={() => setShowAddPetModal(false)}
        onSuccess={handlePetSuccess}
      />
      <OwnerPostPetAdModal
        isOpen={showOwnerPetModal}
        onClose={() => setShowOwnerPetModal(false)}
        onSuccess={handleOwnerPetSuccess}
      />
      <EditProductModal 
        isOpen={showEditProductModal}
        onClose={() => setShowEditProductModal(false)}
        onSuccess={handleProductUpdateSuccess}
        product={selectedProduct}
      />
      <EditPetModal 
        isOpen={showEditPetModal}
        onClose={() => setShowEditPetModal(false)}
        onSuccess={handlePetUpdateSuccess}
        pet={selectedPet}
      />
      <Cart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onCheckout={() => {
          setShowCart(false);
          setShowCheckout(true);
        }}
      />
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        items={cartItems}
        total={cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)}
        onOrderPlaced={() => setCartItems([])}
      />
    </div>
  );
}
