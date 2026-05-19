'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRoles } from '@/hooks/useRoles';
import RoleSelect from '@/components/auth/RoleSelect';
import { getRoleFromList, normalizeRoleId } from '@/lib/roles';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { roles, loading: rolesLoading } = useRoles();

  const initialRole = normalizeRoleId(searchParams.get('role')) || 'user';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: initialRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fromUrl = normalizeRoleId(searchParams.get('role'));
    if (fromUrl) {
      setFormData((prev) => ({ ...prev, role: fromUrl }));
    }
  }, [searchParams]);

  const selectedRole = getRoleFromList(roles, formData.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const redirectPath = await login(formData.email, formData.password, formData.role);
      router.push(redirectPath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(message);
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-md w-full">
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Welcome Back!</h1>
          <p className="text-gray-600">
            {selectedRole
              ? `Sign in to your ${selectedRole.label} account`
              : 'Login to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
          )}

          {!rolesLoading && (
            <RoleSelect
              roles={roles}
              value={formData.role}
              onChange={(roleId) => setFormData((prev) => ({ ...prev, role: roleId }))}
              label="Account type"
            />
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ec6d13] focus:outline-none"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 text-sm text-gray-500"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || rolesLoading}
            className="w-full bg-[#ec6d13] text-white py-3.5 rounded-lg font-semibold text-lg hover:bg-[#d65e0f] disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-2">
          <p className="text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href={`/register?role=${formData.role}`}
              className="text-[#ec6d13] hover:text-[#d65e0f] font-semibold"
            >
              Register as {selectedRole?.label || 'user'}
            </Link>
          </p>
          <p>
            <Link href="/auth" className="text-sm text-gray-500 hover:text-gray-800">
              Choose a different role
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="flex justify-center">
            <div className="animate-spin h-10 w-10 border-4 border-[#ec6d13] border-t-transparent rounded-full" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
