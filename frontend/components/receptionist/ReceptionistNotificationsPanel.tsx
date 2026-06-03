'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  broadcastReceptionistNotification,
  deleteReceptionistNotification,
  fetchReceptionistNotificationHistory,
  runReceptionistReminders,
} from '@/lib/receptionist';
import {
  formatNotificationTime,
  markAllNotificationsRead,
  markNotificationRead,
  notificationTypeLabel,
  type AppNotification,
  type NotificationType,
} from '@/lib/notifications';

type PanelTab = 'send' | 'history';

function parseTab(value: string | null): PanelTab {
  return value === 'history' ? 'history' : 'send';
}

export default function ReceptionistNotificationsPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get('tab'));
  const { token } = useAuth();

  const setTab = (next: PanelTab) => {
    const q = next === 'send' ? '' : '?tab=history';
    router.replace(`/dashboard/receptionist/notifications${q}`, { scroll: false });
  };

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('user');
  const [sendEmail, setSendEmail] = useState(false);
  const [sendBusy, setSendBusy] = useState(false);
  const [sendResult, setSendResult] = useState('');
  const [sendError, setSendError] = useState('');

  const [history, setHistory] = useState<AppNotification[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'unread'>('all');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadHistory = useCallback(async () => {
    if (!token) return;
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const items = await fetchReceptionistNotificationHistory(token, {
        unreadOnly: historyFilter === 'unread',
        limit: 100,
      });
      setHistory(
        items.map((n) => ({
          id: n.id,
          userId: 0,
          type: n.type as NotificationType,
          title: n.title,
          message: n.message,
          linkPath: n.linkPath,
          isRead: n.isRead,
          emailSent: false,
          createdAt: n.createdAt,
        }))
      );
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : 'Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  }, [token, historyFilter]);

  useEffect(() => {
    if (tab === 'history') loadHistory();
  }, [tab, loadHistory]);

  const sendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSendBusy(true);
    setSendError('');
    setSendResult('');
    try {
      const data = await broadcastReceptionistNotification(token, {
        title,
        message,
        role,
        sendEmail,
      });
      setSendResult(`Sent to ${data.sent} user(s) (${data.audience}).`);
      setTitle('');
      setMessage('');
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSendBusy(false);
    }
  };

  const runReminders = async () => {
    if (!token) return;
    setSendBusy(true);
    setSendError('');
    try {
      const data = await runReceptionistReminders(token);
      setSendResult(`Reminder jobs completed: ${JSON.stringify(data)}`);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSendBusy(false);
    }
  };

  const removeNotification = async (id: number) => {
    if (!token) return;
    if (!confirm('Delete this notification from your inbox?')) return;
    setDeletingId(id);
    try {
      await deleteReceptionistNotification(token, id);
      setHistory((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpen = async (n: AppNotification) => {
    if (!token) return;
    if (!n.isRead) {
      await markNotificationRead(token, n.id);
      setHistory((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
      );
    }
    if (n.linkPath) router.push(n.linkPath);
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    await markAllNotificationsRead(token);
    setHistory((prev) => prev.map((x) => ({ ...x, isRead: true })));
  };

  return (
    <div>
      <p className="font-sans text-xl font-semibold text-gray-900">Notifications</p>
      <p className="mt-0.5 text-sm text-gray-500">
        Send clinic broadcasts or view alerts sent to your reception desk inbox
      </p>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab('send')}
          className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
            tab === 'send'
              ? 'border-b-2 border-[#ec6d13] text-[#ec6d13]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Send notification
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
            tab === 'history'
              ? 'border-b-2 border-[#ec6d13] text-[#ec6d13]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Notification history
        </button>
      </div>

      {tab === 'send' ? (
        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <p className="text-sm text-gray-600">
            Broadcast a message to all pet owners or all doctors. These appear in their notification
            centers, not in your history tab.
          </p>

          <form onSubmit={sendBroadcast} className="mt-4 max-w-lg space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Audience</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="user">All pet owners</option>
                <option value="doctor">All doctors</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
              />
              Also send email (if configured)
            </label>
            {sendError ? <p className="text-sm text-red-600">{sendError}</p> : null}
            {sendResult ? <p className="text-sm text-green-700">{sendResult}</p> : null}
            <button
              type="submit"
              disabled={sendBusy}
              className="rounded-lg bg-[#ec6d13] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
            >
              Send broadcast
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Automated reminders</h3>
            <p className="mt-1 text-sm text-gray-600">
              Run appointment and vaccination reminder jobs for eligible pet owners.
            </p>
            <button
              type="button"
              disabled={sendBusy}
              onClick={runReminders}
              className="mt-3 rounded-lg border border-[#ec6d13] px-4 py-2 text-sm font-semibold text-[#ec6d13] hover:bg-orange-50 disabled:opacity-50"
            >
              Run reminder jobs
            </button>
          </div>
        </section>
      ) : null}

      {tab === 'history' ? (
        <section className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-600">
                Alerts sent <strong>to you</strong> as reception staff — billing ready, shop
                updates, and other desk notifications. Pet owner alerts are not listed here.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Mark all read
              </button>
              <button
                type="button"
                onClick={loadHistory}
                disabled={historyLoading}
                className="text-sm font-semibold text-[#ec6d13] hover:text-[#d65e0f] disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setHistoryFilter('all')}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                historyFilter === 'all'
                  ? 'bg-[#ec6d13] text-white'
                  : 'bg-white text-gray-700 ring-1 ring-gray-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('unread')}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                historyFilter === 'unread'
                  ? 'bg-[#ec6d13] text-white'
                  : 'bg-white text-gray-700 ring-1 ring-gray-200'
              }`}
            >
              Unread
            </button>
          </div>

          {historyError ? <p className="text-sm text-red-600">{historyError}</p> : null}
          {historyLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
            </div>
          ) : history.length === 0 ? (
            <p className="rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">
              No notifications in your reception inbox yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {history.map((n) => (
                <li
                  key={n.id}
                  className={`flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm ${
                    n.isRead ? 'border-gray-100' : 'border-[#ec6d13]/30 bg-orange-50/30'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleOpen(n)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-gray-900">{n.title}</span>
                      <span className="text-xs text-gray-500">
                        {formatNotificationTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      {notificationTypeLabel(n.type)}
                      {!n.isRead ? (
                        <span className="ml-2 font-semibold text-[#ec6d13]">· New</span>
                      ) : null}
                    </p>
                    {n.linkPath ? (
                      <span className="mt-1 inline-block text-xs font-semibold text-[#ec6d13]">
                        Open related page →
                      </span>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === n.id}
                    onClick={() => removeNotification(n.id)}
                    className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === n.id ? 'Deleting…' : 'Delete'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
