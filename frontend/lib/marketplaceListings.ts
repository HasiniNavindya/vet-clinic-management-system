import { API_BASE_URL, authHeaders } from './api';

async function parseJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid response');
  }
}

export interface PetListing {
  id: number;
  name: string;
  age: string;
  price: number;
  description: string;
  image: string;
  location: string;
  seller: string;
  contactNumber?: string;
  listingStatus: string;
  rejectionReason?: string | null;
  createdAt?: string;
}

export function resolveListingImageUrl(image?: string | null): string | null {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  if (image.startsWith('/')) return `${API_BASE_URL}${image}`;
  return image;
}

export function listingStatusLabel(status: string): string {
  return status.replace(/_/g, ' ');
}

export async function createPetListing(
  token: string,
  body: {
    name: string;
    age?: string;
    price: number;
    description?: string;
    image?: string;
    location?: string;
    seller?: string;
    contactNumber?: string;
  }
): Promise<{ listing: PetListing; message?: string }> {
  const res = await fetch(`${API_BASE_URL}/api/marketplace/pet-listings`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Submit failed');
  return data as { listing: PetListing; message?: string };
}

export async function fetchMyPetListings(token: string): Promise<{ listings: PetListing[] }> {
  const res = await fetch(`${API_BASE_URL}/api/marketplace/pet-listings/mine`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed');
  return data as { listings: PetListing[] };
}

export async function updatePetListing(
  token: string,
  id: number,
  body: Partial<{
    name: string;
    age: string;
    price: number;
    description: string;
    image: string;
    location: string;
    seller: string;
    contactNumber: string;
  }>
): Promise<{ listing: PetListing; message?: string }> {
  const res = await fetch(`${API_BASE_URL}/api/marketplace/pet-listings/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Update failed');
  return data as { listing: PetListing; message?: string };
}

export async function deletePetListing(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/marketplace/pet-listings/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Delete failed');
}

export interface MarketplaceListingModeration {
  id: number;
  name: string;
  age: string;
  price: number;
  description: string;
  image: string;
  location: string;
  seller: string;
  contactNumber?: string;
  ownerUserId?: number | null;
  listingStatus: string;
  rejectionReason?: string | null;
  moderatedAt?: string | null;
  moderatedBy?: number | null;
  createdAt?: string;
}

export async function fetchAdminMarketplaceListings(
  token: string,
  status?: 'pending' | 'approved' | 'rejected' | ''
): Promise<{ listings: MarketplaceListingModeration[]; pendingCount: number }> {
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`${API_BASE_URL}/api/admin/marketplace/listings${q}`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed');
  return data as { listings: MarketplaceListingModeration[]; pendingCount: number };
}

export async function moderateMarketplaceListing(
  token: string,
  id: number,
  body: { action: 'approve' | 'reject' | 'remove'; rejectionReason?: string }
): Promise<{ listing: MarketplaceListingModeration }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/marketplace/listings/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Action failed');
  return data as { listing: MarketplaceListingModeration };
}
