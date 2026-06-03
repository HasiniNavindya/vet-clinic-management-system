'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DoctorSidebar from '@/components/doctor/DoctorSidebar';
import { useAuth } from '@/context/AuthContext';
import { fetchDoctorDashboard } from '@/lib/doctorApplications';

type Props = {
  children: React.ReactNode;
};

export default function DoctorShell({ children }: Props) {
  const { user, token, hasRole } = useAuth();
  const [specialization, setSpecialization] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageCacheKey, setImageCacheKey] = useState(0);

  useEffect(() => {
    if (!token || !hasRole('doctor')) return;
    fetchDoctorDashboard(token)
      .then((d) => {
        const data = d as {
          profile?: { specialization?: string; imageUrl?: string; image_url?: string };
        };
        setSpecialization(data.profile?.specialization || '');
        setImageUrl(data.profile?.imageUrl || data.profile?.image_url || null);
        setImageCacheKey(Date.now());
      })
      .catch(() => {});
  }, [token, hasRole]);

  const welcomeName = user?.fullName || 'Doctor';

  return (
    <ProtectedRoute allowedRoles={['doctor']} loginPath="/login?role=doctor">
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex pt-15">
          <DoctorSidebar
            welcomeName={welcomeName}
            specialization={specialization}
            imageUrl={imageUrl}
            imageCacheKey={imageCacheKey}
          />
          <main className="ml-64 min-h-[calc(100vh-80px)] flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
