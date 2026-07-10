'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchAdminUsers, type AdminUserListItem } from '@/lib/adminUsers';
import {
  ReceptionistApplication,
  approveReceptionistApplication,
  fetchReceptionistApplications,
  rejectReceptionistApplication,
} from '@/lib/receptionistApplications';
import AdminPageTabs, { useAdminTab } from '@/components/admin/AdminPageTabs';

function statusBadge(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'suspended':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function appStatusClass(status: string) {
  if (status === 'pending') return 'border-l-amber-400 bg-amber-50/40';
  if (status === 'approved') return 'border-l-green-500 bg-green-50/30';
  return 'border-l-red-400 bg-red-50/30';
}

type HubProps = {
  embedded?: boolean;
  tabParam?: string;
};

function ReceptionHubInner({ embedded, tabParam = 'tab' }: HubProps) {
  const { token } = useAuth();
  const { active } = useAdminTab('team', ['team', 'applications'], tabParam);

  const [team, setTeam] = useState<AdminUserListItem[]>([]);
  const [applications, setApplications] = useState<ReceptionistApplication[]>([]);
  const [appFilter, setAppFilter] = useState('pending');
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState('');
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [selected, setSelected] = useState<ReceptionistApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [acting, setActing] = useState(false);

  const loadTeam = useCallback(async () => {
    if (!token) return;
    setLoadingTeam(true);
    setError('');
    try {
      const res = await fetchAdminUsers(token, { role: 'receptionist', limit: 200, page: 1 });
      setTeam(res.users);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load team');
    } finally {
      setLoadingTeam(false);
    }
  }, [token]);

  const loadApplications = useCallback(async () => {
    if (!token) return;
    setLoadingApps(true);
    setError('');
    const statusParam = appFilter === 'all' ? undefined : appFilter || undefined;
    try {
      const list = await fetchReceptionistApplications(token, statusParam);
      setApplications(list);
      if (appFilter === 'pending') setPendingCount(list.length);
      else {
        const pending = await fetchReceptionistApplications(token, 'pending');
        setPendingCount(pending.length);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load applications');
    } finally {
      setLoadingApps(false);
    }
  }, [token, appFilter]);

  useEffect(() => {
    if (token) loadTeam();
  }, [token, loadTeam]);

  useEffect(() => {
    if (token) {
      fetchReceptionistApplications(token, 'pending')
        .then((list) => setPendingCount(list.length))
        .catch(() => {});
    }
  }, [token]);

  useEffect(() => {
    if (token && active === 'applications') loadApplications();
  }, [token, active, loadApplications]);

  const handleApprove = async () => {
    if (!token || !selected) return;
    setActing(true);
    setError('');
    try {
      await approveReceptionistApplication(token, selected.id, adminNotes || undefined);
      setSelected(null);
      setAdminNotes('');
      await loadApplications();
      await loadTeam();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approval failed');
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!token || !selected || !rejectReason.trim()) {
      setError('Rejection reason is required');
      return;
    }
    setActing(true);
    setError('');
    try {
      await rejectReceptionistApplication(
        token,
        selected.id,
        rejectReason.trim(),
        adminNotes || undefined
      );
      setSelected(null);
      setRejectReason('');
      setAdminNotes('');
      await loadApplications();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Rejection failed');
    } finally {
      setActing(false);
    }
  };

  const tabs = [
    { id: 'team', label: 'Reception team' },
    { id: 'applications', label: 'Applications', badge: pendingCount },
  ];

  const activeCount = team.filter((u) => u.accountStatus === 'active').length;

  return (
    <div className="space-y-6">
      {!embedded ? (
        <div className="rounded-2xl border border-[#ec6d13]/15 bg-gradient-to-br from-orange-50 via-white to-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#ec6d13]">Staff · Front desk</p>
          <h1 className="mt-1 font-sans text-2xl font-bold text-gray-900">Reception</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Front-desk accounts manage appointments, billing, and clinic operations. New applicants must be
            approved before they can sign in.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200">
              {activeCount} active · {team.length} total
            </span>
            {pendingCount > 0 ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
                {pendingCount} pending application{pendingCount === 1 ? '' : 's'}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <AdminPageTabs tabs={tabs} defaultTab="team" param={tabParam} />

      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {active === 'team' ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Suspend or change roles from a user&apos;s detail page in{' '}
              <Link href="/dashboard/admin/users?role=receptionist" className="font-semibold text-[#ec6d13] hover:underline">
                all users
              </Link>
              .
            </p>
          </div>

          {loadingTeam ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
            </div>
          ) : team.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
              <p className="font-medium text-gray-800">No receptionist accounts yet</p>
              <p className="mt-1 text-sm text-gray-500">
                Approved applications will appear here automatically.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {team.map((u) => (
                <li
                  key={u.id}
                  className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-[#ec6d13]/25 hover:shadow-md"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{u.fullName}</p>
                    <p className="text-sm text-gray-600">{u.email}</p>
                    {u.mobileNumber ? (
                      <p className="mt-1 text-xs text-gray-500">{u.mobileNumber}</p>
                    ) : null}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadge(u.accountStatus)}`}
                    >
                      {u.accountStatus}
                    </span>
                    <Link
                      href={`/dashboard/admin/users/${u.id}`}
                      className="text-sm font-semibold text-[#ec6d13] hover:underline"
                    >
                      Manage →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-sm text-gray-600">
            <span className="font-semibold text-gray-800">Permissions.</span> Receptionists use the{' '}
            <code className="rounded bg-gray-200 px-1 text-xs">receptionist</code> role. Access is enforced on
            each API route by role identity.
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <p className="text-sm text-gray-600">
            Review registration requests before applicants receive login access.
          </p>
          <div className="flex flex-wrap gap-2">
            {['pending', 'approved', 'rejected', 'all'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setAppFilter(s)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${
                  appFilter === s
                    ? 'bg-[#ec6d13] text-white shadow-sm'
                    : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-[#ec6d13]/30'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {loadingApps ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
              <p className="font-medium text-gray-800">No applications in this view</p>
              <p className="mt-1 text-sm text-gray-500">Try another filter or check back later.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {applications.map((app) => (
                <li
                  key={app.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(app)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(app);
                    }
                  }}
                  className={`cursor-pointer rounded-xl border border-gray-100 border-l-4 p-4 shadow-sm transition hover:shadow-md ${appStatusClass(app.status)}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{app.applicant.fullName}</p>
                      <p className="text-sm text-gray-600">{app.applicant.email}</p>
                    </div>
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold uppercase text-gray-700 ring-1 ring-gray-200">
                      {app.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">{selected.applicant.fullName}</h2>
            <p className="text-sm text-gray-600">{selected.applicant.email}</p>
            {selected.applicant.mobileNumber ? (
              <p className="mt-2 text-sm text-gray-600">Phone: {selected.applicant.mobileNumber}</p>
            ) : null}
            {selected.applicant.address ? (
              <p className="text-sm text-gray-600">Address: {selected.applicant.address}</p>
            ) : null}

            <label className="mt-4 block text-sm font-semibold text-gray-900">Admin notes</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />

            {selected.status === 'pending' ? (
              <>
                <label className="mt-4 block text-sm font-semibold text-gray-900">
                  Rejection reason (required to reject)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={acting}
                    onClick={handleApprove}
                    className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={acting || !rejectReason.trim()}
                    onClick={handleReject}
                    className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="mt-6 rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700"
              >
                Close
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminReceptionHub(props: HubProps) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
        </div>
      }
    >
      <ReceptionHubInner {...props} />
    </Suspense>
  );
}
