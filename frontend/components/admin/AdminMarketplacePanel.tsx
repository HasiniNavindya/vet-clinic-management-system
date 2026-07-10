'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAdminMarketplaceListings,
  moderateMarketplaceListing,
  resolveListingImageUrl,
  type MarketplaceListingModeration,
} from '@/lib/marketplaceListings';

function StatusBadge({ s }: { s: string }) {
  const tone =
    s === 'approved'
      ? 'bg-green-100 text-green-800'
      : s === 'pending_approval'
        ? 'bg-amber-100 text-amber-900'
        : s === 'rejected'
          ? 'bg-red-100 text-red-800'
          : 'bg-gray-200 text-gray-800';
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${tone}`}>
      {s.replace(/_/g, ' ')}
    </span>
  );
};

type Props = {
  onPendingCount?: (count: number) => void;
};

export default function AdminMarketplacePanel({ onPendingCount }: Props) {
  const { token } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | ''>('pending');
  const [listings, setListings] = useState<MarketplaceListingModeration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const r = await fetchAdminMarketplaceListings(token, statusFilter);
      setListings(r.listings);
      if (statusFilter === 'pending') onPendingCount?.(r.pendingCount);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  const act = async (id: number, action: 'approve' | 'reject' | 'remove') => {
    if (!token) return;
    const reason = action === 'reject' ? rejectReason.trim() : undefined;
    if (action === 'reject' && !reason) {
      alert('Enter a short reason for rejection');
      return;
    }
    try {
      await moderateMarketplaceListing(token, id, { action, rejectionReason: reason });
      setRejectId(null);
      setRejectReason('');
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <section className="space-y-4">
      <p className="text-sm text-gray-600">
        Pet-owner advertisements require approval before they appear on the public marketplace.
      </p>

      <div className="flex flex-wrap gap-2">
        {(['pending', 'approved', 'rejected', ''] as const).map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${
              statusFilter === s
                ? 'bg-[#ec6d13] text-white shadow-sm'
                : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-[#ec6d13]/30'
            }`}
          >
            {s === '' ? 'All (excl. removed)' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
          <p className="font-medium text-gray-800">No listings in this filter</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((L) => {
            const img = resolveListingImageUrl(L.image);
            return (
              <div key={L.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{L.name}</h3>
                      <StatusBadge s={L.listingStatus} />
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      ${L.price} · {L.location} · {L.seller}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm text-gray-700">{L.description}</p>
                    {L.rejectionReason ? (
                      <p className="mt-2 text-sm text-red-700">Reason: {L.rejectionReason}</p>
                    ) : null}
                  </div>
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className="h-24 w-24 shrink-0 rounded-lg border object-cover" />
                  ) : null}
                </div>
                {L.listingStatus === 'pending_approval' || L.listingStatus === 'approved' ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => act(L.id, 'approve')}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectId(rejectId === L.id ? null : L.id)}
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => act(L.id, 'remove')}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
                {rejectId === L.id ? (
                  <div className="mt-3 flex flex-wrap items-end gap-2">
                    <input
                      className="min-w-[200px] flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder="Rejection reason (shown to owner)"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => act(L.id, 'reject')}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Confirm reject
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
