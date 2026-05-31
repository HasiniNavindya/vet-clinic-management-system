'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import { useAuth } from '@/context/AuthContext';
import { fetchMyPetListings, type PetListing } from '@/lib/marketplaceListings';

export default function PetOwnerListingsPage() {
  const { token } = useAuth();
  const [listings, setListings] = useState<PetListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    if (!token) return;
    setLoading(true);
    fetchMyPetListings(token)
      .then((d) => setListings(d.listings))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [token]);

  return (
    <PetOwnerShell>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My pet listings</h1>
            <p className="mt-1 text-sm text-gray-600">Marketplace ads pending admin approval</p>
          </div>
          <Link
            href="/marketplace"
            className="rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white"
          >
            Post new ad
          </Link>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        {loading ? (
          <div className="mt-8 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
          </div>
        ) : listings.length === 0 ? (
          <p className="mt-6 text-gray-500">You have not posted any marketplace ads yet.</p>
        ) : (
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {listings.map((l) => (
              <li key={l.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="font-semibold text-gray-900">{l.name}</p>
                <p className="text-sm text-gray-600">${l.price}</p>
                <p className="mt-2 text-xs capitalize font-semibold text-[#ec6d13]">
                  {l.listingStatus.replace(/_/g, ' ')}
                </p>
                {l.rejectionReason ? (
                  <p className="mt-1 text-xs text-red-600">{l.rejectionReason}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </PetOwnerShell>
  );
}
