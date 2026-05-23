'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { PublicRole } from '@/lib/roles';

export interface StaffRegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobileNumber: string;
  address: string;
}

interface StaffRegisterFormProps {
  role: PublicRole;
  onSubmit: (data: StaffRegisterFormData) => Promise<void>;
  isLoading: boolean;
  error: string;
}

export default function StaffRegisterForm({
  role,
  onSubmit,
  isLoading,
  error,
}: StaffRegisterFormProps) {
  const [form, setForm] = useState<StaffRegisterFormData>({
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
    if (form.password !== form.confirmPassword) {
      return;
    }
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="text-center mb-6">
        <h1 className="text-gray-900 mb-2">
          Register as {role.label}
        </h1>
        <p className="text-gray-600 text-sm">Create your clinic {role.label.toLowerCase()} account.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Full name</label>
        <input
          name="fullName"
          type="text"
          required
          value={form.fullName}
          onChange={handleChange}
          className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:outline-none"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
        <input
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:outline-none"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Mobile number</label>
        <input
          name="mobileNumber"
          type="tel"
          value={form.mobileNumber}
          onChange={handleChange}
          className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:outline-none"
          placeholder="Optional"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Address</label>
        <textarea
          name="address"
          rows={2}
          value={form.address}
          onChange={handleChange}
          className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:outline-none"
          placeholder="Optional"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            value={form.password}
            onChange={handleChange}
            className="block w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 text-gray-400 text-sm"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm password</label>
        <input
          name="confirmPassword"
          type="password"
          required
          value={form.confirmPassword}
          onChange={handleChange}
          className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:outline-none"
        />
        {form.confirmPassword && form.password !== form.confirmPassword && (
          <p className="text-red-600 text-xs mt-1">Passwords do not match</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || form.password !== form.confirmPassword}
        className="w-full bg-[#ec6d13] text-white py-3 rounded-lg font-semibold hover:bg-[#d65e0f] disabled:opacity-50"
      >
        {isLoading ? 'Creating account...' : `Create ${role.label} account`}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href={`/login?role=${role.id}`} className="text-[#ec6d13] font-semibold">
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
