'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminUsersHub from '@/components/admin/AdminUsersHub';

export default function AdminUsersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=admin');
    if (!isLoading && isAuthenticated && !hasRole('admin')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, hasRole, router]);

  if (isLoading || !isAuthenticated || !hasRole('admin')) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
      </div>
    );
  }

  return <AdminUsersHub />;
}
