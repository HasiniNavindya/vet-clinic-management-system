'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import {
  fetchAdminUserActivity,
  fetchAdminUserDetail,
  patchAdminUser,
  type ActivityItem,
  type AdminUserDetailResponse,
} from '@/lib/adminUsers';
import { FALLBACK_ROLES } from '@/lib/roles';

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);
  const { user: currentUser, token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [detail, setDetail] = useState<AdminUserDetailResponse | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [roleDraft, setRoleDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=admin');
    if (!isLoading && isAuthenticated && !hasRole('admin')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, hasRole, router]);

  const load = useCallback(async () => {
    if (!token || !Number.isFinite(userId)) return;
    setLoading(true);
    setError('');
    try {
      const [d, a] = await Promise.all([
        fetchAdminUserDetail(token, userId),
        fetchAdminUserActivity(token, userId),
      ]);
      setDetail(d);
      setRoleDraft(d.user.role);
      setActivity(a.activity);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveRole = async () => {
    if (!token || !detail) return;
    setActing(true);
    setError('');
    try {
      await patchAdminUser(token, userId, { role: roleDraft });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setActing(false);
    }
  };

  const setStatus = async (accountStatus: string) => {
    if (!token) return;
    setActing(true);
    setError('');
    try {
      await patchAdminUser(token, userId, { accountStatus });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setActing(false);
    }
  };

  if (!Number.isFinite(userId)) {
    return (
      <div className="p-8">
        <p>Invalid user</p>
      </div>
    );
  }

  const isSelf = currentUser?.id === userId;
  const du = detail?.user;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-8 pt-28">
        <Link
          href="/dashboard/admin/users"
          className="text-sm font-semibold text-[#ec6d13] hover:underline"
        >
          ← All users
        </Link>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
          </div>
        ) : error && !detail ? (
          <p className="mt-8 text-red-600">{error}</p>
        ) : du ? (
          <>
            <h1 className="mt-4 text-gray-900">{du.fullName}</h1>
            <p className="text-gray-600">{du.email}</p>

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-gray-900">Account</h3>
                <dl className="mt-4 space-y-2 text-sm text-gray-700">
                  <div>
                    <dt className="font-semibold text-gray-900">User ID</dt>
                    <dd className="font-mono">{du.id}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900">Status</dt>
                    <dd>{du.accountStatus}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900">Phone</dt>
                    <dd>{du.mobileNumber || '—'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900">Address</dt>
                    <dd>{du.address || '—'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-900">Created</dt>
                    <dd>{du.createdAt ? new Date(du.createdAt).toLocaleString() : '—'}</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-gray-900">Role assignment</h3>
                <p className="mt-2 text-xs text-gray-500">
                  Assign clinic role. Demoting an approved doctor unlinks their public doctor profile until
                  re-linked.
                </p>
                <select
                  value={roleDraft}
                  onChange={(e) => setRoleDraft(e.target.value)}
                  disabled={acting || isSelf}
                  className="mt-4 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-100"
                >
                  {FALLBACK_ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={acting || roleDraft === du.role || isSelf}
                  onClick={saveRole}
                  className="mt-3 rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
                >
                  Save role
                </button>
                {isSelf && (
                  <p className="mt-2 text-xs text-amber-700">
                    Edit your own role from another admin account when more than one admin exists.
                  </p>
                )}
              </section>
            </div>

            <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-gray-900">Suspend / unblock</h3>
              <p className="mt-1 text-sm text-gray-600">
                Suspended users cannot log in or use the API until reactivated.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={acting || isSelf || du.accountStatus === 'suspended'}
                  onClick={() => setStatus('suspended')}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Suspend account
                </button>
                <button
                  type="button"
                  disabled={acting || du.accountStatus === 'active'}
                  onClick={() => setStatus('active')}
                  className="rounded-lg border border-green-600 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50"
                >
                  Set active
                </button>
              </div>
            </section>

            {detail?.summary ? (
              <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-gray-900">Summary</h3>
                <ul className="mt-3 list-inside list-disc text-sm text-gray-700">
                  {typeof detail.summary.petCount === 'number' ? (
                    <li>Pets registered: {detail.summary.petCount}</li>
                  ) : null}
                  {typeof detail.summary.appointmentCountAsOwner === 'number' ? (
                    <li>Appointments (as pet owner): {detail.summary.appointmentCountAsOwner}</li>
                  ) : null}
                  {typeof detail.summary.appointmentCountAsDoctor === 'number' ? (
                    <li>Appointments (as veterinarian): {detail.summary.appointmentCountAsDoctor}</li>
                  ) : null}
                  {detail.summary.doctorProfile ? (
                    <li>
                      Clinic profile: Dr. {detail.summary.doctorProfile.name} (
                      {detail.summary.doctorProfile.specialization})
                    </li>
                  ) : null}
                  {detail.doctorApplication ? (
                    <li>
                      Vet application: {detail.doctorApplication.status} —{' '}
                      {detail.doctorApplication.specialization}
                    </li>
                  ) : null}
                  {!detail.summary.doctorProfile &&
                  !detail.doctorApplication &&
                  du.role !== 'user' &&
                  typeof detail.summary.petCount !== 'number' ? (
                    <li className="list-none text-gray-500">No extra metadata for this user type.</li>
                  ) : null}
                </ul>
              </section>
            ) : null}

            <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-gray-900">Recent activity</h3>
              <p className="text-xs text-gray-500">
                Appointments, payments, and notifications (last records on file).
              </p>
              {activity.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">No activity rows found.</p>
              ) : (
                <ul className="mt-4 divide-y divide-gray-100">
                  {activity.map((row, idx) => (
                    <li key={`${row.kind}-${idx}`} className="py-3 text-sm">
                      <p className="font-semibold text-gray-900">{row.summary}</p>
                      <p className="text-xs text-gray-500">
                        {row.kind.replace(/_/g, ' ')}
                        {row.meta ? ` · ${row.meta}` : ''}
                        {row.occurredAt ? ` · ${new Date(row.occurredAt).toLocaleString()}` : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
