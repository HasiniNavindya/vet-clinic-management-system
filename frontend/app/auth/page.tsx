'use client';

import { Suspense } from 'react';
import UnifiedLoginForm from '@/components/auth/UnifiedLoginForm';

export default function AuthPortalPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 via-white to-orange-50 px-4 py-12 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
          </div>
        }
      >
        <UnifiedLoginForm />
      </Suspense>
    </div>
  );
}
