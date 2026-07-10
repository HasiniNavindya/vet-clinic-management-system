'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminMarketplaceRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/admin/shop?tab=marketplace');
  }, [router]);

  return (
    <div className="flex justify-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
    </div>
  );
}
