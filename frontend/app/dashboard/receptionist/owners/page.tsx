'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/** Legacy route — redirects to combined Pets page. */
export default function ReceptionistOwnersRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', 'owners');
    router.replace(`/dashboard/receptionist/pets?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
    </div>
  );
}
