'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  fetchReceptionistOwners,
  fetchReceptionistPets,
  type ReceptionistOwner,
  type ReceptionistPet,
} from '@/lib/receptionist';

type View = 'pets' | 'owners';

export default function ReceptionistPetsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const highlightId = Number(searchParams.get('highlight') || '') || null;
  const initialView: View =
    searchParams.get('view') === 'owners' || highlightId ? 'owners' : 'pets';

  const { token } = useAuth();
  const [view, setView] = useState<View>(initialView);
  const [pets, setPets] = useState<ReceptionistPet[]>([]);
  const [owners, setOwners] = useState<ReceptionistOwner[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (q?: string) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [petList, ownerList] = await Promise.all([
        fetchReceptionistPets(token, q),
        fetchReceptionistOwners(token, q),
      ]);
      setPets(petList);
      setOwners(ownerList);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setPets([]);
      setOwners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const switchView = (next: View) => {
    setView(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'owners') params.set('view', 'owners');
    else params.delete('view');
    const qs = params.toString();
    router.replace(`/dashboard/receptionist/pets${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  return (
    <div>
      <h1 className="font-sans text-2xl font-semibold tracking-tight text-gray-900">Pets</h1>
      <p className="mt-1 text-sm text-gray-600">
        Clinic pets and registered pet owners — search by pet, species, owner name, or email.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <ViewToggle active={view === 'pets'} onClick={() => switchView('pets')}>
          All pets ({pets.length})
        </ViewToggle>
        <ViewToggle active={view === 'owners'} onClick={() => switchView('owners')}>
          Pet owners ({owners.length})
        </ViewToggle>
      </div>

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
          placeholder={
            view === 'pets' ? 'Pet name or species…' : 'Owner name or email…'
          }
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f]"
        >
          Search
        </button>
      </form>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : view === 'pets' ? (
        <PetsTable pets={pets} />
      ) : (
        <OwnersTable owners={owners} highlightId={highlightId} />
      )}
    </div>
  );
}

function ViewToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-[#ec6d13] text-white'
          : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}

function PetsTable({ pets }: { pets: ReceptionistPet[] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b bg-gray-50 text-xs font-semibold uppercase text-gray-600">
          <tr>
            <th className="px-4 py-3">Pet</th>
            <th className="px-4 py-3">Species / breed</th>
            <th className="px-4 py-3">Owner</th>
            <th className="px-4 py-3">Contact</th>
          </tr>
        </thead>
        <tbody>
          {pets.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                No pets found.
              </td>
            </tr>
          ) : (
            pets.map((p) => (
              <tr key={p.id} className="border-b border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">{p.petName}</td>
                <td className="px-4 py-3 text-gray-600">
                  {p.species}
                  {p.breed ? ` · ${p.breed}` : ''}
                </td>
                <td className="px-4 py-3">{p.ownerName}</td>
                <td className="px-4 py-3 text-gray-600">
                  {p.ownerEmail}
                  {p.ownerPhone ? ` · ${p.ownerPhone}` : ''}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function OwnersTable({
  owners,
  highlightId,
}: {
  owners: ReceptionistOwner[];
  highlightId: number | null;
}) {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
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
                No pet owners found.
              </td>
            </tr>
          ) : (
            owners.map((o) => (
              <tr
                key={o.id}
                className={`border-b border-gray-100 ${
                  highlightId === o.id ? 'bg-orange-50 ring-1 ring-inset ring-[#ec6d13]/40' : ''
                }`}
              >
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
  );
}
