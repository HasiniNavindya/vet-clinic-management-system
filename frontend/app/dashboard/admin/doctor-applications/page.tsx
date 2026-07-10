'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDoctorApplicationsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/admin/users?tab=veterinarians&vetTab=applications');
  }, [router]);

  return (
    <div className="flex justify-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
    </div>
  );
}
