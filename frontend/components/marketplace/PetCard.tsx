import React from 'react';

interface PetCardProps {
  id: number;
  name: string;
  age: string;
  price: number;
  description: string;
  image: string;
  location: string;
  seller: string;
}

export default function PetCard({ name, age, price, image, location }: PetCardProps) {
  return (
    <div className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover"
        />
        <span className="absolute top-2 left-2 bg-[#ec6d13] text-white px-2.5 py-1 rounded text-sm font-bold">
          ${price}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-2">
          {name}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {age}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location}
          </span>
        </div>
        <div className="flex items-center gap-1 mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-600 font-medium">4.8</span>
        </div>
        <button className="w-full py-2 bg-[#ec6d13] text-white text-sm font-semibold rounded hover:bg-[#d65a0a] transition-colors">
          Contact Seller
        </button>
      </div>
    </div>
  );
}
