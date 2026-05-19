'use client';

import React, { useEffect } from 'react';

export interface OwnerPet {
  id: number;
  pet_name: string;
  species: string;
  breed: string;
  age_or_dob: string;
  gender: string;
  vaccination_status: string;
  created_at?: string;
}

interface PetDetailModalProps {
  isOpen: boolean;
  pet: OwnerPet | null;
  onClose: () => void;
}

export default function PetDetailModal({ isOpen, pet, onClose }: PetDetailModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !pet) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
          aria-label="Close"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#ec6d13] mb-2">My pet profile</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{pet.pet_name}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Species</p>
              <p className="text-gray-900 font-medium">{pet.species || 'Not provided'}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Breed</p>
              <p className="text-gray-900 font-medium">{pet.breed || 'Not provided'}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Gender</p>
              <p className="text-gray-900 font-medium">{pet.gender || 'Not provided'}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Age / Birth date</p>
              <p className="text-gray-900 font-medium">{pet.age_or_dob || 'Not provided'}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 sm:col-span-2">
              <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Vaccination status</p>
              <p className="text-gray-900 font-medium">{pet.vaccination_status || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}