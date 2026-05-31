'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function ReceptionistProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-gray-900">My profile</h1>
      <p className="mt-1 text-sm text-gray-600">Reception desk account details</p>

      <dl className="mt-6 max-w-md space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div>
          <dt className="text-xs font-semibold uppercase text-gray-500">Full name</dt>
          <dd className="mt-1 text-gray-900">{user?.fullName || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase text-gray-500">Email</dt>
          <dd className="mt-1 text-gray-900">{user?.email || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase text-gray-500">Role</dt>
          <dd className="mt-1 capitalize text-gray-900">Receptionist</dd>
        </div>
        {user?.mobileNumber ? (
          <div>
            <dt className="text-xs font-semibold uppercase text-gray-500">Phone</dt>
            <dd className="mt-1 text-gray-900">{user.mobileNumber}</dd>
          </div>
        ) : null}
      </dl>

      <Link
        href="/dashboard/settings"
        className="mt-6 inline-block rounded-lg bg-[#ec6d13] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d65e0f]"
      >
        Edit profile & change password
      </Link>
    </div>
  );
}
