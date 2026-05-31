'use client';

import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ReceptionistSidebar from '@/components/receptionist/ReceptionistSidebar';
import { useAuth } from '@/context/AuthContext';

export default function ReceptionistShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex pt-28">
          <ReceptionistSidebar
            welcomeName={user?.fullName || 'Receptionist'}
            email={user?.email}
          />
          <main className="ml-64 min-h-[calc(100vh-112px)] flex-1 p-6 md:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
