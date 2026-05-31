'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL, authHeaders } from '@/lib/api';
import type { OwnerPet } from './PetDetailModal';

interface EditPetModalProps {
  isOpen: boolean;
  pet: OwnerPet | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditPetModal({ isOpen, pet, onClose, onSuccess }: EditPetModalProps) {
  const { token } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    pet_name: '',
    species: '',
    breed: '',
    age_or_dob: '',
    gender: '',
    vaccination_status: '',
    weight_kg: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (pet) {
      setFormData({
        pet_name: pet.pet_name || '',
        species: pet.species || '',
        breed: pet.breed || '',
        age_or_dob: pet.age_or_dob || '',
        gender: pet.gender || '',
        vaccination_status: pet.vaccination_status || '',
        weight_kg: (pet as { weight_kg?: number }).weight_kg?.toString() || '',
      });
    }
  }, [pet]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pet) return;

    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/pets/${pet.id}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update pet');
      }

      // upload image if provided
      if (imageFile) {
        try {
          await uploadPetImage(token || '', pet.id, imageFile);
        } catch (err) {
          console.warn('Image upload failed', err);
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update pet');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !pet) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#ec6d13] mb-2">Edit pet profile</p>
              <h2 className="text-gray-900">{pet.pet_name}</h2>
            </div>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Name</label>
              <input value={formData.pet_name} onChange={(e) => setFormData({ ...formData, pet_name: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#ec6d13]" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Species</label>
                <input value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#ec6d13]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Breed</label>
                <input value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#ec6d13]" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Age / Birth date</label>
                <input value={formData.age_or_dob} onChange={(e) => setFormData({ ...formData, age_or_dob: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#ec6d13]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <input value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#ec6d13]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#ec6d13]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Vaccination Status</label>
              <input value={formData.vaccination_status} onChange={(e) => setFormData({ ...formData, vaccination_status: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#ec6d13]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Photo</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={isSaving} className="flex-1 rounded-lg bg-[#ec6d13] px-4 py-3 font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50">{isSaving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

async function uploadPetImage(token: string, petId: number, file: File) {
  const reader = await new Promise<ArrayBuffer | null>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as ArrayBuffer);
    r.onerror = () => reject(new Error('Failed reading file'));
    r.readAsArrayBuffer(file);
  });

  if (!reader) return;
  const uint8 = new Uint8Array(reader);
  let binary = '';
  for (let i = 0; i < uint8.byteLength; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  const base64 = btoa(binary);

  await fetch(`${API_BASE_URL}/api/pets/${petId}/image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ imageBase64: base64, filename: file.name }),
  });
}