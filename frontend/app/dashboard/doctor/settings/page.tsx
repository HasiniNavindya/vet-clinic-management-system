'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DoctorAvatar from '@/components/doctor/DoctorAvatar';
import { useAuth } from '@/context/AuthContext';
import DoctorShell from '@/components/doctor/DoctorShell';
import { API_BASE_URL, authHeaders, fileToRawBase64 } from '@/lib/api';
import { doctorImageUrl } from '@/lib/appointments';

export default function DoctorSettingsPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, hasRole } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    address: '',
    bio: '',
    imageUrl: null as string | null,
    availableDays: [] as string[],
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [imageCacheKey, setImageCacheKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=doctor');
    if (!isLoading && user && !hasRole('doctor')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, user, hasRole, router]);

  const loadProfile = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`${API_BASE_URL}/api/doctor-applications/doctor/dashboard`, {
      headers: authHeaders(token),
    });
    const data = await res.json();
    if (res.ok && data.user && data.profile) {
      const url = data.profile.imageUrl || data.profile.image_url || null;
      setProfile({
        fullName: data.user.fullName || '',
        email: data.user.email || '',
        mobileNumber: data.user.mobileNumber || '',
        address: data.user.address || '',
        bio: data.profile.bio || '',
        imageUrl: url,
        availableDays: data.profile.availableDays || [],
      });
      setImageCacheKey(Date.now());
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  const onPhotoSelected = (file: File | null) => {
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setPhotoFile(file);
    setPhotoPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

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
      const body: Record<string, unknown> = {
        bio: profile.bio,
        availableDays: profile.availableDays,
        mobileNumber: profile.mobileNumber,
      };
      if (photoFile) {
        body.profileImageBase64 = await fileToRawBase64(photoFile);
        body.profileImageFilename = photoFile.name;
      }

      const res = await fetch(`${API_BASE_URL}/api/doctor-applications/doctor/profile`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      const url =
        data.imageUrl ||
        data.profile?.imageUrl ||
        data.profile?.image_url;
      if (url) {
        setProfile((p) => ({ ...p, imageUrl: url }));
        setImageCacheKey(Date.now());
      }

      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
      setPhotoPreviewUrl(null);
      setPhotoFile(null);

      await loadProfile();
      setMessage('Professional profile and availability saved.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const savedImageSrc = profile.imageUrl
    ? `${doctorImageUrl(profile.imageUrl)}?v=${imageCacheKey}`
    : null;
  const displayImage = photoPreviewUrl || savedImageSrc;

  return (
    <DoctorShell>
      <p className="font-sans text-xl font-semibold text-gray-900">Profile settings</p>
      <p className="mt-1 text-sm text-gray-600">
        Update your photo, bio, and the days you accept appointments.
      </p>

      {message ? (
        <p
          className={`mt-4 rounded-lg px-4 py-2 text-sm ${
            message.toLowerCase().includes('fail') || message.toLowerCase().includes('error')
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-800'
          }`}
        >
          {message}
        </p>
      ) : null}

      <div className="mt-8 space-y-8">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="font-semibold text-gray-900">Account</p>
          <div className="mt-4 space-y-4">
            <input
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
              placeholder="Full name"
              value={profile.fullName}
              onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
            />
            <input
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm"
              value={profile.email}
              disabled
            />
            <input
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
              placeholder="Mobile"
              value={profile.mobileNumber}
              onChange={(e) => setProfile((p) => ({ ...p, mobileNumber: e.target.value }))}
            />
            <textarea
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
              rows={2}
              placeholder="Address"
              value={profile.address}
              onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
            />
            <button
              type="button"
              disabled={saving}
              onClick={saveAccount}
              className="rounded-lg bg-[#ec6d13] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
            >
              Save account
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="font-semibold text-gray-900">Professional profile & availability</p>
          <p className="mt-1 text-xs text-gray-500">
            Pet owners see your photo on the veterinarians page. Choose the days you are available;
            booking uses clinic hours (30-minute slots).
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-gray-100 bg-gray-50">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={profile.fullName || 'Profile'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <DoctorAvatar
                  name={profile.fullName || 'Doctor'}
                  imageUrl={null}
                  className="h-full w-full"
                  textClassName="text-2xl"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Profile photo</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="mt-1 block text-sm text-gray-600"
                onChange={(e) => onPhotoSelected(e.target.files?.[0] || null)}
              />
              {photoFile ? (
                <p className="mt-1 text-xs text-gray-500">
                  Selected: {photoFile.name} — click Save to upload
                </p>
              ) : null}
            </div>
          </div>

          <textarea
            className="mt-4 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
            rows={4}
            placeholder="Bio shown to pet owners"
            value={profile.bio}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
          />

          <p className="mt-4 text-sm font-semibold text-gray-900">Available consultation days</p>
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
          {profile.availableDays.length === 0 ? (
            <p className="mt-2 text-xs text-amber-700">
              Select at least one day so pet owners can book with you.
            </p>
          ) : null}

          <button
            type="button"
            disabled={saving}
            onClick={saveClinical}
            className="mt-4 rounded-lg bg-[#ec6d13] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
          >
            Save profile & availability
          </button>
        </section>
      </div>
    </DoctorShell>
  );
}
