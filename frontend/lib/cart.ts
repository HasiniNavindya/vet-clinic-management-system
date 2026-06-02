import { API_BASE_URL } from './api';

export type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  type: 'product' | 'pet';
  quantity: number;
};

const CART_KEY = 'cart';

export function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? (JSON.parse(saved) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function cartItemCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function resolveCartImageUrl(image?: string | null): string {
  if (!image) return '/placeholder-product.png';
  if (image.startsWith('http')) return image;
  if (image.startsWith('/')) return `${API_BASE_URL}${image}`;
  return image;
}
