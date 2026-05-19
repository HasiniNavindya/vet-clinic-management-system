'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { userHasRole } from '@/lib/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Canonical role ids from config (user, admin, doctor, staff). Empty = any authenticated user. */
  allowedRoles?: string[];
  loginPath?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  loginPath = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(loginPath);
      return;
    }

    if (allowedRoles.length > 0 && !userHasRole(user?.role, allowedRoles)) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, loginPath, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-[#ec6d13] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (allowedRoles.length > 0 && !userHasRole(user?.role, allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}
