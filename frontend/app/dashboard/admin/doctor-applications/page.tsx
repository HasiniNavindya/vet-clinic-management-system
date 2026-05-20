'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import { API_BASE_URL } from '@/lib/api';
import {
  DoctorApplication,
  approveDoctorApplication,
  fetchDoctorApplications,
  rejectDoctorApplication,
} from '@/lib/doctorApplications';

export default function AdminDoctorApplicationsPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [applications, setApplications] = useState<DoctorApplication[]>([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DoctorApplication | null>(null);
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
      const list = await fetchDoctorApplications(token, filter || undefined);
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
      await approveDoctorApplication(token, selected.id, adminNotes || undefined);
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
      await rejectDoctorApplication(token, selected.id, rejectReason.trim(), adminNotes || undefined);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto max-w-5xl px-4 py-8 pt-28">
        <h1 className="text-2xl font-bold text-gray-900">Doctor applications</h1>
        <p className="mt-1 text-gray-600">Review credentials and approve or decline veterinarians.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {['pending', 'approved', 'rejected', ''].map((s) => (
            <button
              key={s || 'all'}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                filter === s ? 'bg-[#ec6d13] text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200'
              }`}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
          </div>
        ) : applications.length === 0 ? (
          <p className="mt-8 text-gray-500">No applications found.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {applications.map((app) => (
              <li
                key={app.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-gray-900">{app.applicant.fullName}</p>
                  <p className="text-sm text-gray-600">
                    {app.specialization} · {app.applicant.email}
                  </p>
                  <p className="text-xs text-gray-500">License: {app.licenseNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      app.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : app.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {app.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(app);
                      setRejectReason('');
                      setAdminNotes('');
                    }}
                    className="text-sm font-semibold text-[#ec6d13] hover:underline"
                  >
                    Review
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900">{selected.applicant.fullName}</h2>
            <dl className="mt-4 space-y-2 text-sm text-gray-700">
              <div>
                <dt className="font-semibold text-gray-900">Email</dt>
                <dd>{selected.applicant.email}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Specialization</dt>
                <dd>{selected.specialization}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">License</dt>
                <dd>{selected.licenseNumber}</dd>
              </div>
              {selected.licenseDocumentUrl ? (
                <div>
                  <dt className="font-semibold text-gray-900">Uploaded credential</dt>
                  <dd>
                    <a
                      href={`${API_BASE_URL}${selected.licenseDocumentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#ec6d13] hover:underline"
                    >
                      Open document (new tab)
                    </a>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="font-semibold text-gray-900">Qualifications</dt>
                <dd className="whitespace-pre-wrap">{selected.qualifications}</dd>
              </div>
              {selected.education && (
                <div>
                  <dt className="font-semibold text-gray-900">Education</dt>
                  <dd>{selected.education}</dd>
                </div>
              )}
              {selected.yearsOfExperience != null && (
                <div>
                  <dt className="font-semibold text-gray-900">Experience</dt>
                  <dd>{selected.yearsOfExperience} years</dd>
                </div>
              )}
              {selected.bio && (
                <div>
                  <dt className="font-semibold text-gray-900">Bio</dt>
                  <dd>{selected.bio}</dd>
                </div>
              )}
              <div>
                <dt className="font-semibold text-gray-900">Available days</dt>
                <dd>{selected.availableDays.join(', ')}</dd>
              </div>
            </dl>

            {selected.status === 'pending' && (
              <>
                <label className="mt-4 block text-sm font-semibold text-gray-900">
                  Admin notes (optional)
                </label>
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
                  placeholder="e.g. License could not be verified"
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
            )}

            {selected.status !== 'pending' && (
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
      )}
    </div>
  );
}
