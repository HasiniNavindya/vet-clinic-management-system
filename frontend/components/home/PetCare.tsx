'use client';

import Image from 'next/image';

export default function PetCare() {
  const pets = [
    {
      id: 1,
      name: 'Cats',
      image: '/images/cat.jpg'
    },
    {
      id: 2,
      name: 'Dogs',
      image: '/images/Dog.jpg'
    },
     {
      id: 4,
      name: 'Rabbits',
      image: '/images/rabbit.jpg'
    },
    {
      id: 3,
      name: 'Birds',
      image: '/images/Parrot.jpg'
    }
   
 
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pets We Takecare
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Adipisci voluptatem ducimus vel sint molestiae sunt similalique sunt moda quia in quod sit esse ipsa quae et maxime sed minus.
          </p>
        </div>

        {/* Pet Icons Grid */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {pets.map((pet) => (
            <div key={pet.id} className="flex flex-col items-center group cursor-pointer">
              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300 mb-3">
                <Image
                  src={pet.image}
                  alt={pet.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-gray-700 font-medium group-hover:text-[#ec6d13] transition-colors duration-300">
                {pet.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
