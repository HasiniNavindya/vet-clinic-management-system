'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/api';
import { fetchClinicDoctors, deleteClinicDoctor, type AdminClinicDoctor } from '@/lib/adminClinicDoctors';
import {
  DoctorApplication,
  approveDoctorApplication,
  fetchDoctorApplications,
  rejectDoctorApplication,
} from '@/lib/doctorApplications';
import AdminPageTabs, { useAdminTab } from '@/components/admin/AdminPageTabs';

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

function appStatusClass(status: string) {
  if (status === 'pending') return 'border-l-amber-400 bg-amber-50/40';
  if (status === 'approved') return 'border-l-green-500 bg-green-50/30';
  return 'border-l-red-400 bg-red-50/30';
}

type HubProps = {
  embedded?: boolean;
  tabParam?: string;
};

function VeterinariansHubInner({ embedded, tabParam = 'tab' }: HubProps) {
  const { token } = useAuth();
  const { active } = useAdminTab('profiles', ['profiles', 'applications'], tabParam);

  const [doctors, setDoctors] = useState<AdminClinicDoctor[]>([]);
  const [applications, setApplications] = useState<DoctorApplication[]>([]);
  const [appFilter, setAppFilter] = useState('pending');
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState('');
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<DoctorApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [acting, setActing] = useState(false);

  const loadProfiles = useCallback(async () => {
    if (!token) return;
    setLoadingProfiles(true);
    setError('');
    try {
      const r = await fetchClinicDoctors(token);
      setDoctors(r.doctors);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profiles');
    } finally {
      setLoadingProfiles(false);
    }
  }, [token]);

  const loadApplications = useCallback(async () => {
    if (!token) return;
    setLoadingApps(true);
    setError('');
    try {
      const list = await fetchDoctorApplications(token, appFilter || undefined);
      setApplications(list);
      if (appFilter === 'pending') setPendingCount(list.length);
      else {
        const pending = await fetchDoctorApplications(token, 'pending');
        setPendingCount(pending.length);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load applications');
    } finally {
      setLoadingApps(false);
    }
  }, [token, appFilter]);

  useEffect(() => {
    if (token) loadProfiles();
  }, [token, loadProfiles]);

  useEffect(() => {
    if (token) {
      fetchDoctorApplications(token, 'pending')
        .then((list) => setPendingCount(list.length))
        .catch(() => {});
    }
  }, [token]);

  useEffect(() => {
    if (token && active === 'applications') loadApplications();
  }, [token, active, loadApplications]);

  const handleDelete = async (d: AdminClinicDoctor) => {
    if (!token) return;
    if (
      !confirm(
        `Delete "${d.name}"?${d.appointmentsCount > 0 ? ` This profile has ${d.appointmentsCount} appointment(s) and cannot be removed until they are cleared.` : ' This cannot be undone.'}`
      )
    ) {
      return;
    }
    setDeletingId(d.id);
    try {
      const result = await deleteClinicDoctor(token, d.id);
      await loadProfiles();
      alert(result.message);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleApprove = async () => {
    if (!token || !selected) return;
    setActing(true);
    setError('');
    try {
      await approveDoctorApplication(token, selected.id, adminNotes || undefined);
      setSelected(null);
      setAdminNotes('');
      await loadApplications();
      await loadProfiles();
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
      await rejectDoctorApplication(token, selected.id, rejectReason.trim(), adminNotes || undefined);
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
    { id: 'profiles', label: 'Clinic profiles' },
    { id: 'applications', label: 'Applications', badge: pendingCount },
  ];

  return (
    <div className="space-y-6">
      {!embedded ? (
        <div className="rounded-2xl border border-[#ec6d13]/15 bg-gradient-to-br from-orange-50 via-white to-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#ec6d13]">Staff · Clinical</p>
          <h1 className="mt-1 font-sans text-2xl font-bold text-gray-900">Veterinarians</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Manage public doctor profiles shown to pet owners and review registration applications before
            vets can sign in.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200">
              {doctors.length} profile{doctors.length === 1 ? '' : 's'}
            </span>
            {pendingCount > 0 ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
                {pendingCount} pending application{pendingCount === 1 ? '' : 's'}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <AdminPageTabs tabs={tabs} defaultTab="profiles" param={tabParam} />

      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {active === 'profiles' ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Profiles appear in booking flows whether or not a login is linked.
            </p>
            <Link
              href="/dashboard/admin/doctors/new"
              className="inline-flex rounded-lg bg-[#ec6d13] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d65e0f]"
            >
              Add profile
            </Link>
          </div>

          {loadingProfiles ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50/80">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Specialization</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Linked account</th>
                    <th className="px-4 py-3 font-semibold text-gray-700">Appts</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {doctors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                        No profiles yet. Add one manually or approve an application.
                      </td>
                    </tr>
                  ) : null}
                  {doctors.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{d.name}</p>
                        <p className="text-xs text-gray-500">{d.email || 'No public email'}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{d.specialization}</td>
                      <td className="px-4 py-3">
                        {d.linkedUser ? (
                          <span className="flex flex-col gap-1">
                            <span className="text-gray-800">{d.linkedUser.email}</span>
                            <span
                              className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge(d.linkedUser.accountStatus)}`}
                            >
                              {d.linkedUser.accountStatus}
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-400">No login</span>
                        )}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-gray-700">{d.appointmentsCount}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-3">
                          <Link
                            href={`/dashboard/admin/doctors/${d.id}`}
                            className="font-semibold text-[#ec6d13] hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            disabled={deletingId === d.id}
                            onClick={() => handleDelete(d)}
                            className="font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {deletingId === d.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-4">
          <p className="text-sm text-gray-600">
            Review licenses and credentials before approving veterinarian access.
          </p>
          <div className="flex flex-wrap gap-2">
            {['pending', 'approved', 'rejected', ''].map((s) => (
              <button
                key={s || 'all'}
                type="button"
                onClick={() => setAppFilter(s)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${
                  appFilter === s
                    ? 'bg-[#ec6d13] text-white shadow-sm'
                    : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-[#ec6d13]/30'
                }`}
              >
                {s === '' ? 'All' : s}
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
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 border-l-4 p-4 shadow-sm ${appStatusClass(app.status)}`}
                >
                  <div>
                    <p className="font-semibold text-gray-900">{app.applicant.fullName}</p>
                    <p className="text-sm text-gray-600">
                      {app.specialization} · {app.applicant.email}
                    </p>
                    <p className="text-xs text-gray-500">License {app.licenseNumber}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold uppercase text-gray-700 ring-1 ring-gray-200">
                      {app.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(app);
                        setRejectReason('');
                        setAdminNotes('');
                      }}
                      className="rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f]"
                    >
                      Review
                    </button>
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
            <p className="text-sm text-gray-500">{selected.specialization}</p>
            <dl className="mt-4 space-y-3 text-sm text-gray-700">
              <div>
                <dt className="font-semibold text-gray-900">Email</dt>
                <dd>{selected.applicant.email}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">License</dt>
                <dd>{selected.licenseNumber}</dd>
              </div>
              {selected.licenseDocumentUrl ? (
                <div>
                  <dt className="font-semibold text-gray-900">Credential</dt>
                  <dd>
                    <a
                      href={`${API_BASE_URL}${selected.licenseDocumentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#ec6d13] hover:underline"
                    >
                      Open document
                    </a>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="font-semibold text-gray-900">Qualifications</dt>
                <dd className="whitespace-pre-wrap">{selected.qualifications}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Available days</dt>
                <dd>{selected.availableDays.join(', ')}</dd>
              </div>
            </dl>

            {selected.status === 'pending' ? (
              <>
                <label className="mt-4 block text-sm font-semibold text-gray-900">Admin notes</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
                <label className="mt-4 block text-sm font-semibold text-gray-900">
                  Rejection reason (required to decline)
                </label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
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
                    Decline
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
                className="mt-6 rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700"
                onClick={() => setSelected(null)}
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

export default function AdminVeterinariansHub(props: HubProps) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
        </div>
      }
    >
      <VeterinariansHubInner {...props} />
    </Suspense>
  );
}
