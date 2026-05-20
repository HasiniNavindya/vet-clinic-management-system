/** Mirrors backend/config/shop.js for UI labels and filters */
export const SHOP_PRODUCT_CATEGORIES = [
  { id: 'pet_food', label: 'Pet food' },
  { id: 'toys', label: 'Toys' },
  { id: 'medicines', label: 'Medicines' },
  { id: 'accessories', label: 'Accessories' },
] as const;

export type ShopCategoryId = (typeof SHOP_PRODUCT_CATEGORIES)[number]['id'];

/** Matches backend/config/shop.js LEGACY_CATEGORY_MAP */
export const LEGACY_CATEGORY_MAP: Record<string, ShopCategoryId> = {
  food: 'pet_food',
  pet_food: 'pet_food',
  toys: 'toys',
  medicines: 'medicines',
  health: 'medicines',
  accessories: 'accessories',
  grooming: 'accessories',
};

export function categoryLabel(id: string): string {
  return SHOP_PRODUCT_CATEGORIES.find((c) => c.id === id)?.label || id;
}

/** Map legacy marketplace filter keys to API ids */
export type ProductFilterCategory = 'all' | ShopCategoryId;

export const PRODUCT_FILTER_OPTIONS: { id: ProductFilterCategory; name: string }[] = [
  { id: 'all', name: 'All products' },
  ...SHOP_PRODUCT_CATEGORIES.map((c) => ({ id: c.id, name: c.label })),
];
