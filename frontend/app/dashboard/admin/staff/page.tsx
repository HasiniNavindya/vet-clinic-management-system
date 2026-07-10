'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const inner = searchParams.get('tab');
    const q = new URLSearchParams();
    q.set('tab', 'reception');
    if (inner === 'applications') q.set('receptionTab', 'applications');
    router.replace(`/dashboard/admin/users?${q.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex justify-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
    </div>
  );
}

export default function AdminReceptionRedirect() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
        </div>
      }
    >
      <RedirectInner />
    </Suspense>
  );
}
