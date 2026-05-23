'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAdminMarketplaceListings,
  moderateMarketplaceListing,
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
}

export default function AdminMarketplaceModerationPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | ''>('pending');
  const [listings, setListings] = useState<MarketplaceListingModeration[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
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
      setPendingCount(r.pendingCount);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=admin');
    if (!isLoading && isAuthenticated && !hasRole('admin')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, hasRole, router]);

  useEffect(() => {
    if (isAuthenticated && hasRole('admin') && token) load();
  }, [isAuthenticated, hasRole, token, load]);

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

  if (isLoading || !isAuthenticated || !hasRole('admin')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto max-w-5xl px-4 py-8 pt-28">
        <Link href="/dashboard/admin" className="text-sm font-semibold text-[#ec6d13] hover:underline">
          ← Admin home
        </Link>
        <h1 className="mt-2 text-gray-900">Marketplace moderation</h1>
        <p className="text-gray-600">
          Pet owner advertisements require approval before they appear publicly. Pending queue:{' '}
          <strong>{pendingCount}</strong>
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(['pending', 'approved', 'rejected', ''] as const).map((s) => (
            <button
              key={s || 'all'}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                statusFilter === s ? 'bg-[#ec6d13] text-white' : 'border border-gray-300 bg-white text-gray-700'
              }`}
            >
              {s === '' ? 'All (excl. removed)' : s}
            </button>
          ))}
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <div className="mt-10 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {listings.map((L) => (
              <div key={L.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-gray-900">{L.name}</h3>
                      <StatusBadge s={L.listingStatus} />
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      ${L.price} · {L.location} · seller: {L.seller}
                    </p>
                    <p className="mt-2 text-sm text-gray-700 line-clamp-3">{L.description}</p>
                    {L.rejectionReason ? (
                      <p className="mt-2 text-sm text-red-700">Reason: {L.rejectionReason}</p>
                    ) : null}
                  </div>
                  {L.image ? (
                    <img src={L.image} alt="" className="h-24 w-24 rounded-lg object-cover border" />
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
                      Remove from marketplace
                    </button>
                  </div>
                ) : null}
                {rejectId === L.id ? (
                  <div className="mt-3 flex flex-wrap items-end gap-2">
                    <input
                      className="flex-1 min-w-[200px] rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Rejection reason (shown to owner)"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => act(L.id, 'reject')}
                      className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Confirm reject
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
            {listings.length === 0 && (
              <p className="text-center text-gray-500 py-12">No listings in this filter.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
