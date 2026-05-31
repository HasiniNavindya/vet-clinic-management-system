'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchReceptionistOwners, type ReceptionistOwner } from '@/lib/receptionist';

export default function ReceptionistOwnersPage() {
  const { token } = useAuth();
  const [owners, setOwners] = useState<ReceptionistOwner[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (q?: string) => {
    if (!token) return;
    setLoading(true);
    try {
      setOwners(await fetchReceptionistOwners(token, q));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
      setOwners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  return (
    <div>
      <h1 className="text-gray-900">Pet owners</h1>
      <p className="mt-1 text-sm text-gray-600">Search by name or email</p>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          load(search);
        }}
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name or email…"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white"
        >
          Search
        </button>
      </form>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs font-semibold uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Pets</th>
              </tr>
            </thead>
            <tbody>
              {owners.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No owners found.
                  </td>
                </tr>
              ) : (
                owners.map((o) => (
                  <tr key={o.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{o.fullName}</td>
                    <td className="px-4 py-3">{o.email}</td>
                    <td className="px-4 py-3 text-gray-600">{o.mobileNumber || '—'}</td>
                    <td className="px-4 py-3">{o.petCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
