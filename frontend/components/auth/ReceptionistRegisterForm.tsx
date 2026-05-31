'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { PublicRole } from '@/lib/roles';

export interface ReceptionistRegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobileNumber: string;
  address: string;
}

interface ReceptionistRegisterFormProps {
  role: PublicRole;
  onSubmit: (data: ReceptionistRegisterFormData) => Promise<void>;
  isLoading: boolean;
  error: string;
}

export default function ReceptionistRegisterForm({
  role,
  onSubmit,
  isLoading,
  error,
}: ReceptionistRegisterFormProps) {
  const [form, setForm] = useState<ReceptionistRegisterFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return;
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 text-center">
        <h1 className="mb-2 text-gray-900">Register as {role.label}</h1>
        <p className="text-sm text-gray-600">
          Submit your application for front-desk access. An administrator must approve your account
          before you can sign in.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">Full name</label>
        <input
          name="fullName"
          type="text"
          required
          value={form.fullName}
          onChange={handleChange}
          className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ec6d13]"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">Email</label>
        <input
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ec6d13]"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">Mobile number</label>
        <input
          name="mobileNumber"
          type="tel"
          value={form.mobileNumber}
          onChange={handleChange}
          className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ec6d13]"
          placeholder="Optional"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">Address</label>
        <textarea
          name="address"
          rows={2}
          value={form.address}
          onChange={handleChange}
          className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ec6d13]"
          placeholder="Optional"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">Password</label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            value={form.password}
            onChange={handleChange}
            className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#ec6d13]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 text-sm text-gray-400"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-900">Confirm password</label>
        <input
          name="confirmPassword"
          type="password"
          required
          value={form.confirmPassword}
          onChange={handleChange}
          className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ec6d13]"
        />
        {form.confirmPassword && form.password !== form.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || form.password !== form.confirmPassword}
        className="w-full rounded-lg bg-[#ec6d13] py-3 font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
      >
        {isLoading ? 'Submitting application...' : 'Submit application'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already approved?{' '}
        <Link href={`/login?role=${role.id}`} className="font-semibold text-[#ec6d13]">
          Log in
        </Link>
      </p>
      <p className="text-center text-sm text-gray-600">
        <Link href="/auth" className="text-gray-500 hover:text-gray-800">
          Choose a different role
        </Link>
      </p>
    </form>
  );
}
