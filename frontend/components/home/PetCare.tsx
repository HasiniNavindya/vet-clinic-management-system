 'use client';

import Image from 'next/image';
import SectionHeader from '@/components/home/SectionHeader';

const PETS = [
  { name: 'Dogs', src: '/images/Dog.jpg' },
  { name: 'Cats', src: '/images/cat.jpg' },
  { name: 'Rabbits', src: '/images/rabbit.jpg' },
  { name: 'Parrots', src: '/images/Parrot.jpg' },
];

export default function PetCare() {
  return (
    <section className="relative z-10 bg-white pt-10 pb-6 sm:pt-12 sm:pb-8 md:pt-14 md:pb-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <SectionHeader
          title="Pets We Take Care Of"
          subtitle="From dogs and cats to birds and rabbits - compassionate care for every companion."
        />

        <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-4 sm:mt-6 sm:gap-x-6 sm:gap-y-5">
          {PETS.map((pet) => (
            <div
              key={pet.name}
              className="group flex w-24 flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 sm:w-28"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-[0_10px_24px_rgba(15,23,42,0.12)] ring-1 ring-gray-200/80 sm:h-20 sm:w-20">
                <Image
                  src={pet.src}
                  alt={pet.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 16vw, (max-width: 1024px) 12vw, 80px"
                />
              </div>
              <p className="mt-2 text-[10px] font-semibold tracking-wide text-gray-900 sm:text-xs">
                {pet.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
