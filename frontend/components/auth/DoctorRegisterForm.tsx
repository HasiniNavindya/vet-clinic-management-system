'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fileToRawBase64 } from '@/lib/api';
import {
  DoctorRegisterPayload,
  fetchDoctorApplicationMeta,
} from '@/lib/doctorApplications';

interface DoctorRegisterFormProps {
  onSubmit: (data: DoctorRegisterPayload) => Promise<void>;
  isLoading: boolean;
  error: string;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('Could not read file'));
    r.readAsDataURL(file);
  });
}

const STEPS = ['Account', 'Personal', 'Credentials', 'Review'];

export default function DoctorRegisterForm({
  onSubmit,
  isLoading,
  error,
}: DoctorRegisterFormProps) {
  const [step, setStep] = useState(0);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState('');
  const [meta, setMeta] = useState<{ specializations: string[] } | null>(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    mobileNumber: '',
    address: '',
    emergencyContact: '',
    specialization: '',
    licenseNumber: '',
    qualifications: '',
    education: '',
    yearsOfExperience: '',
    bio: '',
  });

  useEffect(() => {
    fetchDoctorApplicationMeta()
      .then((m) => setMeta({ specializations: m.specializations }))
      .catch(() =>
        setMeta({
          specializations: [
            'General Practice',
            'Surgeon',
            'Cardiologist',
            'Dermatologist',
            'Nutritionist',
            'Allergist',
            'Therapist',
          ],
        })
      );
  }, []);

  const update = (patch: Partial<typeof form>) => setForm((p) => ({ ...p, ...patch }));

  const canNext = () => {
    if (step === 0) {
      return (
        form.email &&
        form.password.length >= 6 &&
        form.password === form.confirmPassword
      );
    }
    if (step === 1) return !!form.fullName;
    if (step === 2) {
      return (
        form.specialization &&
        form.licenseNumber &&
        form.qualifications.trim() &&
        !!licenseFile
      );
    }
    return true;
  };

  const handleSubmit = async () => {
    setLocalError('');
    if (!licenseFile) {
      setLocalError('Please upload your license or credential document.');
      return;
    }
    try {
      const licenseDocumentBase64 = await readFileAsDataUrl(licenseFile);
      let profileImageBase64: string | undefined;
      let profileImageFilename: string | undefined;
      if (profileFile) {
        profileImageBase64 = await fileToRawBase64(profileFile);
        profileImageFilename = profileFile.name;
      }
      await onSubmit({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        mobileNumber: form.mobileNumber || undefined,
        address: form.address || undefined,
        emergencyContact: form.emergencyContact || undefined,
        specialization: form.specialization,
        licenseNumber: form.licenseNumber,
        qualifications: form.qualifications,
        education: form.education || undefined,
        yearsOfExperience: form.yearsOfExperience
          ? Number(form.yearsOfExperience)
          : undefined,
        bio: form.bio || undefined,
        availableDays: [],
        licenseDocumentBase64,
        licenseDocumentFilename: licenseFile.name,
        profileImageBase64,
        profileImageFilename,
      });
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Could not read uploaded files');
    }
  };

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {localError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {localError}
        </div>
      ) : null}

      <div className="text-center">
        <p className="font-sans text-xl font-semibold text-gray-900">Veterinarian application</p>
        <p className="mt-2 text-sm text-gray-600">
          Submit your credentials for admin verification. After approval, set your availability in your
          doctor profile.
        </p>
      </div>

      <div className="flex gap-1">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-[#ec6d13]' : 'bg-gray-200'}`}
            title={label}
          />
        ))}
      </div>
      <p className="text-center text-xs text-gray-500">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      {step === 0 && (
        <div className="space-y-4">
          <Field label="Email" required>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update({ email: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Password" required>
            <input
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => update({ password: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Confirm password" required>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update({ confirmPassword: e.target.value })}
              className={inputClass}
            />
            {form.confirmPassword && form.password !== form.confirmPassword ? (
              <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
            ) : null}
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Field label="Full name" required>
            <input
              value={form.fullName}
              onChange={(e) => update({ fullName: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Mobile number">
            <input
              type="tel"
              value={form.mobileNumber}
              onChange={(e) => update({ mobileNumber: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Address">
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => update({ address: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Emergency contact">
            <input
              value={form.emergencyContact}
              onChange={(e) => update({ emergencyContact: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Field label="Profile photo">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={fileInputClass}
              onChange={(e) => setProfileFile(e.target.files?.[0] || null)}
            />
            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG, or WebP. Shown to pet owners on the veterinarians page.
            </p>
          </Field>
          <Field label="Specialization" required>
            <select
              value={form.specialization}
              onChange={(e) => update({ specialization: e.target.value })}
              className={inputClass}
            >
              <option value="">Select specialization</option>
              {(meta?.specializations || []).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Veterinary license number" required>
            <input
              value={form.licenseNumber}
              onChange={(e) => update({ licenseNumber: e.target.value })}
              className={inputClass}
              placeholder="License / registration ID"
            />
          </Field>
          <Field label="License or proof document" required>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
              className={fileInputClass}
              onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
            />
            <p className="mt-1 text-xs text-gray-500">PDF or image, max 8MB. For admin verification only.</p>
          </Field>
          <Field label="Qualifications & certifications" required>
            <textarea
              rows={4}
              value={form.qualifications}
              onChange={(e) => update({ qualifications: e.target.value })}
              className={inputClass}
              placeholder="Degrees, board certifications, years of practice..."
            />
          </Field>
          <Field label="Education">
            <input
              value={form.education}
              onChange={(e) => update({ education: e.target.value })}
              className={inputClass}
              placeholder="e.g. DVM, University name"
            />
          </Field>
          <Field label="Years of experience">
            <input
              type="number"
              min={0}
              value={form.yearsOfExperience}
              onChange={(e) => update({ yearsOfExperience: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Professional bio">
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => update({ bio: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
          <p>
            <span className="font-semibold text-gray-900">Name:</span> {form.fullName}
          </p>
          <p>
            <span className="font-semibold text-gray-900">Email:</span> {form.email}
          </p>
          <p>
            <span className="font-semibold text-gray-900">Specialization:</span> {form.specialization}
          </p>
          <p>
            <span className="font-semibold text-gray-900">Profile photo:</span> {profileFile?.name || '—'}
          </p>
          <p>
            <span className="font-semibold text-gray-900">License file:</span> {licenseFile?.name || '—'}
          </p>
          <p className="text-xs text-gray-500">
            Availability (days and times) can be configured in your doctor profile after admin approval.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 rounded-lg border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
        ) : null}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            disabled={!canNext()}
            onClick={() => setStep((s) => s + 1)}
            className="flex-1 rounded-lg bg-[#ec6d13] py-3 font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            disabled={isLoading}
            onClick={handleSubmit}
            className="flex-1 rounded-lg bg-[#ec6d13] py-3 font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
          >
            {isLoading ? 'Submitting...' : 'Submit application'}
          </button>
        )}
      </div>

      <p className="text-center text-sm text-gray-600">
        Already approved?{' '}
        <Link href="/login?role=doctor" className="font-semibold text-[#ec6d13]">
          Log in
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-900">
        {label}
        {required ? ' *' : ''}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ec6d13]';

const fileInputClass =
  'block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-[#ec6d13] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#d65e0f]';
