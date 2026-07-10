'use client';

import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuth } from '@/context/AuthContext';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex pt-20">
          <AdminSidebar welcomeName={user?.fullName || 'Admin'} email={user?.email} />
          <main className="min-h-[calc(100vh-5rem)] flex-1 p-4 md:ml-64 md:p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
