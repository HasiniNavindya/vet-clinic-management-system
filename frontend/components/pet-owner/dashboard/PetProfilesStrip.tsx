'use client';

import type { OwnerPet } from '@/components/pet-owner/PetDetailModal';
import { API_BASE_URL } from '@/lib/api';

function petImageUrl(imagePath?: string | null): string | null {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/')) return `${API_BASE_URL}${imagePath}`;
  return imagePath;
}

type Props = {
  pets: OwnerPet[];
  onView: (pet: OwnerPet) => void;
  onEdit: (pet: OwnerPet) => void;
  onAdd: () => void;
  className?: string;
};

export default function PetProfilesStrip({ pets, onView, onEdit, onAdd, className = '' }: Props) {
  return (
    <div className={className}>
      <div className="flex gap-6 overflow-x-auto pb-1 sm:gap-8 sm:justify-end">
        {pets.map((pet) => {
          const img = petImageUrl(pet.image_url);
          return (
            <div key={pet.id} className="flex w-24 shrink-0 flex-col items-center">
              {img ? (
                <img
                  src={img}
                  alt={pet.pet_name}
                  className="h-20 w-20 rounded-full border-2 border-gray-100 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-100 bg-[#ec6d13] text-2xl font-bold text-white shadow-sm">
                  {pet.pet_name?.charAt(0) || '?'}
                </div>
              )}
              <p className="mt-2 max-w-[6rem] truncate text-center text-sm font-semibold text-gray-900">
                {pet.pet_name}
              </p>
              <div className="mt-1 flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => onView(pet)}
                  className="font-medium text-gray-600 hover:text-gray-900"
                >
                  View
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => onEdit(pet)}
                  className="font-medium text-[#ec6d13] hover:text-[#d65e0f]"
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={onAdd}
          className="flex w-24 shrink-0 flex-col items-center"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition hover:border-[#ec6d13] hover:bg-orange-50 hover:text-[#ec6d13]">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </span>
          <p className="mt-2 text-sm font-semibold text-gray-700">Add new</p>
        </button>
      </div>
    </div>
  );
}
