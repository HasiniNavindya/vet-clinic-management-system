'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DoctorShell from '@/components/doctor/DoctorShell';
import { API_BASE_URL, authHeaders } from '@/lib/api';

export default function DoctorSettingsPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    address: '',
    bio: '',
    availableDays: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=doctor');
    if (!isLoading && user && !hasRole('doctor')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, user, hasRole, router]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/doctor-applications/doctor/dashboard`, {
      headers: authHeaders(token),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.user && data.profile) {
          setProfile({
            fullName: data.user.fullName || '',
            email: data.user.email || '',
            mobileNumber: data.user.mobileNumber || '',
            address: data.user.address || '',
            bio: data.profile.bio || '',
            availableDays: data.profile.availableDays || [],
          });
        }
      })
      .catch(() => {});
  }, [token]);

  const toggleDay = (day: string) => {
    setProfile((p) => ({
      ...p,
      availableDays: p.availableDays.includes(day)
        ? p.availableDays.filter((d) => d !== day)
        : [...p.availableDays, day],
    }));
  };

  const saveAccount = async () => {
    if (!token) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({
          fullName: profile.fullName,
          mobileNumber: profile.mobileNumber,
          address: profile.address,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setMessage('Account details saved.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const saveClinical = async () => {
    if (!token) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/doctor-applications/doctor/profile`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({
          bio: profile.bio,
          availableDays: profile.availableDays,
          mobileNumber: profile.mobileNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setMessage('Professional profile saved.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DoctorShell>
      <h1 className="text-gray-900">Profile settings</h1>
      <p className="mt-1 text-gray-600">Update your account and clinic availability.</p>

      {message && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">{message}</p>
      )}

      <div className="mt-8 space-y-8">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-gray-900">Account</h2>
          <div className="mt-4 space-y-4">
            <input
              className="w-full rounded-lg border border-gray-200 px-4 py-3"
              placeholder="Full name"
              value={profile.fullName}
              onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
            />
            <input
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3"
              value={profile.email}
              disabled
            />
            <input
              className="w-full rounded-lg border border-gray-200 px-4 py-3"
              placeholder="Mobile"
              value={profile.mobileNumber}
              onChange={(e) => setProfile((p) => ({ ...p, mobileNumber: e.target.value }))}
            />
            <textarea
              className="w-full rounded-lg border border-gray-200 px-4 py-3"
              rows={2}
              placeholder="Address"
              value={profile.address}
              onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
            />
            <button
              type="button"
              disabled={saving}
              onClick={saveAccount}
              className="rounded-lg bg-[#ec6d13] px-6 py-2.5 font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
            >
              Save account
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-gray-900">Professional profile</h2>
          <textarea
            className="mt-4 w-full rounded-lg border border-gray-200 px-4 py-3"
            rows={4}
            placeholder="Bio shown to pet owners"
            value={profile.bio}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
          />
          <p className="mt-4 text-sm font-semibold text-gray-900">Available days</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {weekDays.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  profile.availableDays.includes(day)
                    ? 'border-[#ec6d13] bg-orange-50 text-[#ec6d13]'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={saveClinical}
            className="mt-4 rounded-lg bg-[#ec6d13] px-6 py-2.5 font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
          >
            Save professional profile
          </button>
        </section>
      </div>
    </DoctorShell>
  );
}
