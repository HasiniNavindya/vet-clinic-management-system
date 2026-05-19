'use client';

import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PetOwnerSidebar from '@/components/pet-owner/PetOwnerSidebar';
import { useAuth } from '@/context/AuthContext';

type Props = {
  children: React.ReactNode;
  onAddPet?: () => void;
};

export default function PetOwnerShell({ children, onAddPet }: Props) {
  const { user } = useAuth();
  const welcomeName = user?.fullName || 'Pet Owner';

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex pt-28">
          <PetOwnerSidebar
            welcomeName={welcomeName}
            email={user?.email}
            onAddPet={onAddPet}
          />
          <main className="flex-1 p-4 md:ml-64 md:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
