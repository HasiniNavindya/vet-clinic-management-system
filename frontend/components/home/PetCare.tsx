'use client';

import Image from 'next/image';

const PETS = [
  {
    id: 1,
    name: 'Dogs',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80',
  },
  {
    id: 2,
    name: 'Cats',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80',
  },
  {
    id: 3,
    name: 'Birds',
    image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&q=80',
  },
  {
    id: 4,
    name: 'Rabbits',
    image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&q=80',
  },
];

export default function PetCare() {
  return (
    <section className="bg-white pt-14 pb-8 md:pt-16 md:pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-gray-900">Pets We Take Care Of</h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            From dogs and cats to birds and rabbits — compassionate care for every companion.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14 lg:gap-16">
          {PETS.map((pet) => (
            <div
              key={pet.id}
              className="group flex cursor-pointer flex-col items-center"
            >
              <div className="relative mb-4 h-28 w-28 overflow-hidden rounded-full shadow-lg transition-all duration-300 ease-out will-change-transform group-hover:-translate-y-4 group-hover:scale-110 group-hover:shadow-2xl md:h-32 md:w-32 lg:h-36 lg:w-36">
                <Image
                  src={pet.image}
                  alt={pet.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 112px, 144px"
                />
                <div className="pointer-events-none absolute inset-0 rounded-full ring-4 ring-transparent transition group-hover:ring-[#ec6d13]/30" />
              </div>
              <span className="font-medium text-gray-700 transition-all duration-300 group-hover:-translate-y-1 group-hover:text-[#ec6d13]">
                {pet.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
