'use client';

import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PetOwnerSidebar from '@/components/pet-owner/PetOwnerSidebar';
import { useAuth } from '@/context/AuthContext';

type Props = {
  children: React.ReactNode;
  avatarUrl?: string | null;
};

export default function PetOwnerShell({ children, avatarUrl }: Props) {
  const { user } = useAuth();
  const welcomeName = user?.fullName || 'Pet Owner';

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex pt-15">
          <PetOwnerSidebar
            welcomeName={welcomeName}
            email={user?.email}
            avatarUrl={avatarUrl}
          />
          <main className="ml-64 min-h-[calc(100vh-80px)] flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
