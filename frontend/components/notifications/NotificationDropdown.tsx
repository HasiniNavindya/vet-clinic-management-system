'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  AppNotification,
  fetchNotifications,
  fetchUnreadCount,
  formatNotificationTime,
  markAllNotificationsRead,
  markNotificationRead,
  notificationTypeLabel,
} from '@/lib/notifications';

export default function NotificationDropdown() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const [listRes, countRes] = await Promise.all([
      fetchNotifications(token, false),
      fetchUnreadCount(token),
    ]);
    if (listRes.ok) setItems(listRes.data.slice(0, 8));
    if (countRes.ok) setUnreadCount(countRes.data.count);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) load();
  }, [isAuthenticated, token, load]);

  useEffect(() => {
    if (!open) return;
    load();
    const onDocClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, load]);

  const handleItemClick = async (n: AppNotification) => {
    if (!token) return;
    if (!n.isRead) {
      await markNotificationRead(token, n.id);
      setUnreadCount((c) => Math.max(0, c - 1));
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
      );
    }
    setOpen(false);
    if (n.linkPath) router.push(n.linkPath);
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    await markAllNotificationsRead(token);
    setUnreadCount(0);
    setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
  };

  if (!isAuthenticated) return null;

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-white hover:bg-white/10"
        aria-label="Notifications"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#ec6d13]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-[#ec6d13] hover:text-[#d65e0f]"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="p-4 text-center text-sm text-gray-500">Loading…</p>
            ) : items.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">No notifications yet</p>
            ) : (
              <ul>
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(n)}
                      className={`w-full border-b border-gray-50 px-4 py-3 text-left hover:bg-orange-50 ${
                        !n.isRead ? 'bg-orange-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold uppercase text-[#ec6d13]">
                          {notificationTypeLabel(n.type)}
                        </p>
                        <span className="shrink-0 text-[10px] text-gray-400">
                          {formatNotificationTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm font-semibold text-gray-900">{n.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-600">{n.message}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-gray-100 p-3">
            <Link
              href="/dashboard/pet-owner/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-semibold text-[#ec6d13] hover:text-[#d65e0f]"
            >
              View all notifications
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
