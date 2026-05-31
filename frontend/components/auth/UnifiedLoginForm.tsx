'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRoles } from '@/hooks/useRoles';
import RolePicker from '@/components/auth/RolePicker';
import SiteLogo from '@/components/layout/SiteLogo';
import { getRoleFromList, normalizeRoleId } from '@/lib/roles';

type Props = {
  title?: string;
  subtitle?: string;
};

export default function UnifiedLoginForm({
  title = 'Sign in',
  subtitle = 'Select your role, then enter your email and password.',
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { roles, loading: rolesLoading } = useRoles();

  const initialRole = normalizeRoleId(searchParams.get('role')) || roles[0]?.id || 'user';

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

  useEffect(() => {
    if (!rolesLoading && roles.length > 0) {
      const valid = roles.some((r) => r.id === formData.role);
      if (!valid) {
        setFormData((prev) => ({ ...prev, role: roles[0].id }));
      }
    }
  }, [rolesLoading, roles, formData.role]);

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

  return (
    <div className="w-full max-w-xl">
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <SiteLogo href="/" height={100} />
          <h1 className="mt-4 text-gray-900 sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-5" autoComplete="off">
          {/* Honeypot fields — reduce browser password manager autofill */}
          <input
            type="text"
            name="prevent_autofill_username"
            autoComplete="off"
            tabIndex={-1}
            aria-hidden
            className="pointer-events-none absolute h-0 w-0 opacity-0"
          />
          <input
            type="password"
            name="prevent_autofill_password"
            autoComplete="off"
            tabIndex={-1}
            aria-hidden
            className="pointer-events-none absolute h-0 w-0 opacity-0"
          />
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {!rolesLoading ? (
            <RolePicker
              roles={roles}
              value={formData.role}
              onChange={(roleId) => setFormData((prev) => ({ ...prev, role: roleId }))}
              disabled={isLoading}
            />
          ) : (
            <div className="flex justify-center py-6">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
            </div>
          )}

          <div>
            <label htmlFor="cpc-signin-email" className="mb-2 block text-sm font-semibold text-gray-900">
              Email
            </label>
            <input
              id="cpc-signin-email"
              name="cpc_signin_email"
              type="email"
              required
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-lpignore="true"
              data-1p-ignore
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ec6d13]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="cpc-signin-password" className="mb-2 block text-sm font-semibold text-gray-900">
              Password
            </label>
            <div className="relative">
              <input
                id="cpc-signin-password"
                name="cpc_signin_password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                data-lpignore="true"
                data-1p-ignore
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-3 pr-14 focus:outline-none focus:ring-2 focus:ring-[#ec6d13]"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 px-4 text-sm text-gray-500 hover:text-gray-800"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {selectedRole?.requiresDoctorApplication ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
              New doctors must{' '}
              <Link href="/register?role=doctor" className="font-semibold text-[#ec6d13] hover:underline">
                apply first
              </Link>{' '}
              and wait for admin approval before signing in.
            </p>
          ) : null}
          {selectedRole?.requiresReceptionistApplication ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
              New receptionists must{' '}
              <Link
                href="/register?role=receptionist"
                className="font-semibold text-[#ec6d13] hover:underline"
              >
                apply first
              </Link>{' '}
              and wait for admin approval before signing in.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading || rolesLoading}
            className="w-full rounded-lg bg-[#ec6d13] py-3.5 text-lg font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-8 space-y-3 text-center text-sm">
          <p className="text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href={`/register?role=${formData.role}`}
              className="font-semibold text-[#ec6d13] hover:text-[#d65e0f]"
            >
              Register as {selectedRole?.label || 'user'}
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
