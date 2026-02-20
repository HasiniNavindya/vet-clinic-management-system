import React from 'react';

interface ProductCardProps {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  onEdit?: (product: ProductCardProps) => void;
  onDelete?: (id: number) => void;
  onAddToCart?: (item: { id: number; name: string; price: number; image: string; type: 'product' }) => void;
}

export default function ProductCard({ id, name, description, price, image, category, onEdit, onDelete, onAddToCart }: ProductCardProps) {
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
        {/* Edit and Delete buttons */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={() => onEdit?.({ id, name, description, price, image, category })}
            className="w-8 h-8 bg-blue-500 rounded text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete?.(id)}
            className="w-8 h-8 bg-red-500 rounded text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 min-h-10">
          {name}
        </h3>
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
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Sold 18</span>
          <button 
            onClick={() => onAddToCart?.({ id, name, price, image, type: 'product' })}
            className="w-8 h-8 bg-[#ec6d13] rounded text-white flex items-center justify-center hover:bg-[#d65a0a] transition-colors"
            title="Add to Cart"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
