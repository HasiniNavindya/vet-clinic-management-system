'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchDoctorApplications } from '@/lib/doctorApplications';
import { fetchReceptionistApplications } from '@/lib/receptionistApplications';
import AdminPageTabs, { useAdminTab } from '@/components/admin/AdminPageTabs';
import AdminUsersListPanel from '@/components/admin/AdminUsersListPanel';
import AdminVeterinariansHub from '@/components/admin/AdminVeterinariansHub';
import AdminReceptionHub from '@/components/admin/AdminReceptionHub';

function UsersHubInner() {
  const { token } = useAuth();
  const { active } = useAdminTab('users', ['users', 'veterinarians', 'reception']);
  const [vetPending, setVetPending] = useState(0);
  const [receptionPending, setReceptionPending] = useState(0);

  const loadPending = useCallback(async () => {
    if (!token) return;
    try {
      const [vets, reception] = await Promise.all([
        fetchDoctorApplications(token, 'pending'),
        fetchReceptionistApplications(token, 'pending'),
      ]);
      setVetPending(vets.length);
      setReceptionPending(reception.length);
    } catch {
      /* ignore */
    }
  }, [token]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const tabs = [
    { id: 'users', label: 'All users' },
    { id: 'veterinarians', label: 'Veterinarians', badge: vetPending },
    { id: 'reception', label: 'Reception', badge: receptionPending },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#ec6d13]/15 bg-gradient-to-br from-orange-50 via-white to-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-[#ec6d13]">People & access</p>
        <h1 className="mt-1 font-sans text-2xl font-bold text-gray-900">User management</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Accounts across the clinic, veterinarian profiles and applications, and reception team
          onboarding.
        </p>
        {(vetPending > 0 || receptionPending > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {vetPending > 0 ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
                {vetPending} vet application{vetPending === 1 ? '' : 's'} pending
              </span>
            ) : null}
            {receptionPending > 0 ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
                {receptionPending} reception application{receptionPending === 1 ? '' : 's'} pending
              </span>
            ) : null}
          </div>
        )}
      </div>

      <AdminPageTabs tabs={tabs} defaultTab="users" />

      {active === 'users' ? (
        <AdminUsersListPanel />
      ) : active === 'veterinarians' ? (
        <AdminVeterinariansHub embedded tabParam="vetTab" />
      ) : (
        <AdminReceptionHub embedded tabParam="receptionTab" />
      )}
    </div>
  );
}

export default function AdminUsersHub() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
        </div>
      }
    >
      <UsersHubInner />
    </Suspense>
  );
}
