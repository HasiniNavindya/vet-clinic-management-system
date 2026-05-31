'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchReceptionistNotificationHistory } from '@/lib/receptionist';

export default function ReceptionistNotificationHistoryPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<
    {
      id: number;
      type: string;
      title: string;
      message: string;
      userFullName?: string;
      createdAt: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetchReceptionistNotificationHistory(token)
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <h1 className="text-gray-900">Notification history</h1>
      <p className="mt-1 text-sm text-gray-600">Recent clinic notifications sent to users</p>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.length === 0 ? (
            <p className="text-gray-500">No notifications in history.</p>
          ) : (
            items.map((n) => (
              <li key={n.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-semibold text-gray-900">{n.title}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                <p className="mt-2 text-xs text-gray-500">
                  {n.type}
                  {n.userFullName ? ` · ${n.userFullName}` : ''}
                </p>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
