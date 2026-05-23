'use client';

import { useState } from 'react';

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

export default function AddPetModal({ isOpen, onClose, onSuccess, token }: AddPetModalProps) {
  const [formData, setFormData] = useState({
    pet_name: '',
    species: '',
    breed: '',
    age_or_dob: '',
    gender: '',
    vaccination_status: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/pets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newPet = await response.json();
        // if image selected, upload it
        if (imageFile) {
          try {
            await uploadPetImage(token, newPet.id, imageFile);
          } catch (err) {
            console.warn('Image upload failed', err);
          }
        }
        onSuccess();
        onClose();
        setFormData({
          pet_name: '',
          species: '',
          breed: '',
          age_or_dob: '',
          gender: '',
          vaccination_status: ''
        });
        setImageFile(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add pet');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-gray-900">Add New Pet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pet Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.pet_name}
              onChange={(e) => setFormData({ ...formData, pet_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent"
              placeholder="Enter pet name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Species</label>
              <select
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Rabbit">Rabbit</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Breed</label>
            <input
              type="text"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent"
              placeholder="Enter breed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
            <input
              type="text"
              value={formData.age_or_dob}
              onChange={(e) => setFormData({ ...formData, age_or_dob: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent"
              placeholder="e.g. 2 years"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Vaccination Status</label>
            <select
              value={formData.vaccination_status}
              onChange={(e) => setFormData({ ...formData, vaccination_status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:border-transparent"
            >
              <option value="">Select status</option>
              <option value="Up to date">Up to date</option>
              <option value="Due soon">Due soon</option>
              <option value="Overdue">Overdue</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-[#ec6d13] text-white rounded-lg font-semibold hover:bg-[#d65e0f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Pet'}
            </button>
          </div>
        </form>
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

    await fetch(`http://localhost:5000/api/pets/${petId}/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ imageBase64: base64, filename: file.name }),
    });
  }
