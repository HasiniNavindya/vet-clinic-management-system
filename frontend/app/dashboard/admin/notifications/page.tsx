'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  broadcastAnnouncement,
  fetchAdminNotifications,
  fetchNotificationSystemStatus,
  runAdminReminders,
  type AdminNotification,
} from '@/lib/adminNotifications';

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    role: 'all',
    sendEmail: true,
  });
  const [broadcastBusy, setBroadcastBusy] = useState(false);
  const [reminderBusy, setReminderBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [n, sys] = await Promise.all([
        fetchAdminNotifications(token, { type: typeFilter || undefined, limit: 100 }),
        fetchNotificationSystemStatus(token),
      ]);
      setNotifications(n.notifications);
      setEmailConfigured(sys.emailConfigured);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, [token, typeFilter]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=admin');
    if (!isLoading && isAuthenticated && !hasRole('admin')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, hasRole, router]);

  useEffect(() => {
    if (isAuthenticated && hasRole('admin') && token) load();
  }, [isAuthenticated, hasRole, token, load]);

  const sendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setBroadcastBusy(true);
    try {
      const r = await broadcastAnnouncement(token, broadcastForm);
      alert(`Sent to ${r.sent} users (${r.audience})`);
      setBroadcastForm({ title: '', message: '', role: 'all', sendEmail: true });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Broadcast failed');
    } finally {
      setBroadcastBusy(false);
    }
  };

  const runReminders = async () => {
    if (!token) return;
    setReminderBusy(true);
    try {
      const r = await runAdminReminders(token);
      alert(
        `Reminders run.\nAppointments: ${r.appointment.sent} sent (${r.appointment.checked} checked).\nVaccinations: ${r.vaccination.sent} sent.`
      );
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setReminderBusy(false);
    }
  };

  if (isLoading || !isAuthenticated || !hasRole('admin')) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
        <Link href="/dashboard/admin" className="text-sm font-semibold text-[#ec6d13] hover:underline">
          ← Admin home
        </Link>
        <h1 className="mt-2 text-gray-900">Notification center</h1>
        <p className="text-gray-600">
          Appointment reminders, vaccination alerts, payment confirmations, and clinic-wide announcements.
          Email delivery requires SMTP configuration on the server.
        </p>

        <p className="mt-3 text-sm text-gray-500">
          Email:{' '}
          <span className={emailConfigured ? 'font-semibold text-green-700' : 'font-semibold text-amber-700'}>
            {emailConfigured ? 'Configured' : 'Not configured (in-app only)'}
          </span>
        </p>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <form
            onSubmit={sendBroadcast}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-gray-900">Send announcement</h3>
            <p className="mt-1 text-sm text-gray-500">Broadcast to all users or filter by role.</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500">Title</label>
                <input
                  required
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500">Message</label>
                <textarea
                  required
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm((f) => ({ ...f, message: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500">Audience</label>
                <select
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={broadcastForm.role}
                  onChange={(e) => setBroadcastForm((f) => ({ ...f, role: e.target.value }))}
                >
                  <option value="all">All users</option>
                  <option value="pet_owner">Pet owners</option>
                  <option value="doctor">Doctors</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={broadcastForm.sendEmail}
                  onChange={(e) => setBroadcastForm((f) => ({ ...f, sendEmail: e.target.checked }))}
                />
                Send email when configured
              </label>
              <button
                type="submit"
                disabled={broadcastBusy}
                className="w-full rounded-lg bg-[#ec6d13] py-2 text-sm font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-60"
              >
                {broadcastBusy ? 'Sending…' : 'Broadcast'}
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-gray-900">Automated reminders</h3>
            <p className="mt-2 text-sm text-gray-600">
              Run appointment reminders (upcoming visits) and vaccination due-date alerts now. These jobs also run
              on a schedule when the server cron is configured.
            </p>
            <button
              type="button"
              disabled={reminderBusy}
              onClick={runReminders}
              className="mt-4 rounded-lg border border-[#ec6d13] px-4 py-2 text-sm font-semibold text-[#ec6d13] hover:bg-orange-50 disabled:opacity-60"
            >
              {reminderBusy ? 'Running…' : 'Run reminder jobs now'}
            </button>
          </div>
        </div>

        <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-gray-900">Recent notifications</h3>
            <select
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All types</option>
              <option value="appointment_reminder">Appointment reminder</option>
              <option value="vaccination_alert">Vaccination alert</option>
              <option value="payment_confirmation">Payment confirmation</option>
              <option value="announcement">Announcement</option>
            </select>
          </div>

          {loading ? (
            <div className="mt-8 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">No notifications yet.</p>
          ) : (
            <ul className="mt-4 max-h-[28rem] divide-y divide-gray-100 overflow-y-auto text-sm">
              {notifications.map((n) => (
                <li key={n.id} className="py-3">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-semibold text-gray-900">{n.title}</span>
                    <span className="text-xs text-gray-500">{n.type}</span>
                  </div>
                  <p className="mt-1 text-gray-600">{n.message}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {n.userFullName || n.userEmail || `User #${n.userId}`}
                    {n.emailSent ? ' · email sent' : ''}
                    {n.createdAt ? ` · ${new Date(n.createdAt).toLocaleString()}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
    </div>
  );
}
