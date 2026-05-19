'use client';

import { useEffect, useState } from 'react';
import { FALLBACK_ROLES, fetchPublicRoles, type PublicRole } from '@/lib/roles';

export function useRoles() {
  const [roles, setRoles] = useState<PublicRole[]>(FALLBACK_ROLES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPublicRoles().then((data) => {
      if (!cancelled) {
        setRoles(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const registerableRoles = roles.filter((r) => r.selfRegisterable);

  return { roles, registerableRoles, loading };
}
