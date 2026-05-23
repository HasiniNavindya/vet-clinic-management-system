'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createPetListing } from '@/lib/marketplaceListings';

interface OwnerPostPetAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function OwnerPostPetAdModal({ isOpen, onClose, onSuccess }: OwnerPostPetAdModalProps) {
  const router = useRouter();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    price: '',
    description: '',
    image: '',
    location: '',
    seller: user?.fullName || '',
    contactNumber: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      router.push('/login?redirect=/marketplace');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await createPetListing(token, {
        name: formData.name,
        age: formData.age,
        price: parseFloat(formData.price),
        description: formData.description,
        image: formData.image,
        location: formData.location,
        seller: formData.seller || user?.fullName || '',
        contactNumber: formData.contactNumber,
      });
      alert(res.message || 'Submitted for admin approval.');
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-screen items-center justify-center px-4">
        <div
          className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b px-6 py-4">
            <h2 className="text-gray-900">Post a pet advertisement</h2>
            <p className="mt-1 text-sm text-amber-800 bg-amber-50 rounded-lg px-3 py-2 mt-2">
              Listings are hidden until a clinic administrator approves them.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4 max-h-[60vh] overflow-y-auto">
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <input
              name="name"
              required
              placeholder="Pet name *"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                name="price"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="Price (USD) *"
                value={formData.price}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <textarea
              name="description"
              required
              rows={3}
              placeholder="Description *"
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              name="image"
              placeholder="Image URL"
              value={formData.image}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              name="contactNumber"
              placeholder="Contact phone"
              value={formData.contactNumber}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </form>
          <div className="flex gap-3 border-t bg-gray-50 px-6 py-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="flex-1 rounded-lg bg-[#ec6d13] py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? 'Submitting…' : 'Submit for approval'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
