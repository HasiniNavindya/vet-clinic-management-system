'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ManageAppointmentsPanel from '@/components/receptionist/ManageAppointmentsPanel';
import { useAuth } from '@/context/AuthContext';

export default function ManageAppointmentsPage() {
  const router = useRouter();
  const { hasRole } = useAuth();

  useEffect(() => {
    if (hasRole('doctor')) {
      router.replace('/dashboard/doctor/appointments');
    } else if (hasRole('receptionist')) {
      router.replace('/dashboard/receptionist/appointments/manage');
    }
  }, [hasRole, router]);

  return (
    <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-32">
          <ManageAppointmentsPanel />
        </main>
      </div>
    </ProtectedRoute>
  );
}
