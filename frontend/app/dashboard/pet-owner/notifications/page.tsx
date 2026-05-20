'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PetOwnerShell from '@/components/pet-owner/PetOwnerShell';
import {
  AppNotification,
  fetchNotifications,
  formatNotificationTime,
  markAllNotificationsRead,
  markNotificationRead,
  notificationTypeLabel,
} from '@/lib/notifications';

export default function NotificationCenterPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    const res = await fetchNotifications(token, filter === 'unread');
    if (res.ok) setItems(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [token, filter]);

  const handleRead = async (n: AppNotification) => {
    if (!token) return;
    if (!n.isRead) {
      await markNotificationRead(token, n.id);
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
      );
    }
    if (n.linkPath) router.push(n.linkPath);
  };

  const handleMarkAll = async () => {
    if (!token) return;
    await markAllNotificationsRead(token);
    setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
  };

  return (
    <PetOwnerShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Notification Center</h1>
          <p className="mt-1 text-gray-600">
            Appointment reminders, payment confirmations, and vaccination alerts
          </p>
        </div>
        <button
          type="button"
          onClick={handleMarkAll}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Mark all as read
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            filter === 'all' ? 'bg-[#ec6d13] text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            filter === 'unread' ? 'bg-[#ec6d13] text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200'
          }`}
        >
          Unread
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
          <p className="text-gray-600">No notifications in this view.</p>
          <Link
            href="/dashboard/pet-owner/health?tab=vaccinations"
            className="mt-4 inline-block font-semibold text-[#ec6d13]"
          >
            Check vaccination schedule →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => handleRead(n)}
                className={`w-full rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
                  !n.isRead ? 'ring-2 ring-orange-100' : ''
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-[#ec6d13]">
                    {notificationTypeLabel(n.type)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatNotificationTime(n.createdAt)}
                    {n.emailSent ? ' · Emailed' : ''}
                  </span>
                </div>
                <p className="mt-2 font-semibold text-gray-900">{n.title}</p>
                <p className="mt-1 text-sm text-gray-600">{n.message}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </PetOwnerShell>
  );
}
