'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  broadcastReceptionistNotification,
  runReceptionistReminders,
} from '@/lib/receptionist';

export default function ReceptionistSendNotificationPage() {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('user');
  const [sendEmail, setSendEmail] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    setError('');
    setResult('');
    try {
      const data = await broadcastReceptionistNotification(token, {
        title,
        message,
        role,
        sendEmail,
      });
      setResult(`Sent to ${data.sent} user(s) (${data.audience}).`);
      setTitle('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const runReminders = async () => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      const data = await runReceptionistReminders(token);
      setResult(`Reminder jobs completed: ${JSON.stringify(data)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="text-gray-900">Send notification</h1>
      <p className="mt-1 text-sm text-gray-600">
        Broadcast to pet owners or run automated appointment / vaccination reminders
      </p>

      <form onSubmit={send} className="mt-6 max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Audience</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
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
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
          />
          Also send email (if configured)
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {result ? <p className="text-sm text-green-700">{result}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-[#ec6d13] px-5 py-2.5 font-semibold text-white disabled:opacity-50"
        >
          Send broadcast
        </button>
      </form>

      <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6">
        <h2 className="font-semibold text-gray-900">Automated reminders</h2>
        <p className="mt-1 text-sm text-gray-600">
          Run appointment and vaccination reminder jobs for eligible pet owners.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={runReminders}
          className="mt-4 rounded-lg border border-[#ec6d13] px-4 py-2 text-sm font-semibold text-[#ec6d13] disabled:opacity-50"
        >
          Run reminder jobs
        </button>
      </div>
    </div>
  );
}
