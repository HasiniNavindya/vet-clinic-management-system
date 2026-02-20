'use client';

import React, { useState, useEffect } from 'react';

interface EditPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pet: {
    id: number;
    name: string;
    age: string;
    price: number;
    description: string;
    image: string;
    location: string;
    seller: string;
    contactNumber?: string;
  } | null;
}

export default function EditPetModal({ isOpen, onClose, onSuccess, pet }: EditPetModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    price: '',
    description: '',
    image: '',
    location: '',
    seller: '',
    contactNumber: '',
  });

  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name,
        age: pet.age,
        price: pet.price.toString(),
        description: pet.description,
        image: pet.image,
        location: pet.location,
        seller: pet.seller,
        contactNumber: pet.contactNumber || '',
      });
    }
  }, [pet]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pet) return;
    
    setLoading(true);
    setError(null);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/pets/${pet.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          age: formData.age,
          price: parseFloat(formData.price),
          description: formData.description,
          image: formData.image,
          location: formData.location,
          seller: formData.seller,
          contactNumber: formData.contactNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update pet');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error updating pet');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !pet) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        {/* Modal panel */}
        <div 
          className="relative inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white px-8 pt-8 pb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Edit Pet</h2>
                <p className="text-gray-600 mt-1">Update pet information</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Pet Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Golden Retriever Puppy"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="text"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 3 months"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price (LKR) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    placeholder="e.g., 100000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Describe the pet..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Colombo"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="seller" className="block text-sm font-medium text-gray-700 mb-2">
                    Seller Name *
                  </label>
                  <input
                    type="text"
                    id="seller"
                    name="seller"
                    value={formData.seller}
                    onChange={handleChange}
                    required
                    placeholder="e.g., John's Breeder"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  placeholder="e.g., +94 77 123 4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL *
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  required
                  placeholder="https://example.com/pet.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent"
                />
                {formData.image && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg border"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="bg-gray-50 px-8 py-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-[#ec6d13] text-white rounded-lg font-semibold hover:bg-[#d55a0a] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Updating...' : 'Update Pet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
