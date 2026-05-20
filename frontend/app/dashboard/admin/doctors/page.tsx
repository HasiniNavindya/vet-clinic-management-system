'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import { fetchClinicDoctors, type AdminClinicDoctor } from '@/lib/adminClinicDoctors';

function statusBadge(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'suspended':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-amber-100 text-amber-800';
    case 'rejected':
      return 'bg-gray-200 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export default function AdminDoctorsPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [doctors, setDoctors] = useState<AdminClinicDoctor[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const r = await fetchClinicDoctors(token);
      setDoctors(r.doctors);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=admin');
    if (!isLoading && isAuthenticated && !hasRole('admin')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, hasRole, router]);

  useEffect(() => {
    if (isAuthenticated && hasRole('admin') && token) load();
  }, [isAuthenticated, hasRole, token, load]);

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
      <div className="container mx-auto max-w-7xl px-4 py-8 pt-28">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/dashboard/admin" className="text-sm font-semibold text-[#ec6d13] hover:underline">
              ← Admin home
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Doctor profiles</h1>
            <p className="text-gray-600">
              Every veterinarian row shown to pet owners, whether or not a login is linked. Approve new vets under{' '}
              <Link href="/dashboard/admin/doctor-applications" className="font-semibold text-[#ec6d13] hover:underline">
                applications
              </Link>
              ; activate or suspend accounts under{' '}
              <Link href="/dashboard/admin/users" className="font-semibold text-[#ec6d13] hover:underline">
                users
              </Link>
              .
            </p>
          </div>
          <Link
            href="/dashboard/admin/doctors/new"
            className="inline-flex justify-center rounded-lg bg-[#ec6d13] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d65e0f]"
          >
            Add profile
          </Link>
        </div>

        {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Specialization</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Public email</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Linked account</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Appts</th>
                  <th className="px-4 py-3 font-semibold text-gray-700" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {doctors.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                    <td className="px-4 py-3 text-gray-700">{d.specialization}</td>
                    <td className="px-4 py-3 text-gray-600">{d.email || '—'}</td>
                    <td className="px-4 py-3">
                      {d.linkedUser ? (
                        <span className="flex flex-col gap-1">
                          <span className="text-gray-800">{d.linkedUser.email}</span>
                          <span
                            className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge(d.linkedUser.accountStatus)}`}
                          >
                            {d.linkedUser.accountStatus}
                          </span>
                          <Link
                            href={`/dashboard/admin/users/${d.linkedUser.id}`}
                            className="text-xs font-semibold text-[#ec6d13] hover:underline"
                          >
                            Manage user
                          </Link>
                        </span>
                      ) : (
                        <span className="text-gray-400">No login linked</span>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-gray-700">{d.appointmentsCount}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/admin/doctors/${d.id}`}
                        className="font-semibold text-[#ec6d13] hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
