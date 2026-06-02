'use client';

import type { ReactNode } from 'react';
import PetAvatar from '@/components/pet-owner/PetAvatar';

export type HealthPet = {
  id: number;
  pet_name: string;
  image_url?: string | null;
};

type Props = {
  pets: HealthPet[];
  value: number | '';
  onChange: (petId: number | '') => void;
  showAll?: boolean;
};

export default function PetHealthPicker({ pets, value, onChange, showAll = true }: Props) {
  if (pets.length === 0) {
    return (
      <p className="mb-6 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-600">
        Add a pet from your dashboard home page to view health records here.
      </p>
    );
  }

  return (
    <div className="mb-6">
      <p className="mb-3 text-sm font-medium text-gray-700">Your pets</p>
      <div className="flex flex-wrap gap-2">
        {showAll ? (
          <PetChip
            active={value === ''}
            label="All pets"
            onClick={() => onChange('')}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
              All
            </span>
          </PetChip>
        ) : null}
        {pets.map((pet) => (
          <PetChip
            key={pet.id}
            active={value === pet.id}
            label={pet.pet_name}
            onClick={() => onChange(pet.id)}
          >
            <PetAvatar name={pet.pet_name} imageUrl={pet.image_url} size="md" />
          </PetChip>
        ))}
      </div>
    </div>
  );
}

function PetChip({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-[5.5rem] flex-col items-center gap-2 rounded-xl border px-3 py-2.5 text-center transition ${
        active
          ? 'border-[#ec6d13] bg-orange-50/80 shadow-sm'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
      }`}
    >
      {children}
      <span
        className={`max-w-[5.5rem] truncate text-xs font-semibold ${
          active ? 'text-[#ec6d13]' : 'text-gray-700'
        }`}
      >
        {label}
      </span>
    </button>
  );
}
