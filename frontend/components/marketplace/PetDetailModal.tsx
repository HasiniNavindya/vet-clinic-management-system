'use client';

import React, { useEffect } from 'react';

export interface MarketplacePet {
  id: number;
  name: string;
  age: string;
  price: number;
  description: string;
  image: string;
  location: string;
  seller: string;
  contactNumber?: string;
  createdAt?: string;
}

interface PetDetailModalProps {
  isOpen: boolean;
  pet: MarketplacePet | null;
  onClose: () => void;
}

export default function PetDetailModal({ isOpen, pet, onClose }: PetDetailModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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

  const phoneHref = pet.contactNumber
    ? `tel:${pet.contactNumber.replace(/\s/g, '')}`
    : undefined;

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

        <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden rounded-t-2xl bg-gray-100">
          <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
          <span className="absolute bottom-4 left-4 bg-[#ec6d13] text-white px-4 py-2 rounded-lg text-lg font-bold shadow-lg">
            ${Number(pet.price).toLocaleString()}
          </span>
        </div>

        <div className="p-5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#ec6d13] mb-2">
            Pet listing
          </p>
          <h2 className="text-gray-900 mb-4">{pet.name}</h2>

          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {pet.age}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {pet.location}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">About this pet</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{pet.description}</p>
          </div>

          <div className="rounded-xl border-2 border-[#ec6d13]/20 bg-orange-50/50 p-5">
            <h3 className="text-gray-900 mb-1 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#ec6d13]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Contact the owner
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This listing is posted by a pet owner. Reach out directly to ask questions or arrange a meeting.
            </p>

            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase">Owner / seller</dt>
                <dd className="text-gray-900 font-medium">{pet.seller || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase">Phone</dt>
                <dd>
                  {pet.contactNumber ? (
                    <a
                      href={phoneHref}
                      className="text-[#ec6d13] font-semibold hover:underline text-lg"
                    >
                      {pet.contactNumber}
                    </a>
                  ) : (
                    <span className="text-gray-500">Not provided</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase">Location</dt>
                <dd className="text-gray-900">{pet.location}</dd>
              </div>
            </dl>

            {phoneHref && (
              <a
                href={phoneHref}
                className="mt-5 flex items-center justify-center gap-2 w-full bg-[#ec6d13] text-white py-3 rounded-lg font-semibold hover:bg-[#d65e0f] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call owner
              </a>
            )}
          </div>

          <p className="mt-4 text-xs text-gray-500 text-center">
            Pet sales are arranged directly between buyers and owners. Products in the shop tab can still be purchased through the cart.
          </p>
        </div>
      </div>
    </div>
  );
}
