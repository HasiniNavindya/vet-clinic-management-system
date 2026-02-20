'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import ProductsSection from '@/components/marketplace/ProductsSection';
import PetsSection from '@/components/marketplace/PetsSection';
import AddProductModal from '@/components/marketplace/AddProductModal';
import AddPetModal from '@/components/marketplace/AddPetModal';
import EditProductModal from '@/components/marketplace/EditProductModal';
import EditPetModal from '@/components/marketplace/EditPetModal';
import Cart from '@/components/marketplace/Cart';
import CheckoutModal from '@/components/marketplace/CheckoutModal';
import { useAuth } from '@/context/AuthContext';

type Tab = 'products' | 'pets';
type Category = 'all' | 'food' | 'toys' | 'grooming' | 'health' | 'accessories';

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
  const { user } = useAuth();
  // Allow admin access when not logged in (temporary) OR when logged in as admin
  // Restrict edit/delete for regular logged-in users
  const isAdmin = !user || user?.role === 'admin';
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1500 });
  const [sortBy, setSortBy] = useState('featured');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
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
    alert('Pet added successfully!');
    setRefreshKey(prev => prev + 1);
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
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/products/${id}`, {
        method: 'DELETE',
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
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/pets/${id}`, {
        method: 'DELETE',
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

      <MarketplaceHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Add buttons - Only visible for admins */}
      {isAdmin && (
        <div className="py-4">
          <div className="max-w-[1600px] mx-auto px-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowAddProductModal(true)}
                  className="px-6 py-2 bg-[#ec6d13] text-white rounded-lg font-semibold hover:bg-[#d55a0a] transition-colors"
                >
                  + Add Product
                </button>
                <button 
                  onClick={() => setShowAddPetModal(true)}
                  className="px-6 py-2 bg-[#ec6d13] text-white rounded-lg font-semibold hover:bg-[#d55a0a] transition-colors"
                >
                  + Add Pet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart button - Always visible */}
      <div className="py-4">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex justify-end">
            <button 
              onClick={() => setShowCart(true)}
              className="relative px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
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

      <div className="pb-8">
        <div className="max-w-[1400px] mx-auto px-6">
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
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                sortBy={sortBy}
                setSortBy={setSortBy}
                searchQuery={searchQuery}
                onEdit={isAdmin ? handleEditPet : undefined}
                onDelete={isAdmin ? handleDeletePet : undefined}
                onAddToCart={handleAddToCart}
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
      />
    </div>
  );
}
