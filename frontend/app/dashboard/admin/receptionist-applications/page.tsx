'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import {
  ReceptionistApplication,
  approveReceptionistApplication,
  fetchReceptionistApplications,
  rejectReceptionistApplication,
} from '@/lib/receptionistApplications';

export default function AdminReceptionistApplicationsPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [applications, setApplications] = useState<ReceptionistApplication[]>([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReceptionistApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=admin');
    if (!isLoading && isAuthenticated && !hasRole('admin')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, hasRole, router]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await fetchReceptionistApplications(token, filter || undefined);
      setApplications(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async () => {
    if (!token || !selected) return;
    setActing(true);
    setError('');
    try {
      await approveReceptionistApplication(token, selected.id, adminNotes || undefined);
      setSelected(null);
      setAdminNotes('');
      await load();
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
      await rejectReceptionistApplication(token, selected.id, rejectReason.trim(), adminNotes || undefined);
      setSelected(null);
      setRejectReason('');
      setAdminNotes('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Rejection failed');
    } finally {
      setActing(false);
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
      <div className="container mx-auto max-w-5xl px-4 py-10 pt-28">
        <Link href="/dashboard/admin" className="text-sm font-semibold text-[#ec6d13] hover:underline">
          ← Admin home
        </Link>
        <h1 className="mt-4 text-gray-900">Receptionist applications</h1>
        <p className="mt-2 text-gray-600">
          Review front-desk registration requests before applicants can sign in.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {['pending', 'approved', 'rejected', 'all'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${
                filter === s ? 'bg-[#ec6d13] text-white' : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <div className="mt-10 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
          </div>
        ) : applications.length === 0 ? (
          <p className="mt-8 text-gray-600">No applications in this category.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {applications.map((app) => (
              <li
                key={app.id}
                className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-[#ec6d13]/40"
                onClick={() => setSelected(app)}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{app.applicant.fullName}</p>
                    <p className="text-sm text-gray-600">{app.applicant.email}</p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase text-gray-700">
                    {app.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {selected ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="text-gray-900">{selected.applicant.fullName}</h2>
              <p className="text-sm text-gray-600">{selected.applicant.email}</p>
              {selected.applicant.mobileNumber ? (
                <p className="mt-2 text-sm text-gray-600">Phone: {selected.applicant.mobileNumber}</p>
              ) : null}
              {selected.applicant.address ? (
                <p className="mt-1 text-sm text-gray-600">Address: {selected.applicant.address}</p>
              ) : null}

              <label className="mt-4 block text-sm font-semibold text-gray-900">Admin notes (optional)</label>
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
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={handleReject}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="mt-6 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
